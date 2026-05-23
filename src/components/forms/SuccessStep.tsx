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

const DIVISION_ICONS: Record<string, string> = {
  PROGRAMMING: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  DATA: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
  BUSINESS_PLAN: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  UI_UX: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
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
      <div className="relative">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Pendaftaran Berhasil!</h2>
        <p className="text-slate-400 text-sm mt-2">Selamat bergabung di ISCOM 2026</p>
      </div>

      {groups.length > 0 && (
        <div className="space-y-2.5 text-left">
          <p className="text-slate-300 text-sm font-medium text-center mb-3">Gabung grup WhatsApp divisi kamu:</p>
          {groups.map((g) => (
            <a
              key={g.division}
              href={g.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl hover:bg-emerald-500/[0.1] hover:border-emerald-500/30 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={DIVISION_ICONS[g.division] || "M13 10V3L4 14h7v7l9-11h-7z"} />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{DIVISION_LABELS[g.division] || g.division}</p>
                <p className="text-emerald-400/70 text-xs">Tap untuk gabung grup</p>
              </div>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
