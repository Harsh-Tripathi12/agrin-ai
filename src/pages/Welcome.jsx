import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";

function Welcome() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const isHindi = language === "hi";

  return (
    <main className="min-h-screen bg-[#f4f7f1] md:px-4 md:py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-screen md:min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center">
        <div className="grid w-full h-full md:h-auto overflow-hidden md:rounded-[2rem] bg-white md:shadow-[0_20px_60px_rgba(35,70,40,0.10)] md:grid-cols-2">

          {/* LEFT / BRAND AREA (DESKTOP) */}
          <div className="relative hidden min-h-[680px] overflow-hidden bg-[#174c2c] p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-400/10" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-green-300/10" />

            <div className="relative z-10 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Sprout size={25} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">AgriN</span>
            </div>

            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/10 backdrop-blur-sm">
                <Leaf size={48} />
              </div>
              <h2 className="max-w-sm text-4xl font-extrabold leading-[1.12]">
                {isHindi ? "खेती के हर फैसले में आपका साथी।" : "Your farming companion for every decision."}
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-green-50/75">
                {isHindi ? "फसल, मौसम और खेत की जानकारी को समझकर बेहतर फैसले लें।" : "Understand your crops, weather and farm conditions to make better decisions."}
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <div className="rounded-2xl bg-white/10 p-3">
                <Sparkles size={18} />
                <p className="mt-2 text-xs text-white/80">{isHindi ? "AI सलाह" : "AI Advice"}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <Leaf size={18} />
                <p className="mt-2 text-xs text-white/80">{isHindi ? "स्वस्थ फसल" : "Healthy Crops"}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <ShieldCheck size={18} />
                <p className="mt-2 text-xs text-white/80">{isHindi ? "जोखिम जानकारी" : "Risk Insights"}</p>
              </div>
            </div>
          </div>

          {/* MOBILE BRAND HEADER */}
          <div className="md:hidden relative bg-gradient-to-b from-[#174c2c] to-[#16a34a] text-white px-6 py-12 overflow-hidden rounded-b-[2rem] shadow-sm">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 -mr-10 -mt-10" />
            <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-4 shadow-lg">
                <Sprout size={32} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">AgriN</h1>
              <p className="text-sm text-green-100 font-medium">
                {isHindi ? "स्मार्ट खेती, बेहतर भविष्य।" : "Smart farming, better future."}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs text-white/90">
                <Leaf size={14} /> <span>{isHindi ? "100% मुफ्त" : "100% Free"}</span>
              </div>
            </div>
          </div>

          {/* RIGHT / WELCOME CONTENT */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14 bg-white animate-in fade-in duration-700">
            
            <div className="max-w-md mx-auto w-full md:mx-0">
              <div className="hidden md:block animate-in fade-in slide-in-from-right-4 duration-500 delay-100 fill-mode-both">
                <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-600">
                  {isHindi ? "स्मार्ट खेती की शुरुआत" : "Start smart farming"}
                </p>
                <h1 className="text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-gray-950 sm:text-5xl">
                  {isHindi ? (
                    <>स्मार्ट खेती,<br />बेहतर भविष्य।</>
                  ) : (
                    <>Smart farming,<br />better future.</>
                  )}
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-7 text-gray-500">
                  {isHindi
                    ? "AgriN आपको फसल, मौसम और खेत से जुड़ी जानकारी समझने और बेहतर निर्णय लेने में मदद करता है।"
                    : "AgriN helps you understand your crops, weather and farm conditions so you can make better decisions."}
                </p>
              </div>

              <LanguageSelector />

              <div className="mt-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#16a34a] px-5 py-4 text-base font-semibold text-white shadow-lg shadow-green-600/25 transition-all duration-300 hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isHindi ? "शुरू करें" : "Get Started"}
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
                <div className="flex justify-center gap-4 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1"><span className="text-base">🤖</span> {isHindi ? "AI संचालित" : "AI Powered"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 self-center" />
                  <span className="flex items-center gap-1"><span className="text-base">🌾</span> {isHindi ? "मुफ्त" : "Free to Use"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 self-center" />
                  <span className="flex items-center gap-1"><span className="text-base">🗣️</span> Hindi + English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Welcome;