"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function SlackSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Missing authorization code.");
      return;
    }

    async function fetchTeamInfo() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/slack/oauth/callback`,
          { params: { code } }
        );

        const team = res.data.team;

        if (team) {
          // Save team info or connection flags
          localStorage.setItem("isConnected", "true");
          localStorage.setItem("teamName", team.name || team.id || "unknown");
        }

        // Redirect to your app main page
        router.replace("/");
      } catch (err) {
        console.error("Slack OAuth backend error:", err);
        setError("Failed to connect to Slack. Please try again.");
      }
    }

    fetchTeamInfo();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Connecting to Slack... Please wait.</p>
    </div>
  );
}
