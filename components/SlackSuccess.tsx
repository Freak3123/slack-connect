"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SlackSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  

  useEffect(() => {
    const team = searchParams.get("team");
    if (team) {
      // Save connection flag and team info in localStorage or global store
      localStorage.setItem("isConnected", "true");
      localStorage.setItem("teamName", team);

      // Redirect to main app home page
      router.replace("/");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Connecting to team {team} ... Please wait.</p>
    </div>
  );
}
