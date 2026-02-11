"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Loader2,
  Minimize2,
  MessageSquare,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProjectChat({ project, currentUser }) {
  const { socket, isConnected, joinRoom, leaveRoom, listenEvent, emitEvent } =
    useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null); // Simple: assume 1 other person
  const [isOpen, setIsOpen] = useState(true); // State for chat visibility
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatRoomId = project?.chatRoom?.id;

  // Load initial messages
  useEffect(() => {
    if (project?.chatRoom?.messages) {
      setMessages(project.chatRoom.messages);
    }
  }, [project]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUser, isOpen]);

  // Mark messages as read when they appear and are not mine
  useEffect(() => {
    if (!chatRoomId || !currentUser?.id || !isOpen) return;

    const unreadMessages = messages.filter(
      (m) => !m.isRead && m.senderId !== currentUser.id,
    );

    if (unreadMessages.length > 0) {
      // Mark as read API call
      fetch("/api/messages/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatRoomId }),
      }).catch((err) => console.error("Error marking read:", err));

      // Optimistically update local state to avoid repeated calls?
      // Actually, better to just let the socket confirmation handle it or do it once.
      // But if we do it here, we should update state to prevent loop.
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.isRead && m.senderId !== currentUser.id) {
            return { ...m, isRead: true };
          }
          return m;
        }),
      );
    }
  }, [messages, chatRoomId, currentUser, isOpen]);

  // Socket Connection & Events
  useEffect(() => {
    if (!chatRoomId || !isConnected) return; // Wait for connection

    joinRoom(chatRoomId);

    // Listen for new messages
    const removeMsgListener = listenEvent("receive-message", (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    // Listen for read receipts
    const removeReadListener = listenEvent(
      "messages-read",
      ({ readerId, count }) => {
        if (readerId !== currentUser?.id) {
          // Someone else read my messages
          setMessages((prev) =>
            prev.map((m) =>
              m.senderId === currentUser?.id ? { ...m, isRead: true } : m,
            ),
          );
        }
      },
    );

    // Listen for typing
    const removeTypingListener = listenEvent("typing", ({ user }) => {
      setTypingUser(user);
    });

    const removeStopTypingListener = listenEvent("stop-typing", () => {
      setTypingUser(null);
    });

    return () => {
      leaveRoom(chatRoomId);
      removeMsgListener();
      removeReadListener();
      removeTypingListener();
      removeStopTypingListener();
    };
  }, [
    chatRoomId,
    joinRoom,
    leaveRoom,
    listenEvent,
    currentUser,
    isConnected,
    socket,
  ]);

  const handleTyping = () => {
    if (!socket || !chatRoomId) return;

    emitEvent("typing", { room: chatRoomId, user: currentUser?.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      emitEvent("stop-typing", { room: chatRoomId });
    }, 2000);
  };

  const handleSend = async () => {
    if (!message.trim() || !chatRoomId) return;

    const tempMessage = message;
    setSending(true);
    // Stop typing immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitEvent("stop-typing", { room: chatRoomId });

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

      const responseData = await res.json();
      const newMessage = responseData.data;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

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

  // MINIMIZED STATE
  if (!isOpen) {
    return (
      <div className="flex flex-col items-end justify-end h-full pointer-events-none">
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/95 border border-zinc-800 rounded-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm flex justify-between items-center rounded-t-xl">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Project Chat
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-md"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
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
                className={`max-w-[75%] rounded-2xl px-4 py-2 relative group ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-zinc-800 text-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1`}>
                  <span
                    className={`text-[10px] ${isMe ? "text-indigo-200" : "text-gray-500"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && (
                    <span className="ml-1">
                      {msg.isRead ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M18 6L7 17l-5-5" />
                          <path d="m22 10-7.5 7.5L13 16" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white/70"
                        >
                          <path d="M18 6L7 17l-5-5" />
                          <path d="m22 10-7.5 7.5L13 16" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div className="flex justify-start ml-10 mb-2">
            <div className="bg-zinc-800/80 px-3 py-1.5 rounded-full flex items-center gap-2">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              {/* {typingUser && typeof typingUser === "string" && (
                <span className="text-xs text-gray-400 italic">typing...</span>
              )} */}
            </div>
          </div>
        )}

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
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
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
