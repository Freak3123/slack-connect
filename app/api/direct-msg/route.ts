
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { targetId, message, teamId } = await req.json();

    if (!targetId || !message || !teamId) {
      return NextResponse.json(
        { error: "targetId, message, and teamId are required" },
        { status: 400 }
      );
    }
    const backendResponse = await axios.post(
      `${process.env.BACKEND_URL}/send`,
      { targetId, message, teamId }
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
