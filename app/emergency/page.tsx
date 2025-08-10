"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ConnectSlack } from "@/components/ConnectSlack";
import { MessageComposer, Recipient } from "@/components/MessageComposer";
import {
  MessagesList,
  ScheduledMessage,
  SentMessage,
} from "@/components/MessagesList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

interface RecipientResponse {
  users: Recipients[];
  channels: Recipients[];
  teamName: string;
  [key: string]: unknown;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  // Teams and selection
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Recipients & selection
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedRecipientName, setSelectedRecipientName] = useState("");
  const [selectedRecipientType, setSelectedRecipientType] = useState<
    "channel" | "user"
  >("channel");

  // Message states
  const [message, setMessage] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(
    []
  );
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

  // Fetch teams on mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await axios.get("/api/teams");
        setTeams(res.data.teams || []);
      } catch (error) {
        console.error("❌ Failed to fetch teams:", error);
        setTeams([]);
      }
    }
    fetchTeams();
  }, []);

  // When team changes, fetch recipients and reset recipient selection + messages
  useEffect(() => {
    if (!selectedTeamId) {
      setRecipients([]);
      setSelectedRecipientId("");
      setSelectedRecipientName("");
      setScheduledMessages([]);
      setSentMessages([]);
      return;
    }

    async function fetchRecipients() {
      setLoading(true);
      try {
        const res = await axios.get<RecipientResponse>("/api/recipient", {
          params: { teamId: selectedTeamId },
        });

        // Combine channels and users into recipients array with type
        const channels = (res.data.channels || []).map((c: Recipients) => ({
          ...c,
          type: "channel" as const,
        }));
        const users = (res.data.users || []).map((u: Recipients) => ({
          ...u,
          type: "user" as const,
        }));

        const combined = [...channels, ...users];
        setRecipients(combined);

        if (combined.length > 0) {
          setSelectedRecipientId(combined[0].id);
          setSelectedRecipientName(combined[0].name);
          setSelectedRecipientType(combined[0].type);
        } else {
          setSelectedRecipientId("");
          setSelectedRecipientName("");
        }
      } catch (error) {
        console.error("❌ Failed to fetch recipients:", error);
        setRecipients([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipients();
  }, [selectedTeamId]);

  // Fetch messages when selectedRecipientId or type changes
  useEffect(() => {
    if (selectedRecipientId) {
      fetchMessages();
    } else {
      setScheduledMessages([]);
      setSentMessages([]);
    }
  }, [selectedRecipientId, selectedRecipientType]);

  // Fetch messages from API
  const fetchMessages = async () => {
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
      console.error("❌ Failed to fetch messages:", error);
      setScheduledMessages([]);
      setSentMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientChange = (id: string) => {
    const r = recipients.find((r) => r.id === id);
    if (r) {
      setSelectedRecipientId(r.id);
      setSelectedRecipientName(r.name);
      setSelectedRecipientType(r.type);
    }
  };

  // Cancel scheduled message, call backend then refresh
  const cancelMessage = async (messageId: string, targetId: string) => {
    setLoading(true);
    try {
      await axios.delete("/api/delete-schedule", {
        data: { scheduled_message_id: messageId, channelId: targetId },
        headers: { "Content-Type": "application/json" },
      });
      await fetchMessages();
    } catch (error) {
      console.error("❌ Failed to cancel scheduled message:", error);
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
        const timestamp = Math.floor(
          new Date(scheduledDateTime).getTime() / 1000
        );

        await axios.post("/api/schedule", {
          targetId: selectedRecipientId,
          message,
          time: timestamp,
        });
      }

      setMessage("");
      setScheduledDateTime("");
      await fetchMessages();
    } catch (error) {
      console.error("❌ Failed to send/schedule message:", error);
      alert("Failed to send/schedule message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setIsConnected(true);
  };

  if (!isConnected) {
    return (
      <ConnectSlack Url={backendUrl} isConnected={false} onContinue={handleContinue} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Slack Connect UI Demo
          </h1>
          <p className="text-gray-600">Select your team, then send messages.</p>
        </div>

        {/* Team selector */}
        <div className="mb-6 max-w-sm mx-auto">
          <Select
            value={selectedTeamId || ""}
            onValueChange={(val) => setSelectedTeamId(val || null)}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.length === 0 && (
                <SelectItem value="" disabled>
                  No teams found
                </SelectItem>
              )}
              {teams.map((team) => (
                <SelectItem key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rest of the UI - only show if a team selected */}
        {selectedTeamId && (
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
        )}
      </div>
    </div>
  );
}
