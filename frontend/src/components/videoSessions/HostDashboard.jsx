import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';

const HostDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [engagementData, setEngagementData] = useState([]);

  // TODO: Replace with real host id/email from auth
  const hostId = localStorage.getItem('streamUserId') || '';

  // Fetch all sessions for the host
  useEffect(() => {
    if (!hostId) return;
    api.get(`/api/v1/sessions?host=${hostId}`)
      .then(res => setSessions(res.data.data || []));
  }, [hostId]);

  // Fetch engagement data for selected session
  useEffect(() => {
    if (!selectedSession) return;
    api.get(`/api/v1/engagement?sessionId=${selectedSession.sessionId || selectedSession.id}`)
      .then(res => {
        const logs = res.data.data;
        // Group and aggregate as before
        const byUser = {};
        logs.forEach(log => {
          const user = log.user_id?.email || log.user_id || 'Unknown';
          if (!byUser[user]) byUser[user] = [];
          byUser[user].push(log);
        });
        const allData = Object.entries(byUser).map(([name, arr]) => ({
          name,
          avg: arr.reduce((a, b) => a + (b.averageAttention || b.attentionScore || 0), 0) / arr.length
        }));
        setEngagementData(allData);
      });
  }, [selectedSession]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Host Dashboard</h2>
      <div className="mb-4">
        <label>Select Session: </label>
        <select onChange={e => setSelectedSession(sessions.find(s => (s.sessionId || s.id) === e.target.value))}>
          <option value="">-- Select --</option>
          {sessions.map(s => (
            <option key={s.sessionId || s.id} value={s.sessionId || s.id}>
              {s.topic} ({new Date(s.startTime).toLocaleString()})
            </option>
          ))}
        </select>
      </div>
      {engagementData.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Participant Engagement (Average Attention)</h4>
          <div style={{ width: 400 }}>
            {engagementData.map((p) => (
              <div key={p.name} className="mb-2">
                <div className="flex justify-between"><span>{p.name}</span><span>{(p.avg * 100).toFixed(1)}%</span></div>
                <div style={{ background: '#e5e7eb', borderRadius: 4, height: 18 }}>
                  <div style={{ width: `${p.avg * 100}%`, background: '#3b82f6', height: 18, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard; 