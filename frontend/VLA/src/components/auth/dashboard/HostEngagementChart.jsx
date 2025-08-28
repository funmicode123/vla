import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HostEngagementChart({ data }) {
  if (!data || data.length === 0) return <div className="text-gray-400 text-sm">No engagement data available.</div>;
  return (
    <div>
      <h4 className="font-bold mb-2 text-gray-700">Participant Engagement (Average Attention)</h4>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`} />
            <Tooltip formatter={v => `${Math.round(v * 100)}%`} />
            <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 