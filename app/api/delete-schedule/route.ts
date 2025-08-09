
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
      `${process.env.BACKEND_URL}/delete`,
      {
        data: { scheduled_message_id, channelId }, // axios DELETE body
        headers: { "Content-Type": "application/json" },
      }
    );

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error) {
    if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response) {
      console.error("❌ Failed to delete scheduled message:", error.response.data);
    } else if (error instanceof Error) {
      console.error("❌ Failed to delete scheduled message:", error.message);
    } else {
      console.error("❌ Failed to delete scheduled message:", error);
    }
    return NextResponse.json(
      { error: "Failed to delete scheduled message" },
      { status: 500 }
    );
  }
}
