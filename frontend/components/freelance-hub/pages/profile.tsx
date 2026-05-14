"use client";

import { useState } from "react";
import { mockUser } from "../data";
import { IconBriefcase, IconClock, IconEdit, IconMapPin, IconTrophy, IconTrendingUp, IconUpload, IconX } from "../icons";
import { Badge, Button } from "../ui";

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{isEditing ? "Edit Profile Settings" : "My Profile"}</h1>
            <Button variant={isEditing ? "ghost" : "outline"} onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? <span className="flex items-center gap-2"><IconX /> Batal Edit</span> : <span className="flex items-center gap-2"><IconEdit /> Edit Profile</span>}
        </Button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-fade-in">
          <form className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="w-24 h-24 rounded-full bg-[#8cbbed] text-white flex items-center justify-center font-bold text-3xl shadow-md relative group cursor-pointer">
                {mockUser.name.charAt(0)}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><IconUpload /></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Profile Picture</h3>
                <p className="text-sm text-slate-500 mb-3">JPG or PNG no larger than 5MB.</p>
                <Button variant="outline" size="sm">Upload New</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                <input type="text" defaultValue={mockUser.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi</label>
                <input type="text" defaultValue={mockUser.location} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Professional Title</label>
              <input type="text" defaultValue={mockUser.title} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tarif per Jam (Rp)</label>
              <input type="text" defaultValue="350000" className="w-full md:w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bio Singkat</label>
              <textarea rows={4} defaultValue={mockUser.bio} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" />
            </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button variant="primary" onClick={() => setIsEditing(false)}>Simpan Perubahan</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-full bg-[#8cbbed] flex items-center justify-center text-white font-extrabold text-5xl shadow-lg border-4 border-white shrink-0">{mockUser.name.charAt(0)}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{mockUser.name}</h1>
                <p className="text-lg text-slate-600 font-medium mb-4">{mockUser.title}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><IconMapPin /> {mockUser.location}</span>
                  <span className="flex items-center gap-1"><IconClock /> {mockUser.hourlyRate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><IconTrendingUp /></div>
              <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Job Success</p><p className="text-2xl font-black text-slate-800">{mockUser.jobSuccess}</p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center"><IconTrophy /></div>
              <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Earned</p><p className="text-xl font-black text-slate-800">{mockUser.totalEarned}</p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center"><IconBriefcase /></div>
              <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Jobs Completed</p><p className="text-2xl font-black text-slate-800">42</p></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">About Me</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{mockUser.bio}</p>
            </div>
            <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit">
              <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Top Skills</h3>
              <div className="flex flex-wrap gap-2">{mockUser.skills.map((skill) => (<Badge key={skill} text={skill} type="default" />))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
