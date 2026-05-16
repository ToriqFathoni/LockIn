"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCheckCircle, IconClock, IconFileText, IconReceipt, IconShieldCheck, IconUpload, IconUser } from "../icons";
import { Button } from "../ui";

export const ManageJobPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "freelancer" ? "freelancer" : "client";
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "uploaded" | "confirmed">("pending");
  const [projectStatus, setProjectStatus] = useState<"active" | "completed">("active");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button onClick={() => router.push("/my-jobs")} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Dashboard
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900">Fullstack Developer for E-commerce MVP</h1>
              {projectStatus === "completed" ? <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Selesai</span> : null}
            </div>
            <p className="text-slate-500 text-sm">
              Status Kontrak: <span className={projectStatus === "completed" ? "text-green-600 font-bold" : "text-[#8cbbed] font-bold"}>{projectStatus === "completed" ? "Pekerjaan Selesai" : "Sedang Berlangsung (Active)"}</span>
            </p>
          </div>
          <div className="text-left md:text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Nilai Kontrak</p>
            <p className="text-xl font-black text-slate-800">Rp 20.000.000</p>
          </div>
        </div>
      </div>

      {projectStatus === "completed" ? (
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg mb-6">
            <IconCheckCircle />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Proyek Telah Diselesaikan!</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            {role === "client"
              ? "Terima kasih. Seluruh pembayaran telah dikonfirmasi dan proyek ini ditutup. Anda dapat memberikan ulasan untuk freelancer."
              : "Selamat! Klien telah menandai pekerjaan selesai. Dana sebesar Rp 20.000.000 telah masuk ke pendapatan Anda."}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={() => router.push("/home")}>Kembali ke Beranda</Button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><IconReceipt /> Tagihan Proyek</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Status Proyek</p>
                  <p className="text-sm font-bold text-slate-800">Pembayaran Penuh</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Nominal Pembayaran</p>
                  <p className="text-lg font-black text-[#8cbbed]">Rp 20.000.000</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><IconUser /> {role === "client" ? "Freelancer Anda" : "Klien Anda"}</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#8cbbed] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">{role === "client" ? "B" : "T"}</div>
                <p className="font-bold text-slate-800 text-lg">{role === "client" ? "Budi Santoso" : "TechNova Inc."}</p>
                <p className="text-sm text-slate-500 mb-4">{role === "client" ? "Senior Frontend Developer" : "Enterprise Client"}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/messages")}>Kirim Pesan</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><IconShieldCheck /> Status Pembayaran</h3>
              <div className="flex-1 flex flex-col justify-center">
                {role === "client" ? (
                  <div className="w-full max-w-lg mx-auto">
                    {paymentStatus === "pending" ? (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-[#8cbbed] mb-4"><IconUpload /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Unggah Bukti Pembayaran</h4>
                        <p className="text-slate-600 mb-6 text-sm">Silakan transfer sebesar <b>Rp 20.000.000</b> ke rekening sistem, lalu unggah struk di sini agar freelancer dapat mulai bekerja.</p>
                        <div className="border-2 border-dashed border-[#8cbbed] bg-blue-50/30 rounded-2xl p-8 hover:bg-blue-50 transition-colors cursor-pointer mb-6" onClick={() => setPaymentStatus("uploaded")}>
                          <span className="block font-bold text-[#8cbbed] mb-1">Klik di sini untuk mengunggah file</span>
                          <span className="text-xs text-slate-400">(Simulasi klik: JPG, PNG, PDF)</span>
                        </div>
                      </div>
                    ) : null}

                    {paymentStatus === "uploaded" ? (
                      <div className="text-center animate-fade-in bg-[#fdf7d6]/40 p-8 rounded-3xl border border-[#faebd7]">
                        <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mb-4"><IconClock /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Bukti Terkirim, Menunggu Konfirmasi</h4>
                        <p className="text-slate-600 mb-4 text-sm">Bukti transfer Anda sedang ditinjau oleh Freelancer. Anda akan diberitahu jika dana sudah dikonfirmasi masuk.</p>
                        <div className="inline-flex items-center gap-2 text-sm text-slate-700 font-semibold bg-white px-4 py-2 rounded-xl border border-slate-200">
                          <span className="text-[#8cbbed]"><IconFileText /></span> struk_transfer_proyek.jpg
                        </div>
                      </div>
                    ) : null}

                    {paymentStatus === "confirmed" ? (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4"><IconCheckCircle /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Pembayaran Diterima!</h4>
                        <p className="text-slate-600 mb-8 text-sm">Freelancer telah mengonfirmasi penerimaan dana untuk proyek ini. Jika seluruh pekerjaan telah selesai, Anda dapat menutup proyek.</p>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <p className="text-sm font-semibold text-slate-800 mb-4">Apakah seluruh target pekerjaan telah terpenuhi?</p>
                          <Button variant="primary" className="w-full bg-green-500 shadow-green-500/30" onClick={() => setProjectStatus("completed")}>Selesaikan Pekerjaan (Tutup Proyek)</Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="w-full max-w-lg mx-auto">
                    {paymentStatus === "pending" ? (
                      <div className="text-center animate-fade-in bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-4"><IconClock /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Menunggu Klien</h4>
                        <p className="text-slate-600 text-sm">Klien belum mengunggah bukti pembayaran untuk <b>Rp 20.000.000</b>. Anda tidak perlu melakukan apa-apa saat ini.</p>
                        <button onClick={() => setPaymentStatus("uploaded")} className="mt-6 text-xs text-slate-400 underline opacity-50 hover:opacity-100">Simulasikan klien mengirim bukti</button>
                      </div>
                    ) : null}

                    {paymentStatus === "uploaded" ? (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-[#8cbbed] mb-4"><IconReceipt /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Klien Telah Membayar</h4>
                        <p className="text-slate-600 mb-6 text-sm">Klien telah mengunggah bukti transfer. Silakan periksa mutasi rekening Anda, dan konfirmasi jika dana benar-benar telah masuk.</p>
                        <div className="flex flex-col gap-3">
                          <button className="flex items-center justify-center gap-2 w-full text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                            <span className="text-[#8cbbed]"><IconFileText /></span> Lihat Bukti Transfer
                          </button>
                          <Button variant="primary" className="w-full" style={{ background: "#10b981", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)" }} onClick={() => setPaymentStatus("confirmed")}>Ya, Dana Telah Masuk</Button>
                        </div>
                      </div>
                    ) : null}

                    {paymentStatus === "confirmed" ? (
                      <div className="text-center animate-fade-in bg-green-50/50 p-8 rounded-3xl border border-green-100">
                        <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm mb-4"><IconCheckCircle /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Pembayaran Selesai!</h4>
                        <p className="text-slate-600 text-sm">Pembayaran telah berhasil Anda konfirmasi. Silakan kerjakan proyek.</p>
                        <button onClick={() => setProjectStatus("completed")} className="mt-6 text-xs text-slate-400 underline opacity-50 hover:opacity-100">Simulasikan klien menyelesaikan proyek</button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};