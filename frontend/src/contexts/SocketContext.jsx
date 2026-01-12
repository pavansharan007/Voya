import React, { useEffect, createContext, useContext, useState } from "react";
import { io } from "socket.io-client";
import { UserContext } from "./userContext";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { loggedIn } = useContext(UserContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (loggedIn) {
      const newSocket = io(import.meta.env.VITE_DEPLOY, {
        withCredentials: true, // Important for shared sessions
      });

      newSocket.on("connect", () => console.log("Socket connected:", newSocket.id));
      newSocket.on("disconnect", () => console.log("Socket disconnected"));

      setSocket(newSocket);

      // Cleanup on logout or unmount
      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [loggedIn]); // Re-run when login status changes

  return (
    <SocketContext.Provider value={{socket}}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;