"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function SlackSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) return;

    async function fetchTeamInfo() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/slack/oauth/callback`, { params: { code } });
        const team = res.data.team; // Assuming the response contains team info
    // if (team) {
    //   // Save connection flag and team info in localStorage or global store
    //   localStorage.setItem("isConnected", "true");
    //   localStorage.setItem("teamName", team);

      // Redirect to main app home page
     
        router.replace("/");
      } catch (error) {
        console.error("Slack OAuth backend error:", error);
        // Optionally handle error UI or retry
      }
    }

    fetchTeamInfo();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Connecting to team... Please wait.</p>
    </div>
  );
}
{/*
    


router.get("/slack/oauth/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    // Exchange code for access token
    const response = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        code,
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      },
    });

    if (!response.data.ok) {
      return res.status(400).send(`Slack OAuth failed: ${response.data.error}`);
    }

    // Here you get your access token, team info, etc.
    const { access_token, team, authed_user } = response.data;

    // Save token & team info in your DB or session
    console.log("Access Token:", access_token);
    console.log("Team Info:", team);
    console.log("User Info:", authed_user);

    // Redirect or respond as you wish
    return res.send("Slack OAuth success! You can close this tab.");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.status(500).send("Internal Server Error");
  }
});



    */}

