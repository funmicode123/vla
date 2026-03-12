import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavigationBar() {
  const navigate = useNavigate();
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-4 sm:px-8 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center mb-8 sticky top-0 z-40">
      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
        <span className="font-extrabold text-xl tracking-tight text-gray-900">VLA</span>
      </div>
      <div className="flex gap-6 items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="font-semibold text-gray-600 hover:text-blue-600 transition-colors text-sm uppercase tracking-wide"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/sessions')}
          className="font-semibold text-gray-600 hover:text-blue-600 transition-colors text-sm uppercase tracking-wide"
        >
          My Sessions
        </button>
      </div>
    </nav>
  );
} 