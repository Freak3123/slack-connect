// app/api/schedule/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { targetId, message, time } = await req.json(); // match backend expectations

    if (!targetId || !message || !time) {
      return NextResponse.json(
        { error: "targetId, message, and time are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${process.env.BACKEND_URL}/schedule`,
      { targetId, message, time }, // send exactly what backend expects
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response) {
      console.error("❌ Failed to schedule message:", error.response.data);
    } else {
      console.error("❌ Failed to schedule message:", error);
    }
    return NextResponse.json(
      { error: "Failed to schedule message" },
      { status: 500 }
    );
  }
}
