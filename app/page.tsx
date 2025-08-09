"use client"

import { useState, useEffect } from "react"
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

const MOCK_SCHEDULED_MESSAGES: ScheduledMessage[] = [
  {
    id: "sch_1",
    targetId: "C01ABCDEF",
    recipientName: "general",
    recipientType: "channel",
    message: "Daily standup reminder!",
    scheduledTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "sch_2",
    targetId: "U04STUVWX",
    recipientName: "john.doe",
    recipientType: "user",
    message: "Hey John, quick question about the report.",
    scheduledTime: new Date(Date.now() + 7200 * 1000).toISOString(),
    status: "pending",
  },
]

const MOCK_SENT_MESSAGES: SentMessage[] = [
  {
    id: "ts_1",
    targetId: "C01ABCDEF",
    recipientName: "general",
    recipientType: "channel",
    message: "Hello everyone!",
    sentTime: new Date(Date.now() - 86400 * 1000).toISOString(),
  },
  {
    id: "ts_2",
    targetId: "U05YZABCD",
    recipientName: "jane.smith",
    recipientType: "user",
    message: "Just sent you the files.",
    sentTime: new Date(Date.now() - 172800 * 1000).toISOString(),
  },
]

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [recipients] = useState<Recipient[]>(MOCK_RECIPIENTS)
  const [selectedRecipientId, setSelectedRecipientId] = useState("")
  const [selectedRecipientName, setSelectedRecipientName] = useState("")
  const [selectedRecipientType, setSelectedRecipientType] = useState<"channel" | "user">("channel")
  const [message, setMessage] = useState("")
  const [scheduledDateTime, setScheduledDateTime] = useState("")
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(MOCK_SCHEDULED_MESSAGES)
  const [sentMessages, setSentMessages] = useState<SentMessage[]>(MOCK_SENT_MESSAGES)
  const [loading, setLoading] = useState(false)

  // Remove initial effect that forces disconnected
  // Instead start disconnected and show connect screen

  // Set default recipient on connect
  useEffect(() => {
    if (isConnected && recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id)
      setSelectedRecipientName(recipients[0].name)
      setSelectedRecipientType(recipients[0].type)
    }
  }, [isConnected, selectedRecipientId, recipients])

  // Filter messages when recipient changes
  useEffect(() => {
    if (selectedRecipientId) {
      setScheduledMessages(MOCK_SCHEDULED_MESSAGES.filter((m) => m.targetId === selectedRecipientId))
      setSentMessages(MOCK_SENT_MESSAGES.filter((m) => m.targetId === selectedRecipientId))
    } else {
      setScheduledMessages([])
      setSentMessages([])
    }
  }, [selectedRecipientId])

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

  const sendMessage = (immediate: boolean) => {
    setLoading(true)
    alert(
      `Action: ${immediate ? "Send Now" : "Schedule"}\nRecipient: ${
        selectedRecipientType === "channel" ? "#" : "@"
      }${selectedRecipientName}\nMessage: ${message}\nTime: ${immediate ? "Now" : scheduledDateTime}`,
    )
    setMessage("")
    setScheduledDateTime("")
    setLoading(false)
  }

  const cancelMessage = (messageId: string, targetId: string) => {
    setLoading(true)
    alert(`Action: Cancel Message\nID: ${messageId}\nRecipient ID: ${targetId}`)
    setScheduledMessages((prev) => prev.filter((m) => m.id !== messageId))
    setLoading(false)
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
