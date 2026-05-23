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
};

const STEP_LABELS = ["Data Diri", "Divisi", "Plan", "Bayar"];

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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }
      setRegistrationId(json.registrationId);
      if (json.plan === "FREE") {
        setStep(5);
      } else {
        setStep(4);
      }
    } catch {
      setError("Gagal menghubungi server");
    }
    setLoading(false);
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

        {/* Step indicator */}
        {step <= 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    i + 1 < step
                      ? "bg-blue-600 text-white"
                      : i + 1 === step
                      ? "bg-white text-[#0b0f1a]"
                      : "bg-white/10 text-slate-500"
                  }`}>
                    {i + 1 < step ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-[10px] ${i + 1 === step ? "text-white" : "text-slate-500"}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-6 h-px mb-4 ${i + 1 < step ? "bg-blue-600" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form card */}
        <div className="bg-[#131825] border border-white/[0.06] rounded-2xl p-7">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 && <PersonalInfoStep data={formData} onChange={updateForm} onNext={() => setStep(2)} />}
          {step === 2 && <DivisionStep data={formData} onChange={updateForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <PlanStep data={formData} onChange={updateForm} onNext={handleSubmit} onBack={() => setStep(2)} loading={loading} />}
          {step === 4 && registrationId && <PaymentStep registrationId={registrationId} onSuccess={() => setStep(5)} />}
          {step === 5 && registrationId && <SuccessStep registrationId={registrationId} />}
        </div>

        <p className="mt-5 text-slate-600 text-xs text-center">&copy; 2026 ISCOM UPN Veteran Jawa Timur</p>
      </div>
      <WhatsAppBubble />
    </main>
  );
}
