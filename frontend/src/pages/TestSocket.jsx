import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";

const TestSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      console.log("✅ Connected to socket:", socket.id);
      setConnected(true);
    };

    const handleDisconnect = (reason) => {
      console.warn("🔌 Disconnected:", reason);
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <div>
      <h1>Socket.IO Test: {connected ? "Connected ✅" : "Disconnected ❌"}</h1>
    </div>
  );
};

export default TestSocket;
