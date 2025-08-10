
import { NextResponse } from "next/server";
import axios from "axios";

interface Team {
  teamId: string;
  teamName: string;
}

interface TeamsResponse {
  teams: Team[];
  [key: string]: unknown;
}

export async function GET() {
  try {
    const backendRes = await axios.get<TeamsResponse>(`${process.env.BACKEND_URL}/teams`, {
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error) {
    console.error("❌ Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
