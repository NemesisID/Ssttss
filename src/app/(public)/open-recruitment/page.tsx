import { getSetting, SETTING_KEYS } from "@/lib/settings";
import RegisterClient from "./RegisterClient";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import Link from "next/link";

export const dynamic = "force-dynamic";

export type { FormData } from "./RegisterClient";

export default async function RegisterPage() {
  const [regOpen, closedMessage] = await Promise.all([
    getSetting(SETTING_KEYS.REGISTRATION_OPEN),
    getSetting(SETTING_KEYS.REGISTRATION_CLOSED_MESSAGE),
  ]);
  
  const displayMessage = closedMessage || "Mohon maaf, pendaftaran Open Recruitment ISCOM 2026 saat ini sedang ditutup atau belum dibuka.";
  
  if (regOpen === "false") {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans">
        {/* Custom Keyframes & Utility classes */}
        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          @keyframes shadow {
            0% { transform: translateX(-50%) scale(1); opacity: 0.5; }
            50% { transform: translateX(-50%) scale(0.7); opacity: 0.2; }
            100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .animate-shadow {
            animation: shadow 4s ease-in-out infinite;
          }
          .bg-dots {
            background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
            background-size: 24px 24px;
          }
        `}</style>
        
        {/* Clean subtle dot pattern background */}
        <div className="absolute inset-0 bg-dots pointer-events-none" />

        <div className="w-full max-w-lg z-10">
          
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="ISCOM" className="h-12 sm:h-14 w-auto object-contain opacity-90" />
          </div>

          {/* Clean, solid card structure (no excessive blurs or glassmorphism) */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative">
            
            {/* Mascot Container */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 relative">
              <div className="w-full h-full">
                <img 
                  src="/Sedih.webp" 
                  alt="Mascot Sedih ISCOM" 
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              {/* Ground Shadow for realistic floating effect */}
              <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-20 h-2 bg-black blur-[4px] rounded-[100%]" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Pendaftaran Ditutup</h1>
              <p className="text-slate-400 text-sm font-medium">Open Recruitment ISCOM 2026</p>
            </div>

            {/* Message Box */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex gap-4 items-start mb-8">
              <p className="text-slate-300 text-sm text-center leading-relaxed">
                {displayMessage}
              </p>
            </div>
          </div>
          
          <p className="mt-8 text-center text-slate-500 text-xs font-medium tracking-wide">
            &copy; 2026 ISCOM UPN Veteran Jawa Timur
          </p>
        </div>
        
        <WhatsAppBubble />
      </main>
    );
  }

  return <RegisterClient />;
}
