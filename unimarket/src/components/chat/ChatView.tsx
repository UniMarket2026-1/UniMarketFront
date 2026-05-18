"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Send, ArrowLeft, MoreVertical, Package, ShieldCheck } from "lucide-react";
import { Chat, Message } from "@/lib/types";
import { motion } from "motion/react";
import { useLang } from "@/i18n/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

/**
 * Chat view — HU-06
 * Supports opening a specific chat via ?chatId= query param (from notification navigation)
 */
export function ChatView() {
  const { t } = useLang();
  const { user, chats } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    searchParams.get("chatId")
  );
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chat: selectedChat, chatMessages, sendMessage } = useChat(selectedChatId);

  // Auto-open chat from query param
  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId) setSelectedChatId(chatId);
  }, [searchParams]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedChatId]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedChatId) return;
    sendMessage(user.id, inputText);
    setInputText("");
  };

  const handleBack = () => {
    setSelectedChatId(null);
    router.replace("/chat"); // Remove chatId from URL
  };

  if (selectedChat) {
    return (
      <motion.div
        key="chat-open"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed inset-0 bg-white z-50 flex flex-col"
        role="main"
        aria-label={`Chat con ${selectedChat.otherPartyName}`}
      >
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 shadow-sm">
          <button
            onClick={handleBack}
            className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label={t.product.back}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-200">
              {selectedChat.otherPartyProfileImageUrl ? (
                <img
                  src={selectedChat.otherPartyProfileImageUrl}
                  alt={selectedChat.otherPartyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{selectedChat.otherPartyName.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-none">
                {selectedChat.otherPartyName}
              </span>
              <span
                className="text-[10px] text-emerald-500 font-bold uppercase mt-1"
                aria-label="Estado: En línea"
              >
                {t.chat.online}
              </span>
            </div>
          </div>
          <button className="p-2 text-slate-400" aria-label="Más opciones">
            <MoreVertical size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Product Context */}
        <div className="bg-indigo-50/50 p-3 flex items-center gap-3 border-b border-indigo-100">
          <div className="w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center text-indigo-600">
            <Package size={20} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-tight">
              {t.chat.interest}
            </span>
            <p className="text-sm font-bold text-slate-800 line-clamp-1">
              {selectedChat.productName}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-100">
            <ShieldCheck size={12} aria-hidden="true" />
            {t.chat.secureTx}
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
          role="log"
          aria-live="polite"
          aria-label="Mensajes del chat"
        >
          <div className="self-center bg-slate-100 px-3 py-1 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
            {t.chat.today}
          </div>
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] p-3 rounded-2xl flex flex-col gap-1",
                msg.senderId === user.id
                  ? "self-end bg-indigo-600 text-white rounded-tr-none"
                  : "self-start bg-slate-100 text-slate-800 rounded-tl-none"
              )}
              aria-label={`${msg.senderId === user.id ? "Tú" : selectedChat.otherPartyName}: ${msg.text} a las ${msg.timestamp}`}
            >
              <p className="text-sm">{msg.text}</p>
              <span
                className={cn(
                  "text-[10px] self-end",
                  msg.senderId === user.id ? "text-indigo-200" : "text-slate-400"
                )}
                aria-hidden="true"
              >
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white pb-8">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <input
              type="text"
              placeholder={t.chat.placeholder}
              className="flex-1 bg-transparent px-3 py-2 outline-none text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              aria-label={t.chat.placeholder}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Chat list
  return (
    <div className="flex flex-col gap-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 px-1">{t.chat.title}</h1>

      <div className="flex flex-col gap-2" role="list" aria-label="Lista de conversaciones">
        {chats.map((chat) => (
          <button
            key={chat.id}
            role="listitem"
            onClick={() => setSelectedChatId(chat.id)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all text-left"
            aria-label={`Chat con ${chat.otherPartyName} sobre ${chat.productName}`}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden border border-indigo-100">
                {chat.otherPartyProfileImageUrl ? (
                  <img
                    src={chat.otherPartyProfileImageUrl}
                    alt={chat.otherPartyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{chat.otherPartyName.charAt(0)}</span>
                )}
              </div>
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
                aria-label="En línea"
              />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{chat.otherPartyName}</span>
                <span className="text-[10px] text-slate-400 font-medium" aria-hidden="true">
                  10:05 AM
                </span>
              </div>
              <p className="text-xs font-bold text-indigo-600 truncate">{chat.productName}</p>
              <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
            </div>
          </button>
        ))}

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MessageCircle size={48} className="opacity-20 mb-4" aria-hidden="true" />
            <p className="font-bold">{t.chat.empty}</p>
            <p className="text-sm text-center">{t.chat.emptyDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
