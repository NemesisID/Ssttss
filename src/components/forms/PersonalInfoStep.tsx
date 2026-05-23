"use client";

import { useState } from "react";
import { personalInfoSchema } from "@/lib/validation";
import type { FormData } from "@/app/(public)/register/page";

type Props = {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
};

export default function PersonalInfoStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
      errors[field] ? "border-red-500" : "border-white/10"
    }`;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Data Diri</h2>

      <div>
        <input
          type="text"
          placeholder="Nama Lengkap"
          value={data.nama}
          onChange={(e) => onChange({ nama: e.target.value })}
          className={inputClass("nama")}
        />
        {errors.nama && <p className="text-red-400 text-xs mt-1">{errors.nama}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="NPM"
          value={data.npm}
          onChange={(e) => onChange({ npm: e.target.value })}
          className={inputClass("npm")}
        />
        {errors.npm && <p className="text-red-400 text-xs mt-1">{errors.npm}</p>}
      </div>

      <div>
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
        {errors.prodi && <p className="text-red-400 text-xs mt-1">{errors.prodi}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email (@student.upnjatim.ac.id)"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className={inputClass("email")}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="No. WhatsApp (08xxx)"
          value={data.noWhatsapp}
          onChange={(e) => onChange({ noWhatsapp: e.target.value })}
          className={inputClass("noWhatsapp")}
        />
        {errors.noWhatsapp && <p className="text-red-400 text-xs mt-1">{errors.noWhatsapp}</p>}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
      >
        Selanjutnya
      </button>
    </div>
  );
}
