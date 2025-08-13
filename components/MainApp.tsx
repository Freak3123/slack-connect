"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MessageComposer, Recipient } from "@/components/MessageComposer";
import {
  MessagesList,
  ScheduledMessage,
  SentMessage,
} from "@/components/MessagesList";

interface MainAppProps {
  backendUrl: string;
  teamId: string;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Team {
  teamId: string;
  teamName: string;
}

interface ScheduledMessageAPI {
  id?: string;
  scheduled_message_id?: string;
  text?: string;
  message?: string;
  post_at?: number;
  scheduledTime?: string;
  status?: string;
}

interface SentMessageAPI {
  id?: string;
  ts?: string;
  text?: string;
  message?: string;
  sentTime?: string;
}

interface Recipients {
  id: string;
  name: string;
  type?: "user" | "channel";
}

export default function MainApp({
  backendUrl,
  teamId,
  setIsConnected,
}: MainAppProps) {
  const [team, setTeam] = useState<Team>({ teamId: "", teamName: "" });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedRecipientName, setSelectedRecipientName] = useState("");
  const [selectedRecipientType, setSelectedRecipientType] = useState<
    "channel" | "user"
  >("channel");

  const [message, setMessage] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch team
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await axios.get("/api/teams");
        if (res.data.teams?.length > 0) {
          setTeam(res.data.teams[0]);
        }
      } catch (error) {
        console.error("Failed to fetch team", error);
      }
    }
    fetchTeam();
  }, []);

  // Fetch recipients
  useEffect(() => {
    if (!team.teamId) return;
    async function fetchRecipients() {
      setLoading(true);
      try {
        const res = await axios.get("/api/recipient", {
          params: { teamId: team.teamId },
        });

        const channels = (res.data.channels || []).map((c: Recipients) => ({
          ...c,
          type: "channel" as const,
        }));
        const users = (res.data.users || []).map((u: Recipients) => ({
          ...u,
          type: "user" as const,
        }));

        const combinedRecipients = [...channels, ...users];
        setRecipients(combinedRecipients);

        if (combinedRecipients.length > 0) {
          setSelectedRecipientId(combinedRecipients[0].id);
          setSelectedRecipientName(combinedRecipients[0].name);
          setSelectedRecipientType(combinedRecipients[0].type || "channel");
        }
      } catch (error) {
        console.error("Failed to fetch recipients", error);
        setRecipients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipients();
  }, [team]);

  // Fetch messages
  useEffect(() => {
    if (!selectedRecipientId || !team.teamId) {
      setScheduledMessages([]);
      setSentMessages([]);
      return;
    }
    fetchMessages(selectedRecipientId, selectedRecipientType);
  }, [selectedRecipientId, selectedRecipientType, team.teamId]);

  const fetchMessages = async (recipientId: string, type: string) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/messages", {
        params: {
          id: recipientId,
          type,
          teamId: team.teamId, // ✅ added teamId
        },
      });
      const data = res.data;
      console.log(data);

      setScheduledMessages(
        (data.scheduled || []).map((msg: ScheduledMessageAPI) => ({
          id: msg.scheduled_message_id || msg.id,
          targetId: recipientId,
          recipientName: selectedRecipientName,
          recipientType: selectedRecipientType,
          message: msg.text || msg.message,
          scheduledTime: msg.post_at
            ? new Date(msg.post_at * 1000).toISOString()
            : msg.scheduledTime,
          status: msg.status || "pending",
        }))
      );

      setSentMessages(
        (data.history || data.sent || []).map((msg: SentMessageAPI) => ({
          id: msg.ts || msg.id,
          targetId: recipientId,
          recipientName: selectedRecipientName,
          recipientType: selectedRecipientType,
          message: msg.text || msg.message,
          sentTime: msg.ts
            ? new Date(Number(msg.ts.split(".")[0]) * 1000).toISOString()
            : msg.sentTime,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setScheduledMessages([]);
      setSentMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientChange = (id: string) => {
    const recipient = recipients.find((r) => r.id === id);
    if (!recipient) return;
    setSelectedRecipientId(recipient.id);
    setSelectedRecipientName(recipient.name);
    setSelectedRecipientType(recipient.type || "channel");
  };

  const cancelMessage = async (messageId: string, targetId: string) => {
    setLoading(true);
    try {
      await axios.delete("/api/delete-schedule", {
        data: { scheduled_message_id: messageId, channelId: targetId },
        headers: { "Content-Type": "application/json" },
      });
      await fetchMessages(selectedRecipientId, selectedRecipientType);
    } catch (error) {
      console.error("Failed to cancel scheduled message:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (immediate: boolean) => {
    if (!selectedRecipientId || !message.trim()) {
      alert("Please select a recipient and enter a message.");
      return;
    }

    setLoading(true);
    try {
      if (immediate) {
        await axios.post("/api/direct-msg", {
          targetId: selectedRecipientId,
          message,
          teamId: team.teamId,
        });
      } else {
        if (!scheduledDateTime) {
          alert("Please select a date and time to schedule the message.");
          setLoading(false);
          return;
        }

        const timestamp = Math.floor(
          new Date(scheduledDateTime).getTime() / 1000
        );

        await axios.post("/api/schedule", {
          targetId: selectedRecipientId,
          message,
          time: timestamp,
          teamId: team.teamId,
        });
      }

      setMessage("");
      setScheduledDateTime("");
      await fetchMessages(selectedRecipientId, selectedRecipientType);
    } catch (error) {
      console.error("Failed to send/schedule message:", error);
      alert("Failed to send/schedule message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/logout/teamId` );
      setIsConnected(false);
      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  if (!team.teamId) {
    return <p>Loading team data...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Slack Connect
          </h1>
          <p className="text-gray-600">Team: {team.teamName}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MessageComposer
            recipients={recipients}
            selectedRecipientId={selectedRecipientId}
            selectedRecipientName={selectedRecipientName}
            selectedRecipientType={selectedRecipientType}
            onRecipientChange={handleRecipientChange}
            message={message}
            onMessageChange={setMessage}
            scheduledDateTime={scheduledDateTime}
            onScheduledDateTimeChange={setScheduledDateTime}
            loading={loading}
            onSend={sendMessage}
          />
          <MessagesList
            selectedRecipientId={selectedRecipientId}
            selectedRecipientName={selectedRecipientName}
            selectedRecipientType={selectedRecipientType}
            scheduledMessages={scheduledMessages}
            sentMessages={sentMessages}
            onCancelMessage={cancelMessage}
          />
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
}
