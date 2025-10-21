import React from 'react';

export default function ParticipantEngagementTable({ data }) {
  if (!data || data.length === 0)
    return <div className="text-gray-400 text-sm">No participant data available.</div>;

  return (
    <div className="overflow-x-auto">
      <h4 className="font-bold mb-2 text-gray-700">Participant Engagement Details</h4>
      <table className="min-w-full border border-gray-200 text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Attention</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={i} className="border-t border-gray-200">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{Math.round(p.attention * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
