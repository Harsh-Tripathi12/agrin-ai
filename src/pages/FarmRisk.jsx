import { useEffect, useState } from "react";
import { getFarmRisk, getFarmer, getFarms } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { translateSeverityText, translateActionText } from "../utils/agriTranslations";
import { ShieldCheck, AlertTriangle, ShieldAlert, RefreshCw } from "lucide-react";

export default function FarmRisk() {
    const { user } = useAuth();
    const { language, isHindi, t } = useLanguage();

    const [data, setData] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const [farm, setFarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                    
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl border ${getRiskStyles(overallSev, true)} flex items-center gap-3`}>
                            {getRiskIcon(overallSev)}
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">
                                    {t("status", "Status")}
                                </span>
                                <span className="text-base font-extrabold capitalize">
                                    {translateSeverity(overallSev)}
                                </span>
                            </div>
                        </div>
                    </div>
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