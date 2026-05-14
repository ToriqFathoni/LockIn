"use client";

import { useRouter } from "next/navigation";
import { mockMessages } from "../data";
import { IconPlus, IconSearch } from "../icons";
import { Button } from "../ui";

export const MessagesPage = () => {
  const router = useRouter();

  return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in h-[calc(100vh-5rem)]">
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-full flex overflow-hidden">
      <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><IconSearch /></div>
            <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-[#8cbbed] text-sm" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 bg-white cursor-pointer border-l-4 border-l-[#8cbbed]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#8cbbed] text-white flex items-center justify-center font-bold text-lg shrink-0">T</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-slate-800 truncate">TechNova Inc.</h4>
                  <span className="text-xs text-slate-400">10:15 AM</span>
                </div>
                <p className="text-sm text-slate-500 truncate">Hello! Thank you. Yes, my schedule is...</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100 hover:bg-white cursor-pointer transition-colors border-l-4 border-l-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg shrink-0">F</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-slate-800 truncate">FinFlow Solutions</h4>
                  <span className="text-xs text-slate-400">Yesterday</span>
                </div>
                <p className="text-sm text-slate-500 truncate">Are you available for a quick call?</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-2/3 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8cbbed] text-white flex items-center justify-center font-bold">T</div>
            <div>
              <h3 className="font-bold text-slate-800">TechNova Inc.</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Online</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/manage-job?job=1&role=freelancer")}>View Contract</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {mockMessages.map((message) => (
            <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[70%] ${message.isMine ? "flex-row-reverse" : "flex-row"}`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">{message.avatar}</div>
                <div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${message.isMine ? "bg-[#8cbbed] text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"}`}>{message.text}</div>
                  <span className={`text-xs text-slate-400 mt-1 block ${message.isMine ? "text-right" : "text-left"}`}>{message.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><IconPlus /></button>
            <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-sm" />
            <Button variant="primary" className="rounded-full px-6">Send</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
