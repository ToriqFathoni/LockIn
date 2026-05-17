"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCheckCircle, IconClock, IconFileText, IconMapPin, IconReceipt, IconShieldCheck, IconUpload, IconUser } from "@/components/freelance-hub/icons";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

function ManageJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const role = searchParams.get("role") === "freelancer" ? "freelancer" : "client";
  const { token, user } = useAuth();
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [project, setProject] = useState<any>(null);
  const [counterparty, setCounterparty] = useState<any>({ name: "Unknown", roleDesc: "", initial: "U" });
  
  useEffect(() => {
    async function loadData() {
      if (!token || !jobId) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const contractRes = await fetch(`${apiUrl}/contracts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const contractData = await contractRes.json();
        const foundContract = contractData.contracts?.find((c: any) => String(c.project_id) === String(jobId));
        setContract(foundContract || null);

        const projectRes = await fetch(`${apiUrl}/projects/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const projectData = await projectRes.json();
        const actualProject = projectData.project || projectData;
        setProject(actualProject);

        if (role === "client") {
           const bidsRes = await fetch(`${apiUrl}/bids/project/${jobId}`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           const bidsData = await bidsRes.json();
           const winnerBid = bidsData.bids?.find((b: any) => String(b.freelancer_id) === String(foundContract?.freelancer_id));
           
           setCounterparty({
             name: winnerBid?.freelancer_name || "Freelancer",
             roleDesc: "Freelancer Terpilih",
             initial: (winnerBid?.freelancer_name || "F").charAt(0).toUpperCase(),
             avatar: winnerBid?.profile_picture || null
           });
        } else {
           const clientName = actualProject?.client?.name || actualProject?.client_name || "Unknown Client";
           setCounterparty({
             name: clientName,
             roleDesc: "Klien / Pemilik Proyek",
             initial: clientName.charAt(0).toUpperCase(),
             avatar: actualProject?.client?.avatar || actualProject?.client_avatar || null
           });
        }

      } catch (err) {
        console.error(err);
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, jobId, role]);

  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const handleCompleteWork = async () => {
    if (!token || !contract) return;
    if (!paymentProofFile) {
      alert("Harap unggah bukti pembayaran terlebih dahulu.");
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", paymentProofFile);
      formData.append("upload_preset", "bukti_pembayaran");

      const uploadRes = await fetch("https://api.cloudinary.com/v1_1/dq8lsonxz/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah bukti pembayaran.");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.secure_url;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/contracts/${contract.id}/complete`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentProofUrl: imageUrl })
      });
      
      if (res.ok) {
        const data = await res.json();
        setContract(data.contract);
      } else {
        alert("Gagal mengonfirmasi penyelesaian.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!token || !contract) return;
    setActionLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/contracts/${contract.id}/confirm-payment`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContract(data.contract);
      } else {
        alert("Gagal mengonfirmasi pembayaran.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Memuat data...</div>;
  if (!contract) return <div className="p-20 text-center text-red-500">Kontrak tidak ditemukan untuk proyek ini.</div>;

  const isCompleted = contract.status === "completed";
  const clientConfirmed = !!contract.client_confirmed_at;
  const freelancerConfirmed = !!contract.freelancer_confirmed_at;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button onClick={() => router.push("/my-jobs")} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Dashboard
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900">{project?.title || "Project Management"}</h1>
              {isCompleted ? <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Selesai</span> : null}
            </div>
            <p className="text-slate-500 text-sm">
              Status Kontrak: <span className={isCompleted ? "text-green-600 font-bold" : "text-[#8cbbed] font-bold"}>{isCompleted ? "Pekerjaan Selesai" : "Sedang Berlangsung (Active)"}</span>
            </p>
          </div>
          <div className="text-left md:text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Nilai Kontrak</p>
            <p className="text-xl font-black text-slate-800">Rp {Number(contract.agreed_amount).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {isCompleted ? (
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg mb-6">
            <IconCheckCircle />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Proyek Telah Diselesaikan!</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            {role === "client"
              ? "Terima kasih. Seluruh pembayaran telah dikonfirmasi dan proyek ini ditutup. Anda dapat memberikan ulasan untuk freelancer."
              : "Selamat! Klien telah menandai pekerjaan selesai. Dana telah masuk ke pendapatan Anda."}
          </p>
          
          {contract?.payment_proof && (
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl inline-block border border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-2">Ref. Pembayaran Anda</p>
              <a 
                href={contract.payment_proof} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors"
               >
                <IconFileText /> Lihat Bukti Pembayaran
              </a>
            </div>
          )}

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
                  <p className="text-lg font-black text-[#8cbbed]">Rp {Number(contract.agreed_amount).toLocaleString('id-ID')}</p>
                </div>
                {contract.payment_proof && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Bukti Pembayaran</p>
                    <a 
                      href={contract.payment_proof} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <IconFileText /> Lihat Bukti
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><IconUser /> {role === "client" ? "Freelancer Anda" : "Klien Anda"}</h3>
              <div className="flex flex-col items-center text-center">
                {counterparty.avatar ? (
                  <img src={counterparty.avatar} alt={counterparty.name} className="w-16 h-16 rounded-full object-cover shadow-sm mb-3 border border-slate-100" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#8cbbed] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3 shrink-0">{counterparty.initial}</div>
                )}
                <p className="font-bold text-slate-800 text-lg">{counterparty.name}</p>
                <p className="text-sm text-slate-500 mb-4">{counterparty.roleDesc}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/messages")}>Kirim Pesan</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><IconShieldCheck /> Status Pekerjaan & Pembayaran</h3>
              <div className="flex-1 flex flex-col justify-center">
                {role === "client" ? (
                  <div className="w-full max-w-lg mx-auto">
                    {!clientConfirmed ? (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-[#8cbbed] mb-4"><IconClock /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Proyek Sedang Berjalan</h4>
                        <p className="text-slate-600 mb-6 text-sm">Freelancer sedang mengerjakan proyek ini. Jika seluruh pekerjaan telah selesai, silakan konfirmasi untuk memproses pembayaran.</p>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <p className="text-sm font-semibold text-slate-800 mb-4">Apakah seluruh target pekerjaan telah terpenuhi? Unggah bukti pembayaran.</p>
                          
                          <div className="mb-4 text-left">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Bukti Pembayaran (Wajib)</label>
                            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors p-4 flex flex-col items-center justify-center gap-2">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setPaymentProofFile(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <IconUpload className="w-6 h-6 text-slate-400" />
                              <span className="text-sm text-slate-600 font-medium">
                                {paymentProofFile ? paymentProofFile.name : "Klik atau seret gambar ke sini"}
                              </span>
                            </div>
                          </div>

                          <Button 
                            variant="primary" 
                            className="w-full bg-green-500 shadow-green-500/30" 
                            onClick={handleCompleteWork}
                            disabled={actionLoading || !paymentProofFile}
                          >
                            {actionLoading ? "Memproses..." : "Selesaikan Pekerjaan (Kirim Pembayaran)"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4"><IconClock /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Menunggu Konfirmasi Freelancer</h4>
                        <p className="text-slate-600 mb-4 text-sm">Anda telah menandai pekerjaan ini selesai. Kami sedang menunggu freelancer untuk mengonfirmasi penerimaan pembayaran.</p>
                        <div className="inline-flex items-center gap-2 text-sm text-slate-700 font-semibold bg-white px-4 py-2 rounded-xl border border-slate-200">
                           Status: Awaiting Freelancer Confirmation
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-lg mx-auto">
                    {!clientConfirmed ? (
                       <div className="text-center animate-fade-in bg-slate-50 p-8 rounded-3xl border border-slate-100">
                         <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center text-[#8cbbed] shadow-sm mb-4"><IconClock /></div>
                         <h4 className="font-bold text-slate-800 text-xl mb-2">Pekerjaan Sedang Berlangsung</h4>
                         <p className="text-slate-600 text-sm">Status saat ini adalah <b>Active / On-going</b>. Silakan selesaikan target pekerjaan Anda. Klien akan mengonfirmasi jika pekerjaan sudah selesai.</p>
                       </div>
                    ) : (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-[#8cbbed] mb-4"><IconReceipt /></div>
                        <h4 className="font-bold text-slate-800 text-xl mb-2">Konfirmasi Pembayaran</h4>
                        <p className="text-slate-600 mb-6 text-sm">Klien telah menandai pekerjaan selesai dan mengirimkan pembayaran sebesar <b>Rp {Number(contract.agreed_amount).toLocaleString('id-ID')}</b>. Silakan konfirmasi jika dana sudah Anda terima.</p>
                        <div className="flex flex-col gap-3">
                          <Button 
                            variant="primary" 
                            className="w-full" 
                            style={{ background: "#10b981", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)" }} 
                            onClick={handleConfirmPayment}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Memproses..." : "Ya, Saya Telah Menerima Pembayaran"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Memuat halaman...</div>}>
      <ManageJobContent />
    </Suspense>
  );
}