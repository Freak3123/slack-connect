
import { NextResponse } from "next/server";
import axios from "axios";


export async function GET() {
  try {
    console.log(process.env.BACKEND_URL);
    const backendRes = await axios.get(`${process.env.BACKEND_URL}/teams`, {
      headers: { "Content-Type": "application/json" },
    });


    return NextResponse.json(backendRes.data);
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
