import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import NavigationBar from '../dashboard/NavigationBar';

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
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            ← Back to Home
          </button>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Dashboard
          </h2>
          <div className="w-[100px]"></div> {/* Spacer for alignment */}
        </div>
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
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <div
                key={session.id}
                className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Upcoming'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                    {session.topic}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                    {session.description || 'No description provided'}
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={() => navigate(`/sessions/join/${session.id}`)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Enter Session
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                      <Suspense fallback={<div className="text-xs text-gray-400">Loading summary...</div>}>
                        <SessionSummary
                          session={session}
                          summary={engagementSummaries[session.id] ? { type: 'host', data: engagementSummaries[session.id] } : null}
                          user={user}
                        />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-xl font-medium">No sessions scheduled yet.</p>
            <button
              onClick={() => navigate('/sessions')}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Go to Sessions to create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
