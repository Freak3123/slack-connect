
import { NextResponse } from "next/server";
import axios from "axios";

export async function DELETE(req: Request) {
  try {
    const { scheduled_message_id, channelId } = await req.json();
    console.log("Deleting message:", scheduled_message_id, channelId);

    if (!scheduled_message_id || !channelId) {
      return NextResponse.json(
        { error: "scheduled_message_id and channelId are required" },
        { status: 400 }
      );
    }

    const backendRes = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete`,
      {
        data: { scheduled_message_id, channelId }, // axios DELETE body
        headers: { "Content-Type": "application/json" },
      }
    );

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error: any) {
    console.error(
      "❌ Failed to delete scheduled message:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Failed to delete scheduled message" },
      { status: 500 }
    );
  }
}
