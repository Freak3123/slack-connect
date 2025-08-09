"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Send, Clock, Hash, AtSign, Slack } from "lucide-react"

interface Recipient {
  id: string
  name: string
  type: "channel" | "user"
}

interface ScheduledMessage {
  id: string
  targetId: string
  recipientName: string
  recipientType: "channel" | "user"
  message: string
  scheduledTime: string
  status: "pending" | "sent" | "cancelled"
}

interface SentMessage {
  id: string
  targetId: string
  recipientName: string
  recipientType: "channel" | "user"
  message: string
  sentTime: string
}

// Mock Data for UI demonstration
const MOCK_RECIPIENTS: Recipient[] = [
  { id: "C01ABCDEF", name: "general", type: "channel" },
  { id: "C02GHIJKL", name: "random", type: "channel" },
  { id: "C03MNOPQR", name: "development", type: "channel" },
  { id: "U04STUVWX", name: "john.doe", type: "user" }, // Example DM user
  { id: "U05YZABCD", name: "jane.smith", type: "user" }, // Another example DM user
]

const MOCK_SCHEDULED_MESSAGES: ScheduledMessage[] = [
  {
    id: "sch_1",
    targetId: "C01ABCDEF",
    recipientName: "general",
    recipientType: "channel",
    message: "Daily standup reminder!",
    scheduledTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
    status: "pending",
  },
  {
    id: "sch_2",
    targetId: "U04STUVWX",
    recipientName: "john.doe",
    recipientType: "user",
    message: "Hey John, quick question about the report.",
    scheduledTime: new Date(Date.now() + 7200 * 1000).toISOString(), // 2 hours from now
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
    sentTime: new Date(Date.now() - 86400 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "ts_2",
    targetId: "U05YZABCD",
    recipientName: "jane.smith",
    recipientType: "user",
    message: "Just sent you the files.",
    sentTime: new Date(Date.now() - 172800 * 1000).toISOString(), // 2 days ago
  },
]

export default function SlackConnect() {
  const [isConnected, setIsConnected] = useState(false) // State to control connection screen
  const [recipients, setRecipients] = useState<Recipient[]>(MOCK_RECIPIENTS)
  const [selectedRecipientId, setSelectedRecipientId] = useState("")
  const [selectedRecipientName, setSelectedRecipientName] = useState("")
  const [selectedRecipientType, setSelectedRecipientType] = useState<"channel" | "user">("channel")
  const [message, setMessage] = useState("")
  const [scheduledDateTime, setScheduledDateTime] = useState("")
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(MOCK_SCHEDULED_MESSAGES)
  const [sentMessages, setSentMessages] = useState<SentMessage[]>(MOCK_SENT_MESSAGES)
  const [loading, setLoading] = useState(false)

  // Simulate initial connection check
  useEffect(() => {
    // In a real app, this would be an API call to check token validity
    // For this UI-only demo, we'll simulate a successful connection after a short delay
    const timer = setTimeout(() => {
      setIsConnected(false) // Start with disconnected state
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Set a default selected recipient for initial display once connected
  useEffect(() => {
    if (isConnected && MOCK_RECIPIENTS.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(MOCK_RECIPIENTS[0].id)
      setSelectedRecipientName(MOCK_RECIPIENTS[0].name)
      setSelectedRecipientType(MOCK_RECIPIENTS[0].type)
    }
  }, [isConnected, selectedRecipientId])

  // Simulate fetching messages for selected recipient (using mock data)
  useEffect(() => {
    if (selectedRecipientId) {
      const filteredScheduled = MOCK_SCHEDULED_MESSAGES.filter((msg) => msg.targetId === selectedRecipientId)
      const filteredSent = MOCK_SENT_MESSAGES.filter((msg) => msg.targetId === selectedRecipientId)
      setScheduledMessages(filteredScheduled)
      setSentMessages(filteredSent)
    } else {
      setScheduledMessages([])
      setSentMessages([])
    }
  }, [selectedRecipientId])

  const handleRecipientChange = (recipientId: string) => {
    const selected = recipients.find((r) => r.id === recipientId)
    if (selected) {
      setSelectedRecipientId(selected.id)
      setSelectedRecipientName(selected.name)
      setSelectedRecipientType(selected.type)
    }
  }

  const connectSlack = () => {
    // In a real app, this would redirect to Slack OAuth
    console.log("Simulating Slack connection...")
    alert("Simulating connection to Slack. The main UI will now appear.")
    setIsConnected(true) // Simulate successful connection
  }

  const sendMessage = (immediate = true) => {
    setLoading(true)
    console.log(`Attempting to ${immediate ? "send immediately" : "schedule"} message:`, {
      recipientId: selectedRecipientId,
      recipientName: selectedRecipientName,
      recipientType: selectedRecipientType,
      message,
      scheduledTime: immediate ? "N/A" : scheduledDateTime,
    })
    alert(
      `Action: ${immediate ? "Send Now" : "Schedule"}\nRecipient: ${selectedRecipientType === "channel" ? "#" : "@"}${selectedRecipientName}\nMessage: ${message}\nTime: ${immediate ? "Now" : scheduledDateTime}`,
    )
    setMessage("")
    setScheduledDateTime("")
    setLoading(false)
  }

  const cancelMessage = (messageId: string, targetId: string) => {
    setLoading(true)
    console.log(`Attempting to cancel message: ${messageId} for recipient: ${targetId}`)
    alert(`Action: Cancel Message\nID: ${messageId}\nRecipient ID: ${targetId}`)
    setScheduledMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    setLoading(false)
  }

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Slack className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Connect to Slack</CardTitle>
            <CardDescription>Connect your Slack workspace to start sending and scheduling messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectSlack} className="w-full" size="lg">
              <Slack className="w-4 h-4 mr-2" />
              Connect Slack Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Slack Connect UI Demo</h1>
          <p className="text-gray-600">Interact with the UI components (no backend connection)</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Message Composer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={selectedRecipientId} onValueChange={handleRecipientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel or user" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        <div className="flex items-center gap-2">
                          {recipient.type === "channel" ? <Hash className="w-4 h-4" /> : <AtSign className="w-4 h-4" />}
                          {recipient.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="scheduledDateTime">Schedule Time (Optional)</Label>
                <Input
                  id="scheduledDateTime"
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => sendMessage(true)} disabled={loading || !selectedRecipientId} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Button>
                <Button
                  onClick={() => sendMessage(false)}
                  disabled={loading || !scheduledDateTime || !selectedRecipientId}
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages for Selected Recipient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Messages for {selectedRecipientType === "channel" ? "#" : "@"}
                {selectedRecipientName || "No Recipient Selected"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedRecipientId ? (
                <p className="text-gray-500 text-center py-4">Select a channel or user to view its messages.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scheduledMessages.length === 0 && sentMessages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No messages found for this recipient.</p>
                  ) : (
                    <>
                      {scheduledMessages.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">Scheduled</h3>
                          {scheduledMessages.map((msg) => (
                            <div key={msg.id} className="border rounded-lg p-3 space-y-2 bg-blue-50">
                              <div className="flex items-center justify-between">
                                <Badge variant="default">Scheduled</Badge>
                                <Button size="sm" variant="ghost" onClick={() => cancelMessage(msg.id, msg.targetId)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {msg.recipientType === "channel" ? "#" : "@"}
                                  {msg.recipientName}
                                </p>
                                <p className="text-sm text-gray-800">{msg.message}</p>
                                <p className="text-xs text-gray-600">
                                  Scheduled for: {formatDateTime(msg.scheduledTime)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sentMessages.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <h3 className="font-semibold text-lg">Sent History</h3>
                          {sentMessages.map((msg) => (
                            <div key={msg.id} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">Sent</Badge>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {msg.recipientType === "channel" ? "#" : "@"}
                                  {msg.recipientName}
                                </p>
                                <p className="text-sm text-gray-800">{msg.message}</p>
                                <p className="text-xs text-gray-600">Sent at: {formatDateTime(msg.sentTime)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
