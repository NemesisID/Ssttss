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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Pendaftaran ISCOM</h1>
          <p className="text-sm text-slate-400 mt-1">UPN Veteran Jawa Timur</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? "bg-blue-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <PersonalInfoStep
            data={formData}
            onChange={updateForm}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <DivisionStep
            data={formData}
            onChange={updateForm}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <PlanStep
            data={formData}
            onChange={updateForm}
            onNext={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
        {step === 4 && registrationId && (
          <PaymentStep
            registrationId={registrationId}
            onSuccess={() => setStep(5)}
          />
        )}
        {step === 5 && registrationId && (
          <SuccessStep registrationId={registrationId} />
        )}
      </div>
    </main>
  );
}
