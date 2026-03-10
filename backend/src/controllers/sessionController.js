const sessionService = require('../services/session.service');
const {AppError} = require('../utils/customErrors');
const CreateSessionResponse = require('../dto/response/session/createSession.response');
const validateHost =require('../utils/sessionUtils')
const {generateInviteToken}=require('../utils/generateInviteToken');
const SessionInvite=require('../models/sessionInvite');
const Session=require('../models/session');
const {serverClient, generateStreamToken, sanitizeUserId, sanitizeEmail, upsertStreamUser}=require('../config/stream');
const EngagementLogRepository = require('../repositories/engagementLog.repository');
const User = require('../models/user');

exports.createSession = async (req, res, next) => {
  try {
    const sessionData = {
      ...req.body,
      host: req.user.id 
    };
    const session = await sessionService.createSession(sessionData);

    const token = await generateInviteToken(session.id, req.user.email);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const sessionUrl = `${baseUrl}/join/${token}`;
    
    console.log('🔗 Generated session URL:', sessionUrl);
    console.log('🔗 Token:', token);

    const channelId =  session.channelId;
    const sanitizedEmail = sanitizeEmail(req.user.email);
    const sanitizedUserId = sanitizeUserId(req.user.id);
    // const streamToken = await generateStreamToken(channelId, sanitizedEmail, sanitizedUserId);
    await upsertStreamUser({
      id: sanitizedUserId,
      name: req.user.name || sanitizedUserId,
      email: req.user.email || sanitizedEmail,
    });
    const channel = serverClient.channel('messaging', channelId, {
      name: session.topic,
      members: [sanitizedUserId], 
      created_by_id: sanitizedUserId,
    });
    let chatError = null;
    try {
      await channel.create();
    } catch (err) {
      if (err.code === 16) {
        console.warn('Stream channel already exists:', channelId);
      }
      else{
      console.error('Stream Chat error:', err.message);
      chatError = 'We could not set up chat for this session. You can still use video and other features.';
      }
    }

    const streamToken = generateStreamToken(sanitizedUserId);

    res.status(201).json({
      status: chatError ? 'partial_success' : 'success',
      message: chatError || 'Session created successfully',
      data: {
        ...CreateSessionResponse.from(session).toJSON(),
        link: sessionUrl,
        streamToken: streamToken,
        chatChannelId: channelId,
        chatError: chatError || undefined
      },
    });
  } catch (err) {
    next(err);
  }
};


exports.joinViaInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const email = req.user.email; 

    const invite = await SessionInvite.findOne({ token });
    if (!invite) return res.status(404).json({ message: 'Invalid invite token' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ message: 'Invite token has expired' });

    const session = await Session.findOne({ id: invite.sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (!session.attendeeList.includes(email)) {
      session.attendeeList.push(email);
      await session.save();
    }

    const channelId = session.channelId;
    const channel = serverClient.channel('messaging', channelId);

    try {
      await channel.create(); 
    } catch (err) {
      if (err.code !== 16) {
        console.error('Stream Chat error:', err.message);
      }
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sanitizedUserId = sanitizeUserId(user.id);

    try {
      await channel.addMembers([sanitizedUserId]);
    } catch (err) {
      if (!err.message.includes('already a member')) {
        console.warn('Stream addMembers error:', err.message);
      }
    }

    const streamToken = generateStreamToken(user.id);

    res.status(200).json({
      status: 'success',
      message: 'User successfully joined the session via invite link',
      data: {
        session,
        sessionId: session.id,
        streamToken,
        chatChannelId: channelId,
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllSessions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.host) filter.host = req.query.host;
    if (req.query.upcoming) filter.startTime = { $gt: new Date() };
    
    const sessions = await sessionService.getAllSessions(filter);
    res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: CreateSessionResponse.fromList(sessions)
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: CreateSessionResponse.from(session).toJSON()
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);

    validateHost(session, req.user.id); 
    
    const updated = await sessionService.updateSession(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: CreateSessionResponse.from(updated).toJSON()
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteSession = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    validateHost(session, req.user.id);
    
    await sessionService.deleteSession(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getMySessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getAllSessions({ host: req.user.id });
    res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: CreateSessionResponse.fromList(sessions)
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessionSummary = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const logs = await EngagementLogRepository.findBySession(sessionId);

    const byUser = {};
    logs.forEach(log => {
      const user = log.user_id?.email || log.user_id || 'Unknown';
      if (!byUser[user]) byUser[user] = [];
      byUser[user].push(log);
    });

    const engagementSummary = Object.entries(byUser).map(([name, arr]) => ({
      name,
      avg: arr.reduce((a, b) => a + (b.averageAttention || b.attentionScore || 0), 0) / arr.length,
      count: arr.length
    }));

    res.json({
      success: true,
      data: {
        session,
        engagementSummary
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.checkSessionPermission = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const userEmail = req.user.email?.toLowerCase().trim();
    const userId = req.user.id;

    const session = await Session.findOne({ id: sessionId });

    if (!session) {
      return res.status(404).json({ allowed: false, message: 'Session not found' });
    }

    const isHost = session.host === userId;
    const isAttendee = session.attendeeList.includes(userEmail);

    return res.status(200).json({
      allowed: isHost || isAttendee,
      role: isHost ? 'host' : isAttendee ? 'attendee' : 'none'
    });
  } catch (err) {
    console.error('Permission check failed:', err);
    return res.status(500).json({ allowed: false, message: 'Internal server error' });
  }
};

