import { Globe2, Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
      <div className="flex items-center gap-2 mb-3">
        <Globe2 size={17} className="text-green-700" />
        <span className="text-sm font-semibold text-gray-700">
          {language === "en" ? "Choose your language" : "अपनी भाषा चुनें"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`relative flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
            language === "en"
              ? "border-green-600 bg-green-50 shadow-sm scale-[1.02]"
              : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
          }`}
        >
          <div>
            <p
              className={`font-semibold ${
                language === "en"
                  ? "text-green-700"
                  : "text-gray-800"
              }`}
            >
              🇬🇧 English
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              English
            </p>
          </div>

          {language === "en" && (
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center animate-in zoom-in duration-200">
              <Check size={14} className="text-white" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setLanguage("hi")}
          className={`relative flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
            language === "hi"
              ? "border-green-600 bg-green-50 shadow-sm scale-[1.02]"
              : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
          }`}
        >
          <div>
            <p
              className={`font-semibold ${
                language === "hi"
                  ? "text-green-700"
                  : "text-gray-800"
              }`}
            >
              🇮🇳 हिंदी
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Hindi
            </p>
          </div>

          {language === "hi" && (
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center animate-in zoom-in duration-200">
              <Check size={14} className="text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default LanguageSelector;