import { useEffect, useState } from "react";
import { getFarmRisk } from "../services/api";
import { ShieldCheck, AlertTriangle, ShieldAlert, RefreshCw, Loader2 } from "lucide-react";

export default function FarmRisk() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadRisk();
    }, []);

    async function loadRisk() {
        try {
            setLoading(true);
            const response = await getFarmRisk();
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
                <p className="text-lg font-medium text-gray-700">Analyzing farm risks...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
                <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="rounded-full bg-red-50 p-4 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={loadRisk}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const getRiskStyles = (severity, overall = false) => {
        const s = severity?.toLowerCase();
        if (s === 'low') {
            return overall 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'border-l-green-500 bg-white';
        }
        if (s === 'medium') {
            return overall 
                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                : 'border-l-amber-500 bg-white';
        }
        if (s === 'high') {
            return overall 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : 'border-l-red-500 bg-white';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getRiskIcon = (severity) => {
        const s = severity?.toLowerCase();
        if (s === 'low') return <ShieldCheck className="h-8 w-8 text-green-600" />;
        if (s === 'medium') return <AlertTriangle className="h-8 w-8 text-amber-600" />;
        if (s === 'high') return <ShieldAlert className="h-8 w-8 text-red-600" />;
        return <ShieldCheck className="h-8 w-8 text-gray-600" />;
    };

    return (
        <div className="min-h-screen bg-green-50 px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Farm Risk ⚠️
                    </h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Current risks calculated from your farm and weather conditions.
                    </p>
                </div>

                <div className="mt-8 rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Overall Risk Level
                        </p>
                        <p className="text-gray-600 text-sm max-w-md">
                            Based on our analysis of your location, current weather, and farm details.
                        </p>
                    </div>
                    
                    <div className={`flex items-center gap-3 rounded-2xl border px-6 py-4 ${getRiskStyles(data?.overallRisk, true)}`}>
                        {getRiskIcon(data?.overallRisk)}
                        <span className="text-2xl font-bold capitalize">
                            {data?.overallRisk || 'Unknown'}
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Detailed Assessment</h2>
                    
                    <div className="grid gap-4">
                        {(!data?.risks || data.risks.length === 0) && (
                            <div className="rounded-3xl bg-white p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                                <div className="rounded-full bg-green-50 p-5 mb-4">
                                    <ShieldCheck className="h-12 w-12 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">All Clear!</h3>
                                <p className="mt-2 text-gray-600 max-w-sm">
                                    No significant risks detected for your farm at this moment. Keep up the good work!
                                </p>
                            </div>
                        )}

                        {data?.risks?.map((risk, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl p-6 shadow-sm border-y border-r border-gray-100 border-l-4 ${getRiskStyles(risk.severity, false)} transition-all hover:shadow-md`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {risk.title}
                                        </h3>
                                        <p className="mt-2 text-gray-600 leading-relaxed">
                                            {risk.message}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                        risk.severity?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                                        risk.severity?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {risk.severity}
                                    </span>
                                </div>

                                <div className="mt-5 rounded-xl bg-green-50 p-4 border border-green-100 flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <strong className="text-green-900 font-semibold text-sm">
                                            Recommended Action
                                        </strong>
                                        <p className="text-green-800 text-sm mt-1">
                                            {risk.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}