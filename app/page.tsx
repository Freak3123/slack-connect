"use client";

import { useState, useEffect } from "react";
import { ConnectSlack } from "@/components/ConnectSlack";
import MainApp from "@/components/MainApp"; 
import { useSearchParams } from "next/navigation";

export default function Home() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const [isConnected, setIsConnected] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("installed") === "true") {
      setIsConnected(true);
    }
  }, [searchParams]);

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
