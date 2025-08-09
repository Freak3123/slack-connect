"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type ScheduledMsg = {
  scheduled_message_id: string;
  text: string;
  post_at: number;
};

type SentMsg = {
  ts: string;
  text: string;
};

export type MessagesResponse = {
  scheduled?: ScheduledMsg[];
  history?: SentMsg[];
};
interface ScheduleBody {
  targetId: string;
  message: string;
  time?: number;
}

export default function Home() {
  const [targetId, setTargetId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendTime, setSendTime] = useState("");
  const [scheduled, setScheduled] = useState<ScheduledMsg[]>([]);
  const [history, setHistory] = useState<SentMsg[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch messages from backend API
  const fetchMessages = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/messages`, {
        params: { id: targetId },
      });
      console.log("Fetched messages:", res.data.scheduled);
      setScheduled(res.data.scheduled || []);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("❌ Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel scheduled message
  const cancelMessage = async (id: string, channel: string) => {
    try {
      await axios.delete(`/api/delete-schedule`, {
        data: { scheduled_message_id: id, channelId: channel },
        headers: { "Content-Type": "application/json" },
      });
      fetchMessages();
    } catch (err) {
      console.error("❌ Failed to delete message:", err);
    }
  };

  // Send or schedule message
  const scheduleMessage = async () => {
    try {
      const hasTime = Boolean(sendTime);
      const body: ScheduleBody = {
        targetId,
        message: messageText,
      };

      if (hasTime) {
        body.time = Math.floor(new Date(sendTime).getTime() / 1000);
      }

      const endpoint = hasTime ? "/api/schedule" : "/api/direct-msg";

      await axios.post(endpoint, body, {
        headers: { "Content-Type": "application/json" },
      });

      setMessageText("");
      setSendTime("");
      fetchMessages();
    } catch (err) {
      console.error("❌ Failed to send/schedule message:", err);
    }
  };

  // Auto-refresh countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduled((msgs) => [...msgs]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refetch whenever target changes
  useEffect(() => {
    if (targetId) fetchMessages();
  }, [targetId]);

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Slack Message Dashboard</h1>

      {/* Target ID Input */}
      <input
        className="border p-2 w-full"
        placeholder="Enter Slack Channel or User ID (C01ABC... or U01ABC...)"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
      />

      {/* New Message Form */}
      <div className="border p-4 rounded space-y-2">
        <textarea
          className="border p-2 w-full"
          placeholder="Message text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border p-2 w-full"
          value={sendTime}
          onChange={(e) => setSendTime(e.target.value)}
        />
        <button
          onClick={scheduleMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {sendTime ? "Schedule Message" : "Send Now"}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Scheduled Messages */}
          <div>
            <h2 className="text-xl font-semibold">⏳ Scheduled Messages</h2>
            <ul className="space-y-2">
              {scheduled.map((msg) => {
                const secondsLeft = Math.max(
                  0,
                  Math.floor((msg.post_at * 1000 - Date.now()) / 1000)
                );
                return (
                  <li
                    key={msg.scheduled_message_id}
                    className="border p-3 rounded flex justify-between items-center"
                  >
                    <div>
                      <p>{msg.text}</p>
                      <p className="text-sm text-gray-600">
                        Scheduled for:{" "}
                        {new Date(msg.post_at * 1000).toLocaleString()} · ⏱️{" "}
                        {secondsLeft}s left
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        cancelMessage(msg.scheduled_message_id, targetId)
                      }
                      className="text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </li>
                );
              })}
              {scheduled.length === 0 && (
                <p className="text-gray-500">No scheduled messages.</p>
              )}
            </ul>
          </div>

          {/* Sent Message History */}
          <div>
            <h2 className="text-xl font-semibold mt-6">
              📜 Sent Message History
            </h2>
            <ul className="space-y-2">
              {history.map((msg, i) => (
                <li key={msg.ts + i} className="border p-3 rounded">
                  <p>{msg.text}</p>
                  <p className="text-sm text-gray-600">
                    Sent at:{" "}
                    {new Date(
                      Number(msg.ts.split(".")[0]) * 1000
                    ).toLocaleString()}
                  </p>
                </li>
              ))}
              {history.length === 0 && (
                <p className="text-gray-500">No recent messages.</p>
              )}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}
