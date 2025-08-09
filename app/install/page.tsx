// pages/index.tsx
import React from 'react';

export default function Home() {
  // Your backend server URL, adjust if needed
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Install Slack App</h1>
      <a href={`${backendUrl}/slack/install`}>
        <button style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          Install Slack App
        </button>
      </a>
    </div>
  );
}
