"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProjectChat({ project, currentUser }) {
  const { socket, joinRoom, leaveRoom, listenEvent } = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const chatRoomId = project?.chatRoom?.id;

  // Load initial messages
  useEffect(() => {
    if (project?.chatRoom?.messages) {
      setMessages(project.chatRoom.messages);
    }
  }, [project]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket Connection
  useEffect(() => {
    if (chatRoomId) {
      console.log("Joining room:", chatRoomId);
      joinRoom(chatRoomId);

      const removeListener = listenEvent("receive-message", (newMessage) => {
        console.log("New message received:", newMessage);
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });

      return () => {
        leaveRoom(chatRoomId);
        removeListener();
      };
    }
  }, [chatRoomId, joinRoom, leaveRoom, listenEvent]);

  const handleSend = async () => {
    if (!message.trim() || !chatRoomId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatRoomId,
          content: message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      // Optimistic update or wait for socket?
      // Since we receive socket event, we can maybe wait, but optimistic is better UX.
      // However, to avoid duplicate with socket, let's just clear input and wait for socket
      // OR append if we can handle ID deduplication.
      // For now, let's rely on the socket event to append the message to state to ensure single source of truth.
      // Actually, for better UX locally, we might want to append immediately.

      setMessage("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (!chatRoomId) {
    return (
      <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-xl items-center justify-center text-gray-400">
        <p>Chat not available for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Project Chat
        </h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const isSystem = msg.type === "SYSTEM";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="bg-zinc-800/50 text-gray-400 text-xs px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar for other users */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden mr-2 flex-shrink-0 relative">
                  {msg.sender?.image ? (
                    <Image
                      src={msg.sender.image}
                      alt={msg.sender.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      {(msg.sender?.name?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-zinc-800 text-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${isMe ? "text-indigo-200" : "text-gray-500"} text-right`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 focus-within:border-indigo-500/50 transition-colors">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
