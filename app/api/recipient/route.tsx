import { NextResponse } from "next/server";
import axios from "axios";

interface Recipient {
  id: string;
  name: string;
}

interface RecipientResponse {
  users: Recipient[];
  channels: Recipient[];
  teamName: string;
  [key: string]: unknown;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
    }

    const backendRes = await axios.get<RecipientResponse>(`${process.env.BACKEND_URL}/recipient`, {
      params: { teamId },
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error) {
    console.error("❌ Failed to fetch recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}
