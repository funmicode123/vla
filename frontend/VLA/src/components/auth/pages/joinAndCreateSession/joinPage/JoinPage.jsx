import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { joinSessionThunk } from '../../../../../store/slices/sessionSlice';
import { Link, ArrowLeft, Users, Clock, AlertCircle } from 'lucide-react';
import Card from '../../../../ui/Card';
import Button from '../../../../ui/Button';
import Input from '../../../../ui/Input';
import { toast } from 'react-toastify';

const JoinPage = () => {
  const [link, setLink] = useState('');
  const [isValidLink, setIsValidLink] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { isJoining } = useSelector((state) => state.session || {});

  // Auto-join if token is provided in URL
  useEffect(() => {
    if (token) {
      setLink(token);
      validateLink(token);
      // Auto-join after a short delay
      setTimeout(() => {
        handleJoinWithToken(token);
      }, 1000);
    }
  }, [token]);

  const extractLinkCode = (url) => {
    try {
      // Handle different URL formats
      let cleanUrl = url.trim();
      
      // If it's just a code, return it directly
      if (!cleanUrl.includes('http') && !cleanUrl.includes('/')) {
        return cleanUrl;
      }
      
      // If it's a full URL, extract the last part
      if (cleanUrl.includes('http')) {
        const urlObj = new URL(cleanUrl);
        const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
        return pathSegments[pathSegments.length - 1];
      }
      
      // If it's a relative path, extract the last part
      const pathSegments = cleanUrl.split('/').filter(segment => segment);
      return pathSegments[pathSegments.length - 1];
    } catch {
      return null;
    }
  };

  const validateLink = (input) => {
    const code = extractLinkCode(input);
    setIsValidLink(!!code && code.length > 0);
    return code;
  };

  const handleLinkChange = (e) => {
    const value = e.target.value;
    setLink(value);
    validateLink(value);
  };

  const handleJoinWithToken = async (token) => {
    try {
      const result = await dispatch(joinSessionThunk(token)).unwrap();
      
      if (result && result.session) {
        toast.success('Successfully joined the session!');
        navigate(`/session/${result.session.id || result.session.sessionId}`);
      }
    } catch (error) {
      console.error('Join error:', error);
      toast.error(error?.message || 'Failed to join session. Please check the link and try again.');
    }
  };

  const handleJoin = async () => {
    const linkCode = extractLinkCode(link);
    
    if (!linkCode) {
      toast.error('Invalid session link. Please check the URL and try again.');
      return;
    }

    try {
      const result = await dispatch(joinSessionThunk(linkCode)).unwrap();
      
      if (result && result.session) {
        toast.success('Successfully joined the session!');
        navigate(`/session/${result.session.id || result.session.sessionId}`);
      }
    } catch (error) {
      console.error('Join error:', error);
      toast.error(error?.message || 'Failed to join session. Please check the link and try again.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLink(text);
      validateLink(text);
    } catch (err) {
      toast.error('Failed to read from clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/createSession')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Session Options
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Session</h1>
          <p className="text-gray-600">Enter the session link to join a virtual learning session</p>
        </div>

        <Card>
          <div className="space-y-6">
            {/* Link Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Link or Code
              </label>
              <div className="space-y-3">
                <Input
                  value={link}
                  onChange={handleLinkChange}
                  placeholder="Paste session link or enter session code..."
                  leftIcon={Link}
                  fullWidth
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePaste}
                    className="flex-1"
                  >
                    Paste from Clipboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLink('');
                      setIsValidLink(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Link Validation */}
            {link && (
              <div className={`p-3 rounded-lg border ${
                isValidLink 
                  ? 'bg-success-50 border-success-200 text-success-700' 
                  : 'bg-error-50 border-error-200 text-error-700'
              }`}>
                <div className="flex items-center">
                  {isValidLink ? (
                    <Link className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-sm">
                    {isValidLink 
                      ? 'Valid session link detected' 
                      : 'Invalid session link format'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Join Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleJoin}
              disabled={!isValidLink || isJoining}
              loading={isJoining}
              fullWidth
            >
              {isJoining ? 'Joining Session...' : 'Join Session'}
            </Button>

            {/* Help Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">How to join:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Copy the session link from your instructor or host</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Paste it in the field above or enter the session code</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Click "Join Session" to enter the virtual classroom</span>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Session Features:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Real-time video</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Attention tracking</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Link className="h-4 w-4 mr-2" />
                  <span>Interactive chat</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Engagement alerts</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JoinPage;
