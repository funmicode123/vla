import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h1 style={{ fontSize: '4rem', color: '#e53e3e' }}>403</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</h2>
      <p>You do not have permission to access this page or session.</p>
      <button
        style={{
          marginTop: '2rem',
          padding: '0.8rem 1.5rem',
          background: '#3182ce',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
        onClick={() => navigate('/dashboard')}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
