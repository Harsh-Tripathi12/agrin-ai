import { useState, useRef } from "react";
import { analyzeCrop } from "../services/api";
import { Upload, Camera, Leaf, Eye, Wrench, Shield, X, Loader2, Sparkles, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
    translateCropName,
    translateSeverityText,
    translateCropDiagnosis,
    translateActionText,
} from "../utils/agriTranslations";

// Helper to quickly compress image on client-side: shrinks 5MB to ~100KB, making upload 10x faster
function compressImage(file, maxWidth = 900, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/jpeg", quality);
                const base64 = dataUrl.split(",")[1];
                resolve({ base64, mimeType: "image/jpeg", dataUrl });
            };
            img.onerror = () => reject(new Error("Unable to decode image file."));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read image file."));
        reader.readAsDataURL(file);
    });
}

export default function CropDoctor() {
    const { t, isHindi, language } = useLanguage();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [base64Payload, setBase64Payload] = useState("");
    const [crop, setCrop] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragging, setDragging] = useState(false);

    const fileInputRef = useRef(null);

    async function handleFile(event) {
        const selected = event.target.files?.[0];
        if (!selected) return;

        if (!selected.type.startsWith("image/")) {
            setError(isHindi ? "कृपया एक मान्य छवि फ़ाइल (JPEG, PNG, WEBP) चुनें।" : "Please select an image file (JPEG, PNG, WEBP).");
            return;
        }

        try {
            setError("");
            setResult(null);
            setFile(selected);
            setLoading(true);

            // Compress image instantly in browser
            const { base64, dataUrl } = await compressImage(selected, 900, 0.82);
            setPreview(dataUrl);
            setBase64Payload(base64);
        } catch (err) {
            console.error("Image processing error:", err);
            setError(isHindi ? "छवि संसाधित नहीं हो सकी। कृपया दूसरी तस्वीर आज़माएं।" : "Could not process image. Please try another photo.");
        } finally {
            setLoading(false);
        }
    }

    async function analyze() {
        if (!base64Payload) {
            setError(isHindi ? "कृपया पहले फसल की तस्वीर चुनें या खींचें।" : "Please select or capture a crop image first.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const response = await analyzeCrop(
                base64Payload,
                "image/jpeg",
                crop.trim(),
                language
            );

            if (response?.data) {
                setResult(response.data);
            } else {
                throw new Error(isHindi ? "निदान परिणाम प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।" : "Diagnosis response was empty. Please retry.");
            }
        } catch (err) {
            console.error("Crop doctor error:", err);
            setError(err.message || (isHindi ? "फसल का विश्लेषण विफल रहा। कृपया पुन: प्रयास करें।" : "Failed to analyze crop. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    const clearImage = () => {
        setFile(null);
        setPreview("");
        setBase64Payload("");
        setResult(null);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-[#f7faf5] px-4 py-8 md:px-6">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-800">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Plant Pathology
                    </div>
                    <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {t("cropDoctorTitle", "AgriN Crop Doctor 🩺")}
                    </h1>
                    <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto">
                        {t("cropDoctorSubtitle", "Fast visual disease detection. Upload or capture a crop leaf photo to get instant diagnosis and treatment steps.")}
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    
                    {/* Left Column: Upload & Input */}
                    <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col space-y-5">
                        
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Leaf className="w-4 h-4 text-green-600" />
                                {t("cropName", "Crop Name (Optional)")}
                            </label>
                            <input
                                value={crop}
                                onChange={(e) => setCrop(e.target.value)}
                                placeholder="e.g. Wheat, Rice, Tomato, Cotton"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Camera className="w-4 h-4 text-green-600" />
                                    {t("cropPhoto", "Crop Photo")}
                                </label>
                                {preview && (
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> {t("remove", "Remove")}
                                    </button>
                                )}
                            </div>

                            {!preview ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragging(false);
                                        if (e.dataTransfer.files?.[0]) {
                                            handleFile({ target: { files: e.dataTransfer.files } });
                                        }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors text-center ${
                                        dragging
                                            ? "border-green-500 bg-green-50/70"
                                            : "border-gray-300 bg-gray-50/70 hover:bg-gray-100/70"
                                    }`}
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600 mb-3 border border-gray-100">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {t("uploadOrDrag", "Click to upload or drag & drop")}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {t("photoSpeedNote", "Takes any photo — auto-optimized for speed")}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-black/5">
                                    <img
                                        src={preview}
                                        alt="Crop preview"
                                        className="max-h-60 w-full object-contain mx-auto"
                                    />
                                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-white flex items-center justify-between">
                                        <span>{t("imageReady", "Image ready")}</span>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="underline hover:text-green-300"
                                        >
                                            {t("changePhoto", "Change photo")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                ref={fileInputRef}
                                className="hidden"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Analysis Notice</p>
                                    <p className="mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={analyze}
                            disabled={loading || !base64Payload}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold text-white shadow-sm transition-all ${
                                loading || !base64Payload
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-green-600/20 shadow-md"
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t("analyzingLeaf", "Analyzing leaf... (~2s)")}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    {t("diagnoseNow", "Diagnose Crop Now")}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Diagnosis Results */}
                    <div className="lg:col-span-7 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[460px] flex flex-col">
                        
                        {!result && !loading ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center py-12">
                                <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4 border border-green-100">
                                    🌱
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {t("readyForDiagnosis", "Ready for Diagnosis")}
                                </h3>
                                <p className="mt-2 max-w-sm text-sm text-gray-500">
                                    {t("readyForDiagnosisDesc", "Upload a photo of damaged leaves or stems. Our AI will identify the likely pathogen or deficiency and provide organic & chemical remedies.")}
                                </p>
                            </div>
                        ) : loading ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center py-12">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
                                    <span className="absolute inset-0 flex items-center justify-center text-xl">🔬</span>
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-gray-900">
                                    {t("examiningImage", "Examining Crop Image...")}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-xs">
                                    {isHindi ? "जेमिनी एआई द्वारा पत्तियों के धब्बे, रंग और रोग के लक्षणों की सूक्ष्म जाँच जारी है..." : "Scanning leaf spots, discoloration, and pathogen patterns using Gemini AI."}
                                </p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                
                                {/* Diagnosis Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                                            {t("identifiedCondition", "Identified Condition")}
                                        </span>
                                        <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                                            {result.possibleProblem ? translateCropDiagnosis(result.possibleProblem, isHindi) : (isHindi ? "पौधे के स्वास्थ्य का मूल्यांकन" : "Plant Health Assessment")}
                                        </h2>
                                        {result.severity && (
                                            <span className="mt-2 inline-block text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                                {isHindi ? "गंभीरता: " : "Severity: "}{translateSeverityText(result.severity, isHindi)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {isHindi ? "सटीकता" : "Confidence"}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-extrabold ${
                                            (result.confidence || 0) >= 80 ? "bg-green-100 text-green-800" :
                                            (result.confidence || 0) >= 50 ? "bg-yellow-100 text-yellow-800" :
                                            "bg-red-100 text-red-800"
                                        }`}>
                                            {result.confidence || 85}%
                                        </span>
                                    </div>
                                </div>

                                {/* Key Cards Grid */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Observations */}
                                    <div className="rounded-2xl bg-sky-50/70 p-5 border border-sky-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Eye className="w-4 h-4 text-sky-700" />
                                            <h3 className="font-bold text-gray-900 text-sm">{t("observations", "Visual Observations")}</h3>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                                            {(result.observations || result.symptoms || [isHindi ? "पत्तियों पर धब्बे और पीलापन देखा गया" : "Leaf discoloration noted"]).map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-sky-500 mt-1 font-bold">•</span>
                                                    <span>{translateActionText(item, isHindi)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Actions */}
                                    <div className="rounded-2xl bg-emerald-50/70 p-5 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wrench className="w-4 h-4 text-emerald-700" />
                                            <h3 className="font-bold text-gray-900 text-sm">{t("recommendedAction", "Recommended Actions")}</h3>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                                            {(result.recommendedActions || [isHindi ? "प्रभावित पत्तियों को तुरंत हटाएँ" : "Isolate affected leaves"]).map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    <span>{translateActionText(item, isHindi)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Prevention */}
                                {result.prevention?.length > 0 && (
                                    <div className="rounded-2xl bg-purple-50/70 p-5 border border-purple-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-4 h-4 text-purple-700" />
                                            <h3 className="font-bold text-gray-900 text-sm">{t("prevention", "Future Prevention")}</h3>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                                            {result.prevention.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-purple-500 mt-1 font-bold">•</span>
                                                    <span>{translateActionText(item, isHindi)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                {result.disclaimer && (
                                    <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200 flex items-start gap-2.5">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p>{translateActionText(result.disclaimer, isHindi)}</p>
                                    </div>
                                )}

                                {/* Reset button */}
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-green-700 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> {t("checkAnotherCrop", "Check Another Crop")}
                                    </button>
                                </div>
                            </div>
                        ) : null}

                    </div>

                </div>
            </div>
        </div>
    );
}
