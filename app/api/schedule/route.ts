import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { targetId, message, time, teamId } = await req.json();

    if (!targetId || !message || !time || !teamId) {
      return NextResponse.json(
        { error: "targetId, message, time, and teamId are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${process.env.BACKEND_URL}/schedule`,
      { targetId, message, time, teamId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = response.data;

    if (data.targetName) {
      data.displayTarget = data.targetName;
    }

    return NextResponse.json(data);
    
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
