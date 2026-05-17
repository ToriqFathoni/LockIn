"use client";

import { useRouter } from "next/navigation";
import { colors } from "@/components/freelance-hub/data";
import { IconCheckCircle, IconShieldCheck, IconStar, IconWallet } from "@/components/freelance-hub/icons";
import { Button } from "@/components/ui";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 flex flex-col items-start text-left z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-white shadow-sm border border-slate-100 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-slate-700">Trusted by 10,000+ businesses</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Find the perfect <br />
            <span style={{ color: colors.primary, position: "relative" }}>
              freelance talent
              <svg className="absolute w-full h-3 -bottom-1 left-0 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke={colors.secondary} strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Connect with top-tier professionals across the globe. From development to design, get your projects done faster and better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" onClick={() => router.push("/home")}>Find Talent</Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/home")}>Find Work</Button>
          </div>
        </div>

        <div className="lg:w-1/2 relative w-full aspect-square max-w-125 lg:max-w-none animate-fade-in mx-auto flex items-center justify-center mt-12 lg:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob" style={{ backgroundColor: colors.secondary }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: colors.primary }} />
          <div className="relative w-full max-w-105">
            <div className="relative z-10 bg-white/95 backdrop-blur-xl border border-slate-100 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transform hover:-translate-y-1 transition-transform duration-500">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xl">JS</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Senior React Developer</h3>
                  <p className="text-sm text-slate-500">Rp 400.000/jam • Top Rated</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-full" />
                <div className="h-3 bg-slate-100 rounded-full w-5/6" />
              </div>
              <div className="mt-6 flex gap-2">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">React</span>
                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">Node.js</span>
              </div>
            </div>
            <div className="absolute -left-4 md:-left-12 top-[20%] z-20 bg-white px-5 py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-slate-50 animate-float flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100"><IconCheckCircle /></div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Job Completed</p>
                <p className="text-xs text-slate-500">5 mins ago</p>
              </div>
            </div>
            <div className="absolute -right-4 md:-right-12 bottom-[15%] z-20 bg-white px-5 py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-slate-50 animate-float animation-delay-2000 flex items-center gap-3">
              <div className="text-[#8cbbed] font-bold text-lg px-2 bg-blue-50 rounded-lg">Rp</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">15.000.000</p>
                <p className="text-xs text-slate-500">Payment Released</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why choose LockIn?</h2>
            <p className="text-lg text-slate-600">We provide a secure, efficient, and transparent platform for both freelancers and clients to thrive.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Proof of Quality", desc: "Check any pro’s work samples, client reviews, and identity verification.", icon: () => <IconStar filled />, color: "text-amber-500", bg: "bg-amber-100" },
              { title: "Safe and Secure", desc: "Focus on your work knowing we help protect your data and privacy.", icon: IconShieldCheck, color: "text-blue-500", bg: "bg-blue-100" },
              { title: "No Cost Until You Hire", desc: "Interview potential fits, negotiate rates, and only pay for approved work.", icon: IconWallet, color: "text-green-500", bg: "bg-green-100" },
            ].map((feature, index) => (
              <div key={index} className="p-8 rounded-3xl border border-slate-200/60 hover:border-[#8cbbed]/50 hover:shadow-xl hover:shadow-[#8cbbed]/10 transition-all duration-300 bg-white group">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
