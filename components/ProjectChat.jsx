'use client';

import { useState } from 'react';
import { Send, Paperclip, User, Smile } from 'lucide-react';

export default function ProjectChat({ project, currentUser }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: 'Welcome to the project workspace!', sender: 'system', time: 'Just now' },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages([...messages, {
            id: Date.now(),
            text: message,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessage('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Project Chat
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'me'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : msg.sender === 'system'
                                    ? 'bg-zinc-800/50 text-gray-400 text-xs w-full text-center'
                                    : 'bg-zinc-800 text-gray-200 rounded-bl-none'
                            }`}>
                            <p>{msg.text}</p>
                            {msg.sender !== 'system' && (
                                <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                            )}
                        </div>
                    </div>
                ))}
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
