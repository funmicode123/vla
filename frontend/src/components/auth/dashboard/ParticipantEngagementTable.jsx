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
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <td className="p-3 font-medium text-gray-900">{p.name || 'Anonymous User'}</td>
              <td className="p-3 text-right">
                <span className={`px-2 py-1 rounded-full font-bold ${p.avg > 0.7 ? 'bg-green-100 text-green-700' : p.avg > 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {Math.round(p.avg * 100)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
