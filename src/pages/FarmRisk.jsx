import { useEffect, useState } from "react";
import { getFarmRisk, getFarmer, getFarms, sendRiskTelegramAlertApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { sendWhatsAppRiskAlert, formatWhatsAppRiskMessage } from "../services/whatsappService";
import { formatTelegramRiskMessage } from "../services/telegramService";
import { translateSeverityText, translateActionText } from "../utils/agriTranslations";
import { ShieldCheck, AlertTriangle, ShieldAlert, RefreshCw, Loader2, Sparkles, MapPin, MessageCircle, Send, CheckCircle2, Phone, Bot, Info, ExternalLink } from "lucide-react";

export default function FarmRisk() {
    const { user } = useAuth();
    const { language, isHindi, t } = useLanguage();

    const [data, setData] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const [farm, setFarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Contact state (auto-fetched from farmer profile & localStorage)
    const [phone, setPhone] = useState(() => localStorage.getItem("agrin_farmer_phone") || "");
    const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem("agrin_telegram_chat_id") || "");
    const [showContactEdit, setShowContactEdit] = useState(false);
    const [tempPhone, setTempPhone] = useState("");
    const [tempTelegramId, setTempTelegramId] = useState("");
    const [alertSent, setAlertSent] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [telegramSending, setTelegramSending] = useState(false);
    const [telegramSuccess, setTelegramSuccess] = useState("");
    const [telegramError, setTelegramError] = useState("");
    const [showTelegramHelp, setShowTelegramHelp] = useState(false);

    useEffect(() => {
        loadRisk();
    }, []);

    async function loadRisk() {
        try {
            setLoading(true);
            setError("");

            const farmerId = user?.uid || localStorage.getItem("agrin_farmer_id");
            if (farmerId) {
                getFarmer(farmerId).then(res => {
                    if (res?.data) {
                        setFarmer(res.data);
                        if (res.data.phone) {
                            setPhone(res.data.phone);
                            localStorage.setItem("agrin_farmer_phone", res.data.phone);
                        }
                        if (res.data.telegramChatId) {
                            setTelegramChatId(res.data.telegramChatId);
                            localStorage.setItem("agrin_telegram_chat_id", res.data.telegramChatId);
                        }
                    }
                }).catch(() => {});

                getFarms(farmerId).then(res => {
                    if (res?.data?.length > 0) {
                        setFarm(res.data[0]);
                    }
                }).catch(() => {});
            }

            const response = await getFarmRisk();
            setData(response.data);
        } catch (err) {
            console.error("Load risk error:", err);
            setError(err.message || t("analysisFailed", "Risk Analysis Failed"));
        } finally {
            setLoading(false);
        }
    }

    const handleSendWhatsAppAlert = (singleRisk = null) => {
        const riskPayload = singleRisk ? {
            overallRisk: singleRisk.severity,
            risks: [singleRisk],
        } : data;

        sendWhatsAppRiskAlert({
            phoneNumber: phone || localStorage.getItem("agrin_farmer_phone") || "",
            farmer,
            farm,
            risk: riskPayload,
            weather: data?.weather,
            language
        });

        setAlertSent(true);
        setTimeout(() => setAlertSent(false), 5000);
    };

    const handleSendTelegramAlert = async (singleRisk = null) => {
        if (!telegramChatId.trim()) {
            setTelegramError(isHindi ? "कृपया अपनी टेलीग्राम चैट आईडी दर्ज करें।" : "Please enter your Telegram Chat ID.");
            return;
        }

        try {
            setTelegramSending(true);
            setTelegramError("");
            setTelegramSuccess("");

            await sendRiskTelegramAlertApi({
                chatId: telegramChatId.trim(),
                language,
            });

            localStorage.setItem("agrin_telegram_chat_id", telegramChatId.trim());
            setTelegramSuccess(isHindi ? "स्वचालित टेलीग्राम अलर्ट सफलतापूर्वक भेजा गया! ✓" : "Automated Telegram Alert Delivered! ✓");
            setTimeout(() => setTelegramSuccess(""), 6000);
        } catch (err) {
            console.error("Telegram alert error:", err);
            setTelegramError(err.message || (isHindi ? "अलर्ट भेजने में विफल। कृपया चैट आईडी जांचें।" : "Failed to deliver Telegram alert. Please check Chat ID."));
        } finally {
            setTelegramSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7faf5]">
                <div className="h-16 w-16 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-800">
                    {t("analyzingRisks", "Analyzing farm risks...")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    {isHindi ? "मौसम और फसल की स्थिति जांची जा रही है..." : "Evaluating local weather patterns and crops..."}
                </p>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7faf5] px-4">
                <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="rounded-full bg-red-50 p-4 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {t("analysisFailed", "Risk Analysis")}
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={loadRisk}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700 shadow-md shadow-green-600/20"
                    >
                        <RefreshCw className="h-4 w-4" />
                        {t("retry", "Try Again")}
                    </button>
                </div>
            </div>
        );
    }

    const getRiskStyles = (severity, overall = false) => {
        const s = severity?.toLowerCase();
        if (s === 'low') {
            return overall 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'border-l-green-500 bg-white';
        }
        if (s === 'medium') {
            return overall 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'border-l-amber-500 bg-white';
        }
        if (s === 'high') {
            return overall 
                ? 'bg-red-50 text-red-800 border-red-200' 
                : 'border-l-red-500 bg-white';
        }
        return 'bg-gray-50 text-gray-800 border-gray-200';
    };

    const getRiskIcon = (severity) => {
        const s = severity?.toLowerCase();
        if (s === 'low') return <ShieldCheck className="h-8 w-8 text-green-600" />;
        if (s === 'medium') return <AlertTriangle className="h-8 w-8 text-amber-600" />;
        if (s === 'high') return <ShieldAlert className="h-8 w-8 text-red-600" />;
        return <ShieldCheck className="h-8 w-8 text-gray-600" />;
    };

    const translateSeverity = (sev) => {
        const s = (sev || "").toLowerCase();
        if (s === "low") return t("low", "Low");
        if (s === "medium") return t("medium", "Medium");
        if (s === "high") return t("high", "High");
        return t("unknown", "Unknown");
    };

    const overallSev = data?.overallRisk || "low";

    return (
        <div className="min-h-screen bg-[#f7faf5] px-4 py-8 md:px-6">
            <div className="mx-auto max-w-4xl">
                
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        {t("farmRisk", "Farm Risk")}
                    </div>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
                        {t("recentAlerts", "Farm Risk Alerts & Status")} ⚠️
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                        {t("riskNotice", "Current risks calculated from your farm and weather conditions.")}
                    </p>
                </div>

                {/* Overall Risk Card */}
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("riskLevel", "Overall Risk Level")}
                        </p>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 capitalize">
                            {translateSeverity(overallSev)} {isHindi ? "जोखिम" : "Risk"}
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-md">
                            {isHindi
                                ? "यह विश्लेषण आपके खेत के स्थान, तापमान, नमी और बारिश के पूर्वानुमान पर आधारित है।"
                                : "Calculated from your location, temperature, humidity and rainfall forecast."}
                        </p>
                    </div>
                    
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleSendWhatsAppAlert()}
                                className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-3.5 font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition"
                                title="Send WhatsApp Alert"
                            >
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{isHindi ? "📱 व्हाट्सएप अलर्ट" : "📱 WhatsApp Alert"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setAlertChannel("telegram");
                                    handleSendTelegramAlert();
                                }}
                                disabled={telegramSending}
                                className="flex items-center justify-center gap-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white px-4 py-3.5 font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition disabled:opacity-60"
                                title="Send Automated Telegram Alert"
                            >
                                {telegramSending ? (
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                ) : (
                                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                                <span>{isHindi ? "🤖 टेलीग्राम अलर्ट" : "🤖 Telegram Alert"}</span>
                            </button>
                        </div>
                    </div>


                {/* Simplified Farmer Alert Card (Low Fatigue & Direct) */}
                <div className="mt-6 rounded-3xl bg-white p-6 sm:p-7 border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>🌾</span>
                                {isHindi ? "तुरंत खेत जोखिम अलर्ट सूचनाएं" : "Instant Farm Risk Alerts"}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                {isHindi
                                    ? "अपने खेत के मौसम, खतरों और विस्तृत समाधान को व्हाट्सएप या टेलीग्राम पर तुरंत पाएं।"
                                    : "Get real-time farm threats and actionable remedies delivered directly to your phone."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTempPhone(phone);
                                    setTempTelegramId(telegramChatId);
                                    setShowContactEdit(!showContactEdit);
                                }}
                                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition"
                            >
                                ✏️ {showContactEdit ? (isHindi ? "बंद करें" : "Close") : (isHindi ? "नंबर / चैट आईडी बदलें" : "Edit Phone / Chat ID")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowTelegramHelp(!showTelegramHelp)}
                                className="text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200/60 transition"
                            >
                                💡 {showTelegramHelp ? (isHindi ? "गाइड बंद करें" : "Hide Guide") : (isHindi ? "टेलीग्राम गाइड" : "Telegram Guide")}
                            </button>
                        </div>
                    </div>

                    {/* Inline Contact Editor */}
                    {showContactEdit && (
                        <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 animate-in fade-in duration-200">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                {isHindi ? "अलर्ट संपर्क जानकारी अपडेट करें:" : "Update Alert Contact Information:"}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        📱 {isHindi ? "मोबाइल नंबर (व्हाट्सएप)" : "Mobile Number (WhatsApp)"}
                                    </label>
                                    <input
                                        type="tel"
                                        value={tempPhone}
                                        onChange={(e) => setTempPhone(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        🤖 {isHindi ? "टेलीग्राम चैट आईडी (वैकल्पिक)" : "Telegram Chat ID (Optional)"}
                                    </label>
                                    <input
                                        type="text"
                                        value={tempTelegramId}
                                        onChange={(e) => setTempTelegramId(e.target.value)}
                                        placeholder="e.g. 123456789"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowContactEdit(false)}
                                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                                >
                                    {isHindi ? "रद्द करें" : "Cancel"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveContact}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition"
                                >
                                    {isHindi ? "सहेजें ✓" : "Save Changes ✓"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Telegram Quick Guide */}
                    {showTelegramHelp && (
                        <div className="mt-4 p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-950 animate-in fade-in duration-200 space-y-2">
                            <p className="font-bold text-sky-900 flex items-center gap-1.5">
                                <Bot className="w-4 h-4 text-sky-700" />
                                {isHindi ? "📌 टेलीग्राम चैट आईडी 5 सेकंड में कैसे प्राप्त करें:" : "📌 How to get your Telegram Chat ID in 5 seconds:"}
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-1 leading-relaxed">
                                <li>
                                    {isHindi
                                        ? "टेलीग्राम में @AgrinAlertBot सर्च करें और 'START' दबाएं (ताकि बॉट आपको अलर्ट भेज सके)।"
                                        : "Search @AgrinAlertBot on Telegram and tap 'START' (allows the bot to message you)."}
                                </li>
                                <li>
                                    {isHindi
                                        ? "टेलीग्राम में @userinfobot सर्च करें और 'START' दबाएं। यह आपको आपकी संख्यात्मक आईडी (Id) बताएगा।"
                                        : "Search @userinfobot on Telegram and tap 'START' to view your numeric user ID."}
                                </li>
                                <li>
                                    {isHindi
                                        ? "उस आईडी को यहां सहेजें और स्वचालित अलर्ट का लाभ उठाएं (100% मुफ़्त)।"
                                        : "Save the ID number here to receive 100% free automated background alerts."}
                                </li>
                            </ol>
                        </div>
                    )}

                    {/* 2 Clean Alert Delivery Options */}
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Option 1: WhatsApp 1-Click */}
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-200 transition">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                            <MessageCircle className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm">
                                            {isHindi ? "व्हाट्सएप अलर्ट (1-क्लिक)" : "WhatsApp Alert (1-Click)"}
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                        {isHindi ? "1-क्लिक" : "1-Click"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                    {isHindi
                                        ? "किसान के व्हाट्सएप पर विस्तृत विश्लेषण, मौसम और समाधान तुरंत भेजें।"
                                        : "Sends detailed weather, hazards, and remedial actions straight to WhatsApp."}
                                </p>
                                <div className="text-xs text-gray-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100/80 mb-4 flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                        {isHindi ? "नंबर:" : "Phone:"} <strong className="font-semibold text-gray-900">{phone || (isHindi ? "दर्ज नहीं" : "Not set")}</strong>
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSendWhatsAppAlert()}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-2.5 px-4 font-bold text-xs shadow-sm shadow-emerald-600/20 transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>{alertSent ? (isHindi ? "अलर्ट भेजा गया! ✓" : "Alert Sent! ✓") : (isHindi ? "व्हाट्सएप पर भेजें" : "Send WhatsApp Alert")}</span>
                            </button>
                        </div>

                        {/* Option 2: Telegram Automated */}
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 sm:p-5 flex flex-col justify-between hover:border-sky-200 transition">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm">
                                            {isHindi ? "टेलीग्राम अलर्ट (स्वचालित)" : "Telegram Alert (Automated)"}
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                                        {isHindi ? "100% स्वचालित" : "Automated Bot"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                    {isHindi
                                        ? "बिना किसी झंझट सीधे किसान के टेलीग्राम ऐप पर 24x7 बैकग्राउंड सूचना।"
                                        : "Automated background delivery via @AgrinAlertBot directly to your phone."}
                                </p>
                                <div className="text-xs text-gray-700 bg-white/80 p-2.5 rounded-xl border border-sky-100/80 mb-4 flex items-center gap-2">
                                    <Send className="w-3.5 h-3.5 text-sky-600" />
                                    <span>
                                        {isHindi ? "चैट आईडी:" : "Chat ID:"} <strong className="font-semibold text-gray-900">{telegramChatId || (isHindi ? "वैकल्पिक (Optional)" : "Optional (Not set)")}</strong>
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSendTelegramAlert()}
                                disabled={telegramSending}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white py-2.5 px-4 font-bold text-xs shadow-sm shadow-sky-600/20 transition disabled:opacity-60"
                            >
                                {telegramSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{isHindi ? "भेजा जा रहा है..." : "Sending..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Bot className="w-4 h-4" />
                                        <span>{isHindi ? "टेलीग्राम पर भेजें" : "Send Telegram Alert"}</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>

                    {/* Status Feedback Alerts */}
                    {telegramSuccess && (
                        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{telegramSuccess}</span>
                        </div>
                    )}

                    {telegramError && (
                        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2 text-xs font-semibold text-red-800 animate-in fade-in">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>{telegramError}</span>
                        </div>
                    )}
                </div>

                {/* Detailed Assessment */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                            {t("detailedAssessment", "Detailed Risk Assessment")}
                        </h2>
                        <button
                            type="button"
                            onClick={loadRisk}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            {isHindi ? "ताज़ा करें" : "Refresh"}
                        </button>
                    </div>
                    
                    <div className="grid gap-4">
                        {(!data?.risks || data.risks.length === 0) ? (
                            <div className="rounded-3xl bg-white p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                                <div className="rounded-full bg-green-50 p-5 mb-4 border border-green-100">
                                    <ShieldCheck className="h-12 w-12 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {t("allClear", "All Clear!")}
                                </h3>
                                <p className="mt-2 text-gray-600 text-sm max-w-sm">
                                    {t("allClearDesc", "No significant risks detected for your farm right now. Keep up the good work!")}
                                </p>
                            </div>
                        ) : (
                            data.risks.map((risk, index) => {
                                const rawTitle = risk.title || "";
                                const rawMessage = risk.message || "";
                                const rawAction = risk.action || "";

                                const title = (isHindi && risk.title_hi) ? risk.title_hi : rawTitle;
                                const message = (isHindi && risk.message_hi) ? risk.message_hi : rawMessage;
                                const action = (isHindi && risk.action_hi) ? risk.action_hi : translateActionText(rawAction, isHindi);

                                return (
                                    <div
                                        key={index}
                                        className={`rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 ${getRiskStyles(risk.severity, false)} transition hover:shadow-md`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                                    {title}
                                                </h3>
                                                <p className="mt-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                    {message}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 self-start">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                                    risk.severity?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                                                    risk.severity?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {translateSeverity(risk.severity)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendWhatsAppAlert(risk)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
                                                    title="Share this threat on WhatsApp"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>{isHindi ? "व्हाट्सएप" : "WhatsApp"}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSendTelegramAlert(risk)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 transition"
                                                    title="Send this threat via Telegram"
                                                >
                                                    <Bot className="w-3.5 h-3.5 text-sky-600" />
                                                    <span>{isHindi ? "टेलीग्राम" : "Telegram"}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {action && (
                                            <div className="mt-4 rounded-xl bg-green-50/80 p-3.5 border border-green-100 flex items-start gap-2.5">
                                                <ShieldCheck className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                                                <div className="text-xs sm:text-sm">
                                                    <strong className="text-green-950 font-bold block mb-0.5">
                                                        {t("recommendedAction", "Recommended Action")}:
                                                    </strong>
                                                    <p className="text-green-900 leading-snug">
                                                        {action}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}