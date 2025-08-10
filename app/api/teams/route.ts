
import { NextResponse } from "next/server";
import axios from "axios";


export async function GET(req:Request) {
  try {
    console.log("jhdsfghsgsgdjfghsuy--g-")
    console.log(process.env.BACKEND_URL);
    const backendRes = await axios.get(`http://localhost:3001/teams`);


    return NextResponse.json(backendRes.data);
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
