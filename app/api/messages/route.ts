import { NextResponse } from "next/server";
import axios from "axios";

interface ScheduledMessage {
  id: string;
  [key: string]: unknown;
}

interface MessagesResponse {
  scheduled?: ScheduledMessage[];
  [key: string]: unknown;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await axios.get<MessagesResponse>(`${process.env.BACKEND_URL}/messages`, {
      params: { id, type: type || "" },
      headers: { "Content-Type": "application/json" },
    });

    const data = res.data;
    if (data.scheduled) {
      data.scheduled = (data.scheduled || []).map((msg) => ({
        ...msg,
        scheduled_message_id: msg.id,
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
  } catch (error) {
    if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response) {
  
      console.error("❌ Failed to fetch messages:", error.response.data);
    } else if (error instanceof Error) {
      console.error("❌ Failed to fetch messages:", error.message);
    } else {
      console.error("❌ Failed to fetch messages:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
