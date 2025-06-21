import React, { useState } from 'react';

const isDev = process.env.NODE_ENV === 'development';

const DevToolsNote = () => {
  const [dismissed, setDismissed] = useState(false);
  if (!isDev || dismissed) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#222',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 8,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <span>
        Download the <a href="https://reactjs.org/link/react-devtools" target="_blank" rel="noopener noreferrer" style={{color:'#90cdf4',textDecoration:'underline'}}>React DevTools</a> for a better development experience.
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          marginLeft: 16,
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: 18
        }}
        aria-label="Dismiss React DevTools note"
      >
        ×
      </button>
    </div>
  );
};

export default DevToolsNote;
