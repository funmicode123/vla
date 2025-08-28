import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getMySessionsThunk, 
  deleteSessionThunk, 
  updateSessionThunk,
  clearError,
  joinSessionThunk
} from '../../../store/slices/sessionSlice';

const SessionsOverview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    mySessions, 
    loading, 
    error, 
    isDeleting, 
    isUpdating 
  } = useSelector(state => state.session);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getMySessionsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreateSession = () => {
    navigate('/createSession');
  };

  const handleJoinSession = async (session) => {
    try {
      const result = await dispatch(joinSessionThunk(session.id)).unwrap();
      if (result && result.session) {
        toast.success('Successfully joined the session!');
        navigate(`/session/${result.session.id || result.session.sessionId}`);
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to join session. Please try again.');
    }
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Session link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await dispatch(deleteSessionThunk(sessionId)).unwrap();
        toast.success('Session deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete session');
      }
    }
  };

  const handleRefreshSessions = () => {
    dispatch(getMySessionsThunk());
    toast.info('Refreshing sessions...');
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };



  const filteredSessions = mySessions.filter(session => {
    const matchesSearch = session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getSessionStatus(session) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingSessions = filteredSessions.filter(s => getSessionStatus(s) === 'upcoming');
  const activeSessions = filteredSessions.filter(s => getSessionStatus(s) === 'active');
  const completedSessions = filteredSessions.filter(s => getSessionStatus(s) === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your virtual learning sessions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefreshSessions}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleCreateSession}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="space-y-8">
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                Active Sessions ({activeSessions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onCopyLink={handleCopyLink}
                    onDelete={handleDeleteSession}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                Upcoming Sessions ({upcomingSessions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onCopyLink={handleCopyLink}
                    onDelete={handleDeleteSession}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Sessions */}
          {completedSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                Completed Sessions ({completedSessions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onCopyLink={handleCopyLink}
                    onDelete={handleDeleteSession}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Video className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first session.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleCreateSession}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionCard = ({ session, onJoin, onCopyLink, onDelete, isDeleting }) => {
  const getSessionStatus = (session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const status = getSessionStatus(session);
  const sessionLink = `${window.location.origin}/join/${session.id}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onCopyLink(sessionLink)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(session.id)}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {session.topic}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {session.description || 'No description provided'}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(session.startTime)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{session.maxParticipants || 'Unlimited'} participants</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {status === 'active' && (
            <button
              onClick={() => onJoin(session)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Join Now
            </button>
          )}
          {status === 'upcoming' && (
            <button
              onClick={() => onJoin(session)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </button>
          )}
          {status === 'completed' && (
            session.recordingUrl ? (
              <a
                href={session.recordingUrl}
                className="text-blue-600 underline mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Recording
              </a>
            ) : (
              <span className="text-gray-500 mt-2 inline-block">No recording available</span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsOverview; 