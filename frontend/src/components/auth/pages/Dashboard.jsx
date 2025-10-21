import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import NavigationBar from '../dashboard/NavigationBar';
// Lazy load SessionSummary
const SessionSummary = React.lazy(() => import('../dashboard/SessionSummary'));

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [engagementSummaries, setEngagementSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('streamUser'));
    setUser(storedUser);
    api.get('/sessions?host=me') 
      .then(res => {
        setSessions(res.data.data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user || !Array.isArray(sessions) || sessions.length === 0) return;

    sessions.forEach((session) => {
      if (!session || !session.id) return;

      api
        .get(`/sessions/${session.id}/summary`)
        .then((res) => {
          const summary = res?.data?.data?.engagementSummary ?? null;
          setEngagementSummaries((prev) => ({
            ...prev,
            [session.id]: summary,
          }));
        })
        .catch((err) => {
          console.error(`Error fetching summary for session ${session.id}:`, err);
          setEngagementSummaries((prev) => ({
            ...prev,
            [session.id]: null,
          }));
        });
    });
  }, [user, sessions]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h2>
        {/* User Profile Section */}
        {user && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
            <img
              src={user?.profilePic || '/default-avatar.png'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div className="flex-1">
              <div className="text-lg font-bold">{user?.name || user?.email}</div>
              <div className="text-gray-500">{user?.email}</div>
            </div>
            <button
              onClick={() => navigate('/settings/privacy')}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-32 text-lg text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {sessions.map(session => (
              <div key={session.id} className="mb-8">
                <div className="bg-white rounded-lg shadow p-4 mb-2">
                  <div className="font-semibold text-lg">{session.topic}</div>
                  <div className="text-gray-500 text-sm">{session.description || 'No description provided'}</div>
                  <div className="text-gray-400 text-xs">Session ID: {session.id}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-2">Engagement Summary</div>
                  {engagementSummaries[session.id] ? (
                    <ul className="list-disc pl-6">
                      {engagementSummaries[session.id].map((user, idx) => (
                        <li key={user.name || idx}>
                          <span className="font-medium">{user.name}:</span> Avg Attention: {(user.avg * 100).toFixed(1)}% (Entries: {user.count})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400">No engagement data available.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
