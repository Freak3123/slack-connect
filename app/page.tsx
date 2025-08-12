"use client";

import { useState, useEffect } from "react";
import { ConnectSlack } from "@/components/ConnectSlack";
import MainApp from "@/components/MainApp";

export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const [isConnected, setIsConnected] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("teamId");
    if (tid) {
      localStorage.setItem("teamId", tid);
      setTeamId(tid);
      setIsConnected(true);
      // Optionally clean the URL so teamId isn't visible
      //window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const storedTeamId = localStorage.getItem("teamId");
    if (storedTeamId) {
      setTeamId(storedTeamId);
      fetch(`${backendUrl}/slack/validate/${storedTeamId}`)
        .then((res) => res.json())
        .then((data) => {
          setIsConnected(data.connected);
        })
        .catch(() => setIsConnected(false));
    }
  }, [backendUrl]);

  const handleContinue = () => {
    if (teamId) {
      setIsConnected(true);
    }
  };

  if (!isConnected) {
    return (
      <ConnectSlack
        Url={backendUrl}
        isConnected={false}
        onContinue={handleContinue}
      />
    );
  }

  return <MainApp />;
}
