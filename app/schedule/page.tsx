'use client';

import { useState } from 'react';

export default function SendOrScheduleMessagePage() {
  const [type, setType] = useState<'dm' | 'channel'>('dm');
  const [slackId, setSlackId] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [time, setTime] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const endpoint = schedule ? '/api/schedule' : '/api/send-message';
    const payload: any = { type, slackId, message };

    if (schedule && time) payload.time = time;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setResponse(schedule ? '📅 Message scheduled!' : '✅ Message sent!');
    } else {
      setResponse(`❌ Error: ${data.error}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Send or Schedule Slack Message</h1>

      <label className="block mb-2">
        Send Type:
        <select
          className="border p-2 ml-2"
          value={type}
          onChange={(e) => setType(e.target.value as 'dm' | 'channel')}
        >
          <option value="dm">Direct Message</option>
          <option value="channel">Channel Message</option>
        </select>
      </label>

      <input
        className="border p-2 w-full mb-2"
        placeholder="User ID or Channel ID"
        value={slackId}
        onChange={(e) => setSlackId(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <label className="block mb-2">
        <input
          type="checkbox"
          className="mr-2"
          checked={schedule}
          onChange={(e) => setSchedule(e.target.checked)}
        />
        Schedule this message
      </label>

      {schedule && (
        <input
          type="datetime-local"
          className="border p-2 w-full mb-4"
          onChange={(e) => setTime(e.target.value)}
        />
      )}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {schedule ? 'Schedule Message' : 'Send Message'}
      </button>

      {response && <p className="mt-4">{response}</p>}
    </div>
  );
}
