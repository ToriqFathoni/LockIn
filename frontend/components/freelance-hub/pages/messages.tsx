"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconSearch } from "../icons";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

interface ConversationItem {
  id: number;
  other_user_id: string;
  other_user_name: string;
  other_user_email: string;
  message_count: string;
  last_message: string | null;
  last_message_time: string | null;
}

interface MessageItem {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string;
}

function formatTime(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export const MessagesPage = () => {
  const router = useRouter();
  const { token, user, isLoading } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const keyword = searchTerm.toLowerCase();
    return conversations.filter(
      (conversation) =>
        conversation.other_user_name?.toLowerCase().includes(keyword) ||
        conversation.other_user_email?.toLowerCase().includes(keyword)
    );
  }, [conversations, searchTerm]);

  async function fetchConversations(isPolling = false) {
    if (!token) return;

    if (!isPolling) setIsLoadingConversations(true);
    try {
      const response = await fetch(`${apiBaseUrl}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat daftar chat");
      }

      const nextConversations: ConversationItem[] = data.conversations ?? [];
      setConversations(nextConversations);

      if (nextConversations.length === 0) {
        setSelectedConversationId(null);
        setMessages([]);
      } else if (!selectedConversationId || !nextConversations.some((item) => item.id === selectedConversationId)) {
        setSelectedConversationId(nextConversations[0].id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat daftar chat");
    } finally {
      if (!isPolling) setIsLoadingConversations(false);
    }
  }

  async function fetchMessages(conversationId: number, isPolling = false) {
    if (!token) return;

    if (!isPolling) setIsLoadingMessages(true);
    try {
      const response = await fetch(`${apiBaseUrl}/messages/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat pesan");
      }

      setMessages(data.messages ?? []);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat pesan");
    } finally {
      if (!isPolling) setIsLoadingMessages(false);
    }
  }

  async function handleSendMessage() {
    if (!token || !selectedConversationId || !messageInput.trim()) return;

    setIsSending(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/messages/${selectedConversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: messageInput.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim pesan");
      }

      setMessageInput("");
      await fetchMessages(selectedConversationId);
      await fetchConversations();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengirim pesan");
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!token || isLoading) return;
    fetchConversations(false);
  }, [token, isLoading]);

  useEffect(() => {
    if (!token || !selectedConversationId) return;

    fetchMessages(selectedConversationId, false);
    const pollTimer = window.setInterval(() => {
      fetchMessages(selectedConversationId, true);
      fetchConversations(true);
    }, 4000);

    return () => window.clearInterval(pollTimer);
  }, [token, selectedConversationId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-sm text-slate-500">Memuat sesi pengguna...</div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Anda belum login</h2>
          <p className="text-sm text-slate-500 mb-4">Silakan login dulu untuk membuka pesan.</p>
          <Button variant="primary" onClick={() => router.push("/login")}>Ke Login</Button>
        </div>
      </div>
    );
  }

  return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in h-[calc(100vh-5rem)]">
    {errorMessage ? (
      <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{errorMessage}</div>
    ) : null}
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-full flex overflow-hidden">
      <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><IconSearch /></div>
            <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-[#8cbbed] text-sm" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 text-sm text-slate-500">Memuat percakapan...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Belum ada percakapan.</div>
          ) : (
            filteredConversations.map((conversation) => {
              const initial = conversation.other_user_name?.slice(0, 1).toUpperCase() || "?";
              const isActive = conversation.id === selectedConversationId;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full text-left p-4 border-b border-slate-100 hover:bg-white cursor-pointer transition-colors border-l-4 ${isActive ? "bg-white border-l-[#8cbbed]" : "border-l-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    {conversation.other_user_avatar ? (
                      <img src={conversation.other_user_avatar} alt={conversation.other_user_name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${isActive ? "bg-[#8cbbed] text-white" : "bg-slate-200 text-slate-500"} flex items-center justify-center font-bold text-lg shrink-0`}>{initial}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 truncate">{conversation.other_user_name || "User"}</h4>
                        <span className="text-xs text-slate-400">{formatTime(conversation.last_message_time)}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{conversation.last_message || "Belum ada pesan"}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="w-2/3 flex flex-col bg-white">
        {selectedConversation ? (
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => {
                if (selectedConversation.other_user_id) {
                  router.push(`/profile/${selectedConversation.other_user_id}`);
                }
              }}
            >
              {selectedConversation.other_user_avatar ? (
                <img src={selectedConversation.other_user_avatar} alt={selectedConversation.other_user_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#8cbbed] text-white flex items-center justify-center font-bold">{selectedConversation.other_user_name?.slice(0, 1).toUpperCase() || "?"}</div>
              )}
              <div>
                <h3 className="font-bold text-slate-800 hover:text-[#8cbbed] transition-colors">{selectedConversation.other_user_name || "User"}</h3>
                <p className="text-xs text-slate-500">Lagi chat dengan {selectedConversation.other_user_email || "-"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-100 bg-white shadow-sm z-10">
            <h3 className="font-bold text-slate-800">Pilih percakapan</h3>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {!selectedConversationId ? (
            <div className="text-sm text-slate-500">Pilih percakapan untuk mulai chat.</div>
          ) : isLoadingMessages ? (
            <div className="text-sm text-slate-500">Memuat pesan...</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-slate-500">Belum ada pesan. Kirim pesan pertama Anda.</div>
          ) : (
            messages.map((message) => {
              const isMine = String(message.sender_id) === String(user.id);
              return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[70%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                {isMine ? null : (
                  selectedConversation?.other_user_avatar ? (
                    <img src={selectedConversation.other_user_avatar} alt={selectedConversation.other_user_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">{(message.sender_name || "?").slice(0, 1).toUpperCase()}</div>
                  )
                )}
                <div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-[#8cbbed] text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"}`}>{message.content}</div>
                  <span className={`text-xs text-slate-400 mt-1 block ${isMine ? "text-right" : "text-left"}`}>{formatTime(message.created_at)}</span>
                </div>
              </div>
            </div>
          );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" disabled><IconPlus /></button>
            <input
              type="text"
              placeholder={selectedConversationId ? "Type a message..." : "Pilih percakapan dulu"}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-sm"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!selectedConversationId || isSending}
            />
            <Button variant="primary" className="rounded-full px-6" onClick={handleSendMessage} disabled={!selectedConversationId || !messageInput.trim() || isSending}>{isSending ? "Sending..." : "Send"}</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
