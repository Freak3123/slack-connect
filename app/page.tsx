"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { ConnectSlack } from "@/components/ConnectSlack"
import { MessageComposer, Recipient } from "@/components/MessageComposer"
import { MessagesList, ScheduledMessage, SentMessage } from "@/components/MessagesList"

const MOCK_RECIPIENTS: Recipient[] = [
  { id: "C01ABCDEF", name: "general", type: "channel" },
  { id: "C02GHIJKL", name: "random", type: "channel" },
  { id: "C03MNOPQR", name: "development", type: "channel" },
  { id: "U04STUVWX", name: "john.doe", type: "user" },
  { id: "U05YZABCD", name: "jane.smith", type: "user" },
]
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

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [recipients] = useState<Recipient[]>(MOCK_RECIPIENTS)
  const [selectedRecipientId, setSelectedRecipientId] = useState("")
  const [selectedRecipientName, setSelectedRecipientName] = useState("")
  const [selectedRecipientType, setSelectedRecipientType] = useState<"channel" | "user">("channel")
  const [message, setMessage] = useState("")
  const [scheduledDateTime, setScheduledDateTime] = useState("")
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isConnected && recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id)
      setSelectedRecipientName(recipients[0].name)
      setSelectedRecipientType(recipients[0].type)
    }
  }, [isConnected, selectedRecipientId, recipients])

  // Fetch messages when selectedRecipientId or type changes
  useEffect(() => {
    if (selectedRecipientId) {
      fetchMessages()
    } else {
      setScheduledMessages([])
      setSentMessages([])
    }
  }, [selectedRecipientId, selectedRecipientType])

  // Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/messages", {
        params: { id: selectedRecipientId, type: selectedRecipientType },
      })

      const data = res.data

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
      )

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
      )
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error)
      setScheduledMessages([])
      setSentMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleRecipientChange = (id: string) => {
    const r = recipients.find((r) => r.id === id)
    if (r) {
      setSelectedRecipientId(r.id)
      setSelectedRecipientName(r.name)
      setSelectedRecipientType(r.type)
    }
  }

  const connectSlack = () => {
    alert("Simulating connection to Slack. The main UI will now appear.")
    setIsConnected(true)
  }

  // Cancel scheduled message, call backend then refresh
  const cancelMessage = async (messageId: string, targetId: string) => {
    setLoading(true)
    try {
      await axios.delete("/api/delete-schedule", {
        data: { scheduled_message_id: messageId, channelId: targetId },
        headers: { "Content-Type": "application/json" },
      })
      await fetchMessages()
    } catch (error) {
      console.error("❌ Failed to cancel scheduled message:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = (immediate: boolean) => {
    // You can extend this to call your send/schedule API routes
    alert(
      `Action: ${immediate ? "Send Now" : "Schedule"}\nRecipient: ${
        selectedRecipientType === "channel" ? "#" : "@"
      }${selectedRecipientName}\nMessage: ${message}\nTime: ${
        immediate ? "Now" : scheduledDateTime
      }`,
    )
    setMessage("")
    setScheduledDateTime("")
    fetchMessages()
  }

  if (!isConnected) {
    return <ConnectSlack onConnect={connectSlack} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Slack Connect UI Demo</h1>
          <p className="text-gray-600">Interact with the UI components (no backend connection)</p>
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
    </div>
  )
}
