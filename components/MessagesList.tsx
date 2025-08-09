"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Clock } from "lucide-react"

export interface ScheduledMessage {
  id: string
  targetId: string
  recipientName: string
  recipientType: "channel" | "user"
  message: string
  scheduledTime: string
  status: "pending" | "sent" | "cancelled"
}

export interface SentMessage {
  id: string
  targetId: string
  recipientName: string
  recipientType: "channel" | "user"
  message: string
  sentTime: string
}

interface MessagesListProps {
  selectedRecipientType: "channel" | "user"
  selectedRecipientName: string
  scheduledMessages: ScheduledMessage[]
  sentMessages: SentMessage[]
  onCancelMessage: (messageId: string, targetId: string) => void
  selectedRecipientId: string
}

export function MessagesList({
  selectedRecipientId,
  selectedRecipientName,
  selectedRecipientType,
  scheduledMessages,
  sentMessages,
  onCancelMessage,
}: MessagesListProps) {
  const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString()

  if (!selectedRecipientId) {
    return <p className="text-gray-500 text-center py-4">Select a channel or user to view its messages.</p>
  }

  if (scheduledMessages.length === 0 && sentMessages.length === 0) {
    return <p className="text-gray-500 text-center py-4">No messages found for this recipient.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Messages for {selectedRecipientType === "channel" ? "#" : "@"}
          {selectedRecipientName || "No Recipient Selected"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {scheduledMessages.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Scheduled</h3>
              {scheduledMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-3 space-y-2 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Scheduled</Badge>
                    <Button size="sm" variant="ghost" onClick={() => onCancelMessage(msg.id, msg.targetId)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">
                      {msg.recipientType === "channel" ? "#" : "@"}
                      {msg.recipientName}
                    </p>
                    <p className="text-sm text-gray-800">{msg.message}</p>
                    <p className="text-xs text-gray-600">Scheduled for: {formatDateTime(msg.scheduledTime)}</p>
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
        </div>
      </CardContent>
    </Card>
  )
}
