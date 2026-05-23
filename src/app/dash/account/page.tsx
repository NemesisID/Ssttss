"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AccountPage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!currentPassword) {
      setError("Password saat ini wajib diisi");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/dash/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || undefined,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
      } else {
        setMessage(data.message || "Berhasil diperbarui");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Gagal menghubungi server");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Account</h1>
        <p className="text-slate-500 text-sm mt-1">Ubah username dan password</p>
      </div>

      {message && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Username</h2>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Username baru</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all duration-200"
              placeholder="Masukkan username baru"
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Password</h2>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Password saat ini <span className="text-red-400">*</span></label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all duration-200"
              placeholder="Masukkan password saat ini"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Password baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all duration-200"
              placeholder="Masukkan password baru (min. 6 karakter)"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Konfirmasi password baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all duration-200"
              placeholder="Ulangi password baru"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !currentPassword}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </span>
          ) : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
