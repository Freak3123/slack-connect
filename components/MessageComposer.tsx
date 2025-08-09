"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AtSign, Clock, Hash, Send } from "lucide-react"

export interface Recipient {
  id: string
  name: string
  type: "channel" | "user"
}

interface MessageComposerProps {
  recipients: Recipient[]
  selectedRecipientId: string
  selectedRecipientType: "channel" | "user"
  selectedRecipientName: string
  onRecipientChange: (id: string) => void
  message: string
  onMessageChange: (msg: string) => void
  scheduledDateTime: string
  onScheduledDateTimeChange: (dt: string) => void
  loading: boolean
  onSend: (immediate: boolean) => void
}

export function MessageComposer({
  recipients,
  selectedRecipientId,
  selectedRecipientName,
  selectedRecipientType,
  onRecipientChange,
  message,
  onMessageChange,
  scheduledDateTime,
  onScheduledDateTimeChange,
  loading,
  onSend,
}: MessageComposerProps) {
  return (
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
          <Select value={selectedRecipientId} onValueChange={onRecipientChange}>
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
            onChange={(e) => onMessageChange(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="scheduledDateTime">Schedule Time (Optional)</Label>
          <Input
            id="scheduledDateTime"
            type="datetime-local"
            value={scheduledDateTime}
            onChange={(e) => onScheduledDateTimeChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSend(true)} disabled={loading || !selectedRecipientId} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Send Now
          </Button>
          <Button
            onClick={() => onSend(false)}
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
  )
}
