"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slack } from "lucide-react"

interface ConnectSlackProps {
  onConnect: () => void
}

export function ConnectSlack({ onConnect }: ConnectSlackProps) {
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
          <Button onClick={onConnect} className="w-full" size="lg">
            <Slack className="w-4 h-4 mr-2" />
            Connect Slack Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
