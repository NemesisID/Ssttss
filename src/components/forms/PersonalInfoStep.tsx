"use client";

import { useState } from "react";
import { personalInfoSchema } from "@/lib/validation";
import type { FormData } from "@/app/(public)/open-recruitment/page";

type Props = {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
};

export default function PersonalInfoStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);

  const validate = () => {
    const result = personalInfoSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = async () => {
    if (!validate()) return;
    
    setChecking(true);
    try {
      const res = await fetch("/api/check-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm: data.npm, email: data.email }),
      });
      
      if (!res.ok) {
        // Fallback or rate limit, we let them pass and catch at final step if needed
        // Or we can show the error from the response
        const json = await res.json();
        if (json.error) {
          setErrors({ ...errors, server: json.error });
        }
        setChecking(false);
        return;
      }
      
      const result = await res.json();
      if (result.exists) {
        if (result.field === "NPM") {
          setErrors({ npm: "NPM sudah terdaftar" });
        } else {
          setErrors({ email: "Email sudah terdaftar" });
        }
        setChecking(false);
        return;
      }
      
      onNext();
    } catch (err) {
      setChecking(false);
      onNext(); // Allow bypassing if server is down (caught later)
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3.5 bg-white/[0.04] border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm ${
      errors[field] ? "border-red-500/50 bg-red-500/[0.03]" : "border-white/[0.08] hover:border-white/[0.15]"
    }`;

  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Data Diri</h2>
        <p className="text-slate-500 text-sm mt-0.5">Lengkapi informasi pribadi kamu</p>
      </div>

      {errors.server && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {errors.server}
        </div>
      )}

      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">Nama Lengkap</label>
        <input
          type="text"
          placeholder="Masukkan nama lengkap"
          value={data.nama}
          onChange={(e) => onChange({ nama: e.target.value })}
          className={inputClass("nama")}
        />
        {errors.nama && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.nama}</p>}
      </div>

      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">NPM</label>
        <input
          type="text"
          placeholder="Masukkan NPM"
          value={data.npm}
          onChange={(e) => onChange({ npm: e.target.value })}
          className={inputClass("npm")}
        />
        {errors.npm && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.npm}</p>}
      </div>

      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">Program Studi</label>
        <select
          value={data.prodi}
          onChange={(e) => onChange({ prodi: e.target.value })}
          className={inputClass("prodi")}
        >
          <option value="" disabled>Pilih Program Studi</option>
          <option value="INFORMATIKA">Informatika</option>
          <option value="SISTEM_INFORMASI">Sistem Informasi</option>
          <option value="SAINS_DATA">Sains Data</option>
          <option value="BISNIS_DIGITAL">Bisnis Digital</option>
        </select>
        {errors.prodi && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.prodi}</p>}
      </div>

      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">Email UPN</label>
        <input
          type="email"
          placeholder="npm@student.upnjatim.ac.id"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className={inputClass("email")}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.email}</p>}
      </div>

      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">No. WhatsApp</label>
        <input
          type="text"
          placeholder="08xxxxxxxxxx"
          value={data.noWhatsapp}
          onChange={(e) => onChange({ noWhatsapp: e.target.value })}
          className={inputClass("noWhatsapp")}
        />
        {errors.noWhatsapp && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.noWhatsapp}</p>}
      </div>

      <button
        onClick={handleNext}
        disabled={checking}
        className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98] disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {checking ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Mengecek Data...
          </span>
        ) : (
          "Selanjutnya"
        )}
      </button>
    </div>
  );
}
