import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "../utils/authTokens";
import { BACKEND_URL } from "../services/api";

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io(BACKEND_URL, {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("[Socket Client] Connected cleanly to Socket.IO server");
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn(`[Socket Client] Disconnected: ${reason}`);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket Client] Connection error:", error.message);
      setIsConnected(false);
      setConnectionError(error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    connectionError,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
