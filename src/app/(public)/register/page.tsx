"use client";

import { useState } from "react";
import PersonalInfoStep from "@/components/forms/PersonalInfoStep";
import DivisionStep from "@/components/forms/DivisionStep";
import PlanStep from "@/components/forms/PlanStep";
import PaymentStep from "@/components/forms/PaymentStep";
import SuccessStep from "@/components/forms/SuccessStep";

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
    <main className="min-h-screen relative overflow-hidden bg-[#0a0e1a]">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="ISCOM" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-medium tracking-wide uppercase">Open Registration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            ISCOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">2026</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Information System Community — UPN Veteran Jawa Timur</p>
        </div>

        {/* Step indicator */}
        {step <= 4 && (
          <div className="flex items-center gap-1 mb-6">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    i + 1 < step
                      ? "bg-blue-500 text-white"
                      : i + 1 === step
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white/5 text-slate-500 border border-white/10"
                  }`}>
                    {i + 1 < step ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 ${i + 1 === step ? "text-blue-400" : "text-slate-500"}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 h-[2px] mx-1 mb-4 rounded-full transition-colors ${i + 1 < step ? "bg-blue-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form card */}
        <div className="w-full max-w-md">
          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/20">
            {/* Card glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

            <div className="relative z-10">
              {error && (
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {step === 1 && <PersonalInfoStep data={formData} onChange={updateForm} onNext={() => setStep(2)} />}
              {step === 2 && <DivisionStep data={formData} onChange={updateForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
              {step === 3 && <PlanStep data={formData} onChange={updateForm} onNext={handleSubmit} onBack={() => setStep(2)} loading={loading} />}
              {step === 4 && registrationId && <PaymentStep registrationId={registrationId} onSuccess={() => setStep(5)} />}
              {step === 5 && registrationId && <SuccessStep registrationId={registrationId} />}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-slate-600 text-xs">ISCOM UPN Veteran Jawa Timur &copy; 2026</p>
      </div>
    </main>
  );
}
