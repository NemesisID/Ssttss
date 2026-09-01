"use client";

import { useState } from "react";
import PersonalInfoStep from "@/components/forms/PersonalInfoStep";
import DivisionStep from "@/components/forms/DivisionStep";
import PlanStep from "@/components/forms/PlanStep";
import PaymentStep from "@/components/forms/PaymentStep";
import SuccessStep from "@/components/forms/SuccessStep";
import WhatsAppBubble from "@/components/WhatsAppBubble";

export type FormData = {
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
  divisions: string[];
  plan: string;
  paymentProofUrl?: string;
  registrationType: "MAHASISWA" | "UMUM";
};

export default function RegisterClient() {
  const [step, setStep] = useState(0); // 0 = type selector
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    npm: "",
    prodi: "",
    email: "",
    noWhatsapp: "",
    divisions: [],
    plan: "",
    registrationType: "MAHASISWA",
  });
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isUmum = formData.registrationType === "UMUM";

  const updateForm = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async (additionalData?: Partial<FormData>) => {
    setLoading(true);
    setError("");
    
    const dataToSubmit = { ...formData, ...additionalData };
    if (additionalData) {
      updateForm(additionalData);
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }
      setRegistrationId(json.registrationId);
      setStep(5); // Langsung ke SuccessStep
    } catch {
      setError("Gagal menghubungi server");
    }
    setLoading(false);
  };

  const handlePlanNext = () => {
    if (formData.plan === "FREE") {
      handleSubmit();
    } else {
      setStep(4); // Masuk ke PaymentStep
    }
  };

  const handleDivisionNext = () => {
    setStep(3); // Masuk ke PlanStep (semua tipe)
  };

  const handleSelectType = (type: "MAHASISWA" | "UMUM") => {
    setFormData({
      nama: "",
      npm: "",
      prodi: "",
      email: "",
      noWhatsapp: "",
      divisions: [],
      plan: type === "UMUM" ? "PAID_REG" : "",
      registrationType: type,
    });
    setStep(1);
  };

  return (
    <main className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <img
            src="/logo.png"
            alt="ISCOM"
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-white">Open Recruitment ISCOM 2026</h1>
          <p className="text-slate-400 text-sm mt-1">UPN Veteran Jawa Timur</p>
        </div>

        {/* Form card */}
        <div className="bg-[#131825] border border-white/[0.06] rounded-2xl p-7">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">Daftar Sebagai</h2>
                <p className="text-slate-500 text-sm mt-0.5">Pilih kategori pendaftaran kamu</p>
              </div>
              <button
                onClick={() => handleSelectType("MAHASISWA")}
                className="w-full p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/[0.06] text-left transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Mahasiswa UPN</p>
                    <p className="text-slate-500 text-xs mt-0.5">Mahasiswa aktif UPN Veteran Jawa Timur</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleSelectType("UMUM")}
                className="w-full p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] text-left transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                    <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 640 640">
                      <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Umum</p>
                    <p className="text-slate-500 text-xs mt-0.5">Peserta dari luar UPN (ada biaya pendaftaran)</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 1 && <PersonalInfoStep data={formData} onChange={updateForm} onNext={() => setStep(2)} onAlreadyRegistered={(id) => { setRegistrationId(id); setIsExistingUser(true); setStep(5); }} registrationType={formData.registrationType} />}
          {step === 2 && <DivisionStep data={formData} onChange={updateForm} onNext={handleDivisionNext} onBack={() => setStep(1)} />}
          {step === 3 && <PlanStep data={formData} onChange={updateForm} onNext={handlePlanNext} onBack={() => setStep(2)} loading={loading} />}
          {step === 4 && <PaymentStep onSuccess={(filePath) => handleSubmit({ paymentProofUrl: filePath })} registrationType={formData.registrationType} plan={formData.plan} />}
          {step === 5 && registrationId && <SuccessStep registrationId={registrationId} isExistingUser={isExistingUser} />}
        </div>

        <p className="mt-5 text-slate-600 text-xs text-center">&copy; 2026 ISCOM UPN Veteran Jawa Timur</p>
      </div>
      <WhatsAppBubble />
    </main>
  );
}

