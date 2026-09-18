import { getSetting, SETTING_KEYS } from "@/lib/settings";
import EditDivisionClient from "./EditDivisionClient";
import WhatsAppBubble from "@/components/WhatsAppBubble";

export const dynamic = "force-dynamic";

export default async function EditDivisionPage() {
  const editOpen = await getSetting(SETTING_KEYS.DIVISION_EDIT_OPEN);

  // Default tertutup: fitur ini berperiode, admin harus membukanya sendiri.
  if (editOpen !== "true") {
    return (
      <main className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ISCOM" className="h-14 sm:h-16 w-auto mx-auto mb-4 object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Ubah Divisi ISCOM 2026</h1>
          </div>
          <div className="bg-[#131825] border border-white/[0.06] rounded-2xl p-6 sm:p-7">
            <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Ubah Divisi Belum Dibuka</h2>
            <p className="text-slate-400 text-sm">
              Perubahan divisi saat ini belum tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        </div>
        <WhatsAppBubble />
      </main>
    );
  }

  return <EditDivisionClient />;
}
