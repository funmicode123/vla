import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar, ArrowRight, Plus, Link } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';

const JoinAndCreateSession = () => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate('/join');
  };

  const handleHost = () => {
    navigate('/host');
  };

  const sessionTypes = [
    {
      id: 'lecture',
      title: 'Lecture',
      description: 'Traditional lecture format with presentation and Q&A',
      icon: Video,
      features: ['Screen sharing', 'Attention tracking', 'Recording', 'Chat']
    },
    {
      id: 'discussion',
      title: 'Discussion',
      description: 'Interactive group discussion with breakout rooms',
      icon: Users,
      features: ['Breakout rooms', 'Real-time chat', 'Hand raising', 'Collaboration']
    },
    {
      id: 'workshop',
      title: 'Workshop',
      description: 'Hands-on workshop with collaborative activities',
      icon: Calendar,
      features: ['File sharing', 'Whiteboard', 'Group activities', 'Progress tracking']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Learning Session
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create engaging learning experiences or join existing sessions with real-time attention tracking and analytics.
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Join Session */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleJoin}>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Join Session</h2>
              <p className="text-gray-600 mb-6">
                Enter a session link to join an existing learning session
              </p>
              <Button variant="primary" size="lg" fullWidth>
                Join Meeting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Host Session */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleHost}>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Host Session</h2>
              <p className="text-gray-600 mb-6">
                Create a new learning session and invite participants
              </p>
              <Button variant="success" size="lg" fullWidth>
                Host Meeting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Session Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Session Types
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sessionTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <type.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Highlight */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Advanced Features
            </h3>
            <div className="grid md:grid-cols-4 gap-6 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                  <Video className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium">Real-time Video</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-success-600" />
                </div>
                <span className="font-medium">Attention Tracking</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-warning-600" />
                </div>
                <span className="font-medium">Analytics</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center mb-2">
                  <Link className="h-5 w-5 text-error-600" />
                </div>
                <span className="font-medium">Easy Sharing</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JoinAndCreateSession;