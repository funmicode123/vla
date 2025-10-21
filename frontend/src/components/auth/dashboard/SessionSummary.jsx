import React from 'react';
import HostEngagementChart from './HostEngagementChart';
import ParticipantEngagementTable from './ParticipantEngagementTable';

export default function SessionSummary({ session, summary, user }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-2 text-gray-800 flex flex-wrap items-center gap-2">
        {session.topic}
        <span className="text-gray-400 text-sm font-normal">({new Date(session.startTime).toLocaleString()})</span>
      </h3>
      {summary?.type === 'host' ? (
        <HostEngagementChart data={summary.data} />
      ) : summary?.type === 'participant' ? (
        <ParticipantEngagementTable data={summary.data} />
      ) : (
        <div className="text-gray-400 text-sm">Loading summary...</div>
      )}
    </div>
  );
} 