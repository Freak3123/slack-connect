import { NextResponse } from "next/server";
import axios from "axios";

interface ScheduledMessage {
  scheduled_message_id?: string;
  id?: string;
  [key: string]: unknown;
}

interface MessagesResponse {
  scheduled?: ScheduledMessage[];
  targetName?: string;
  teamName?: string;
  listNames?: string[];
  [key: string]: unknown;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const teamId = searchParams.get("teamId"); // ✅ required for backend

  if (!id || !teamId) {
    return NextResponse.json(
      { error: 'Missing required parameters: "id" and "teamId"' },
      { status: 400 }
    );
  }

  try {
    const res = await axios.get<MessagesResponse>(`${process.env.BACKEND_URL}/messages`, {
      params: { id, type: type || "", teamId }, // ✅ include teamId
      headers: { "Content-Type": "application/json" },
    });

    const data = res.data;

    if (data.scheduled) {
      data.scheduled = data.scheduled.map((msg) => ({
        ...msg,
        scheduled_message_id: msg.scheduled_message_id || msg.id, // ensure correct field
      }));
    }

    if (data.targetName) {
      data.displayTarget = data.targetName;
    }
    if (data.teamName) {
      data.displayTeam = data.teamName;
    }
    if (data.listNames) {
      data.displayList = data.listNames;
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("❌ Failed to fetch messages:", error.response.data);
    } else {
      console.error("❌ Failed to fetch messages:", error.message || error);
    }
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
