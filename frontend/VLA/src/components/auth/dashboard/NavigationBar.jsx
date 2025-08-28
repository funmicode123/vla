import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavigationBar() {
  const navigate = useNavigate();
  return (
    <nav className="w-full bg-gray-900 text-white py-4 px-8 flex gap-6 items-center mb-8 shadow">
      <button
        onClick={() => navigate('/dashboard')}
        className="font-bold text-lg hover:text-blue-400 focus:outline-none"
      >
        Dashboard
      </button>
      <button
        onClick={() => navigate('/sessions')}
        className="font-bold text-lg hover:text-blue-400 focus:outline-none"
      >
        My Sessions
      </button>
    </nav>
  );
} 