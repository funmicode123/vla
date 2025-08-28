const {request} = require('express');
const conversationService = require('../services/conversationService')

const createConversation = async (req, res) => {
  try {
    const { sessionId, hostId, participants } = req.body;

    const conversation = await conversationService.createConversation({ sessionId, hostId, participants });

    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
};

module.exports = { createConversation };
