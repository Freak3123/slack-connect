import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`, {
      params: { id, type: type || "" },
      headers: { "Content-Type": "application/json" },
    });

    // Add scheduled_message_id alias safely if scheduled messages exist
    const data = res.data;
    if (data.scheduled) {
      data.scheduled = (data.scheduled || []).map((msg: any) => ({
        ...msg,
        scheduled_message_id: msg.id,
      }));
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("❌ Failed to fetch messages:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
