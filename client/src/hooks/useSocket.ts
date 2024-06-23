import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:9000");

    newSocket.on("connection", () => {
      setSocket(newSocket);
      console.log("Connected to server");
    });

    socket?.on("disconnect", () => {
      console.log("Disconnected from server");
      setSocket(null);
    });
  }, []);
  return socket;
};
