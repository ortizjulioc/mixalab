import { useEffect, useCallback, useState } from "react";
import io from "socket.io-client";

let globalSocket;

export const useSocket = () => {
  const [socket, setSocket] = useState(globalSocket);
  const [isConnected, setIsConnected] = useState(
    globalSocket?.connected || false,
  );

  useEffect(() => {
    // Initialize if needed
    if (!globalSocket || globalSocket.disconnected) {
      // Only create if we don't have one or it's totally dead/closed?
      // standard io() logic handles auto-reconnect, but if we nulled it out...
      if (!globalSocket) globalSocket = io();
    }
    setSocket(globalSocket);

    const onConnect = () => {
      setIsConnected(true);
      // Force update socket state so consumers see the change
      setSocket(globalSocket);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    globalSocket.on("connect", onConnect);
    globalSocket.on("disconnect", onDisconnect);

    return () => {
      globalSocket?.off("connect", onConnect);
      globalSocket?.off("disconnect", onDisconnect);
    };
  }, []);

  // Función para unirse a una sala
  const joinRoom = useCallback((room) => {
    globalSocket?.emit("join-room", { room });
  }, []);

  // Función para salir de una sala
  const leaveRoom = useCallback((room) => {
    globalSocket?.emit("leave-room", { room });
  }, []);

  // Función genérica para emitir cualquier evento
  const emitEvent = useCallback((event, data) => {
    globalSocket?.emit(event, data);
  }, []);

  // Función para escuchar eventos (recibe el nombre y un callback)
  const listenEvent = useCallback((event, callback) => {
    globalSocket?.on(event, callback);
    return () => globalSocket?.off(event, callback); // Retorna función de limpieza
  }, []); // Empty deps because globalSocket is stable ref in module scope

  return { socket, isConnected, joinRoom, leaveRoom, emitEvent, listenEvent };
};
