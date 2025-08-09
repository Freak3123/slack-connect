// app/api/direct-msg/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { targetId, message } = await req.json(); // match backend fields

    if (!targetId || !message) {
      return NextResponse.json(
        { error: "ID and message are required" },
        { status: 400 }
      );
    }

    // Send data to backend Express API
    const backendResponse = await axios.post(
      `${process.env.BACKEND_URL}/send`,
      { targetId, message } // exactly what backend expects
    );

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in (error.response as Record<string, unknown>)
    ) {
      console.error(
        "Error sending message:",
        (error.response as { data?: unknown }).data
      );
    } else {
      console.error("Error sending message:", error);
    }
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
