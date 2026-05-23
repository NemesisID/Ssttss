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
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    npm: "",
    prodi: "",
    email: "",
    noWhatsapp: "",
    divisions: [],
    plan: "",
  });
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setStep(5); // Langsung ke SuccessStep karena data sudah komplit (baik FREE maupun PAID yg sudah bayar)
    } catch {
      setError("Gagal menghubungi server");
    }
    setLoading(false);
  };

  const handlePlanNext = () => {
    if (formData.plan === "FREE") {
      handleSubmit();
    } else {
      setStep(4); // Masuk ke PaymentStep TANPA disave ke DB dulu
    }
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

          {step === 1 && <PersonalInfoStep data={formData} onChange={updateForm} onNext={() => setStep(2)} />}
          {step === 2 && <DivisionStep data={formData} onChange={updateForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <PlanStep data={formData} onChange={updateForm} onNext={handlePlanNext} onBack={() => setStep(2)} loading={loading} />}
          {step === 4 && <PaymentStep onSuccess={(filePath) => handleSubmit({ paymentProofUrl: filePath })} />}
          {step === 5 && registrationId && <SuccessStep registrationId={registrationId} />}
        </div>

        <p className="mt-5 text-slate-600 text-xs text-center">&copy; 2026 ISCOM UPN Veteran Jawa Timur</p>
      </div>
      <WhatsAppBubble />
    </main>
  );
}
