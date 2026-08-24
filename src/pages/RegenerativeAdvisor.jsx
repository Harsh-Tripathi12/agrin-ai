import { useEffect, useState } from "react";
import { getRegenerativeAdvice } from "../services/api";
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

export default function RegenerativeAdvisor() {
    const language = localStorage.getItem("agrin_language") || "en";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAdvice();
    }, []);

    async function loadAdvice() {
        try {
            setLoading(true);
            const response = await getRegenerativeAdvice(language);
            setData(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-green-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-lg font-medium text-gray-700">Preparing your regenerative plan...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
                <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-sm border border-gray-100">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Couldn't load advice</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={loadAdvice}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const sections = [
        ["🌱 Soil Health", data?.soilHealth, "border-l-emerald-500"],
        ["💧 Water Management", data?.waterManagement, "border-l-blue-400"],
        ["🔄 Crop Rotation", data?.cropRotation, "border-l-amber-500"],
        ["🦋 Biodiversity", data?.biodiversity, "border-l-purple-400"],
        ["🍂 Organic Matter", data?.organicMatter, "border-l-orange-400"],
        ["🌿 Reduced Disturbance", data?.reducedDisturbance, "border-l-lime-500"],
    ];

    const getDifficultyStyle = (difficulty) => {
        const d = difficulty?.toLowerCase();
        if (d === 'easy') return 'bg-green-100 text-green-800';
        if (d === 'medium') return 'bg-amber-100 text-amber-800';
        if (d === 'hard') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-green-50 px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 text-center">
                    <p className="text-sm font-bold tracking-wider text-green-700 uppercase">
                        AgriN
                    </p>
                    <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
                        Regenerative Advisor 🌱
                    </h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Practical ways to improve soil, water and long-term farm resilience.
                    </p>
                </div>

                <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
                    <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
                    <div className="p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Your Strategic Plan
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed text-lg">
                            {data?.summary}
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {sections.map(([title, items, borderClass]) => (
                        <div
                            key={title}
                            className={`rounded-2xl bg-white p-6 shadow-sm border-y border-r border-gray-100 border-l-4 ${borderClass} hover:shadow-md transition-shadow`}
                        >
                            <h3 className="text-lg font-bold text-gray-900">
                                {title}
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {items?.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-8 rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Priority Actions
                    </h2>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data?.priorityActions?.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col rounded-2xl bg-gray-50 p-5 border border-gray-100 hover:border-green-200 transition-colors"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                                        {item.action}
                                    </h4>
                                    <span className={`inline-flex flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getDifficultyStyle(item.difficulty)}`}>
                                        {item.difficulty}
                                    </span>
                                </div>
                                <p className="mt-auto text-sm text-gray-600">
                                    {item.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}