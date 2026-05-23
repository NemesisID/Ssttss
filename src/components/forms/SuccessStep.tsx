"use client";

import { useState, useEffect } from "react";

type WaGroup = {
  division: string;
  link: string;
};

type Props = {
  registrationId: string;
};

const DIVISION_LABELS: Record<string, string> = {
  PROGRAMMING: "Programming",
  DATA: "Data",
  BUSINESS_PLAN: "Business Plan",
  UI_UX: "UI/UX",
};

export default function SuccessStep({ registrationId }: Props) {
  const [groups, setGroups] = useState<WaGroup[]>([]);

  useEffect(() => {
    fetch(`/api/payment/status/${registrationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.waGroups) setGroups(data.waGroups);
      });
  }, [registrationId]);

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Pendaftaran Berhasil!</h2>
        <p className="text-slate-400 text-sm mt-2">Selamat datang di ISCOM UPN Veteran Jawa Timur</p>
      </div>

      {groups.length > 0 && (
        <div className="space-y-3">
          <p className="text-white font-medium">Gabung grup WhatsApp divisi kamu:</p>
          {groups.map((g) => (
            <a
              key={g.division}
              href={g.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-green-600/10 border border-green-500/20 rounded-lg hover:bg-green-600/20 transition"
            >
              <svg className="w-6 h-6 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              <span className="text-white font-medium">{DIVISION_LABELS[g.division] || g.division}</span>
              <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
