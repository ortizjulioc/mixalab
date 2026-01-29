import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

let socket;

export const useSocket = () => {
  useEffect(() => {
    if (!socket) {
      socket = io();
    }

    return () => {
      socket?.disconnect(); // Cierra la conexión al desmontar el componente
    };
  }, []);

  // Función para unirse a una sala
  const joinRoom = useCallback((room) => {
    socket?.emit('join-room', { room });
  }, []);

  // Función para salir de una sala
  const leaveRoom = useCallback((room) => {
    socket?.emit('leave-room', { room });
  }, []);

  // Función genérica para emitir cualquier evento
  const emitEvent = useCallback((event, data) => {
    socket?.emit(event, data);
  }, []);

  // Función para escuchar eventos (recibe el nombre y un callback)
  const listenEvent = useCallback((event, callback) => {
    socket?.on(event, callback);
    return () => socket?.off(event, callback); // Retorna función de limpieza
  }, []);

  return { socket, joinRoom, leaveRoom, emitEvent, listenEvent };
};