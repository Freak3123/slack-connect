"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MessageComposer, Recipient } from "@/components/MessageComposer";
import {
  MessagesList,
  ScheduledMessage,
  SentMessage,
} from "@/components/MessagesList";

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

export default function MainApp() {
  // Only one team
  const [team, setTeam] = useState<Team>({ teamId: "", teamName: "" });


  // Recipients & selection
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedRecipientName, setSelectedRecipientName] = useState("");
  const [selectedRecipientType, setSelectedRecipientType] = useState<
    "channel" | "user"
  >("channel");

  // Messages and UI states
  const [message, setMessage] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch single team on mount
  useEffect(() => {
    async function fetchTeam() {
      try {
        console.log("hhjshd")
        const res = await axios.get("/api/teams",{});
        console.log("-----",res.data)
      } catch (error) {
        console.error("Failed to fetchjhg team", error);
      }
    }
    fetchTeam();
  }, []);

  // Fetch recipients once team is set
  useEffect(() => {
    if (!team.teamId) return;

    async function fetchRecipients() {
      setLoading(true);
      try {
        const res = await axios.get("/api/recipient", {
          params: { teamId: team.teamId },
        });

        // Combine channels and users with type
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
        } else {
          setSelectedRecipientId("");
          setSelectedRecipientName("");
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

  // Fetch messages when selectedRecipientId or type changes
  useEffect(() => {
    if (!selectedRecipientId) {
      setScheduledMessages([]);
      setSentMessages([]);
      return;
    }

    async function fetchMessages() {
      setLoading(true);
      try {
        const res = await axios.get("/api/messages", {
          params: { id: selectedRecipientId, type: selectedRecipientType },
        });
        const data = res.data;

        setScheduledMessages(
          (data.scheduled || []).map((msg: ScheduledMessageAPI) => ({
            id: msg.scheduled_message_id || msg.id,
            targetId: selectedRecipientId,
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
            targetId: selectedRecipientId,
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
    }

    fetchMessages();
  }, [selectedRecipientId, selectedRecipientType]);

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
      // Refresh messages
      if (selectedRecipientId) {
        // reuse fetchMessages logic or call fetchMessages here
        const res = await axios.get("/api/messages", {
          params: { id: selectedRecipientId, type: selectedRecipientType },
        });
        // update state same as above (for brevity)
        setScheduledMessages(
          (res.data.scheduled || []).map((msg: ScheduledMessageAPI) => ({
            id: msg.scheduled_message_id || msg.id,
            targetId: selectedRecipientId,
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
          (res.data.history || res.data.sent || []).map((msg: SentMessageAPI) => ({
            id: msg.ts || msg.id,
            targetId: selectedRecipientId,
            recipientName: selectedRecipientName,
            recipientType: selectedRecipientType,
            message: msg.text || msg.message,
            sentTime: msg.ts
              ? new Date(Number(msg.ts.split(".")[0]) * 1000).toISOString()
              : msg.sentTime,
          }))
        );
      }
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
        });
      } else {
        if (!scheduledDateTime) {
          alert("Please select a date and time to schedule the message.");
          setLoading(false);
          return;
        }
        const timestamp = Math.floor(new Date(scheduledDateTime).getTime() / 1000);

        await axios.post("/api/schedule", {
          targetId: selectedRecipientId,
          message,
          time: timestamp,
        });
      }

      setMessage("");
      setScheduledDateTime("");
      // Refresh messages
      if (selectedRecipientId) {
        const res = await axios.get("/api/messages", {
          params: { id: selectedRecipientId, type: selectedRecipientType },
        });
        setScheduledMessages(
          (res.data.scheduled || []).map((msg: ScheduledMessageAPI) => ({
            id: msg.scheduled_message_id || msg.id,
            targetId: selectedRecipientId,
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
          (res.data.history || res.data.sent || []).map((msg: SentMessageAPI) => ({
            id: msg.ts || msg.id,
            targetId: selectedRecipientId,
            recipientName: selectedRecipientName,
            recipientType: selectedRecipientType,
            message: msg.text || msg.message,
            sentTime: msg.ts
              ? new Date(Number(msg.ts.split(".")[0]) * 1000).toISOString()
              : msg.sentTime,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to send/schedule message:", error);
      alert("Failed to send/schedule message. Please try again.");
    } finally {
      setLoading(false);
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
            Slack Connect UI Demo
          </h1>
          <p className="text-gray-600">Team: {team.teamName}</p>
        </div>

        {/* Recipients dropdown */}
        <div className="mb-6 max-w-sm mx-auto">
          <select
            className="w-full p-2 border rounded"
            value={selectedRecipientId}
            onChange={(e) => handleRecipientChange(e.target.value)}
            disabled={loading}
          >
            {recipients.length === 0 && (
              <option value="" disabled>
                No recipients found
              </option>
            )}
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main message composer and messages list */}
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
    </div>
  );
}
