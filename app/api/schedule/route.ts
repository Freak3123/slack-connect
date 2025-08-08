import { NextResponse } from "next/server";
import axios from "axios";
export async function POST(req: Request) {
  try {
    const body = await req.json();


    
const res = await axios.post(
  `${process.env.BACKEND_URL}/schedule`,
  body, 
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);


    const data = await res.data;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to schedule message" },
      { status: 500 }
    );
  }
}
