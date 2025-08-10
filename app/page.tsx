"use client";

import { useState } from "react";
import { ConnectSlack } from "@/components/ConnectSlack";
import MainApp from "@/components/MainApp"; 

export default function Home() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const [isConnected, setIsConnected] = useState(false);

  const handleContinue = () => {
    setIsConnected(true);
  };

  if (!isConnected) {
    return (
      <ConnectSlack Url={backendUrl} isConnected={false} onContinue={handleContinue} />
    );
  }

  return <MainApp />;
}
