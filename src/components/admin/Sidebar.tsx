"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dash", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dash/wa-groups", label: "Grup WA", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/dash/registrations", label: "Peserta", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/dash/settings", label: "Pengaturan", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Helper untuk menentukan apakah menu sedang aktif
  // Khusus untuk /dash, pastikan pathname benar-benar sama agar tidak aktif di semua subpage
  const isMenuActive = (href: string) => {
    if (href === "/dash") return pathname === "/dash";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white/[0.02] border-r border-white/[0.06] p-5 flex flex-col">
      {/* Brand */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ISCOM" className="h-10 w-auto object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-3 mb-2">Menu</p>
        {NAV_ITEMS.map((item) => {
          const active = isMenuActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border border-blue-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <svg className={`w-[18px] h-[18px] shrink-0 ${active ? "text-blue-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] pt-4 mt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/dash/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/[0.05] transition-all duration-200 w-full"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
