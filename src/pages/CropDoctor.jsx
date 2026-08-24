import { useState, useRef } from "react";
import { analyzeCrop } from "../services/api";
import { Upload, Camera, Leaf, Eye, Wrench, Shield, X, Loader2 } from "lucide-react";

export default function CropDoctor() {
    const language = localStorage.getItem("agrin_language") || "en";

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [crop, setCrop] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // UI state for drag and drop
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    function handleFile(event) {
        const selected = event.target.files?.[0];

        if (!selected) {
            return;
        }

        if (!selected.type.startsWith("image/")) {
            setError("Please select an image.");
            return;
        }

        if (selected.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
        setError("");
    }

    async function analyze() {
        if (!file) {
            setError("Please select a crop image.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const reader = new FileReader();

            reader.onload = async () => {
                const result = await analyzeCrop(
                    reader.result.split(",")[1],
                    file.type,
                    crop,
                    language
                );
                setResult(result.data);
                setLoading(false);
            };

            reader.onerror = () => {
                setError("Could not read image.");
                setLoading(false);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    // Drag handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile({ target: { files: e.dataTransfer.files } });
        }
    };

    const clearImage = () => {
        setFile(null);
        setPreview("");
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-green-50 px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 text-center">
                    <p className="text-sm font-bold tracking-wider text-green-700 uppercase">
                        AgriN AI
                    </p>
                    <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
                        Crop Doctor 🌱
                    </h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Upload a crop image to identify possible problems and get actionable advice.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Leaf className="w-4 h-4 text-green-600" />
                            Crop name
                        </label>
                        <input
                            value={crop}
                            onChange={(event) => setCrop(event.target.value)}
                            placeholder="e.g. wheat, tomato, rice"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                        />

                        <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Camera className="w-4 h-4 text-green-600" />
                            Crop image
                        </label>

                        {!preview ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
                                    dragging
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                }`}
                            >
                                <Upload className={`mb-3 h-10 w-10 ${dragging ? "text-green-600" : "text-gray-400"}`} />
                                <p className="text-sm font-medium text-gray-700">
                                    Click to upload or drag & drop
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    PNG, JPG up to 5MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative mt-2 rounded-2xl border border-gray-200 p-2">
                                <img
                                    src={preview}
                                    alt="Crop preview"
                                    className="max-h-64 w-full rounded-xl object-cover"
                                />
                                <button
                                    onClick={clearImage}
                                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            ref={fileInputRef}
                            className="hidden"
                        />

                        {error && (
                            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={analyze}
                            disabled={loading || !file}
                            className="mt-auto pt-6 w-full"
                        >
                            <div className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white transition-all ${
                                loading || !file
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-sm hover:shadow"
                            }`}>
                                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {loading ? "Analyzing..." : "Analyze Crop"}
                            </div>
                        </button>
                    </div>

                    <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col">
                        {!result && !loading ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <div className="rounded-full bg-green-50 p-4 mb-4">
                                    <Eye className="h-8 w-8 text-green-600 opacity-50" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No analysis yet</h3>
                                <p className="mt-2 max-w-sm text-sm text-gray-500">
                                    Upload a clear image of your crop's leaves or affected areas to get a detailed diagnosis and recommendations.
                                </p>
                            </div>
                        ) : loading ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">Analyzing crop...</h3>
                                <p className="mt-2 text-sm text-gray-500">Our AI is examining the image details.</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                            {result.possibleProblem}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500 mb-1">Confidence</span>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                                            result.confidence > 80 ? 'bg-green-100 text-green-800' :
                                            result.confidence > 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {result.confidence}%
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Eye className="w-5 h-5 text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">Observations</h3>
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            {result.observations?.map((item, index) => (
                                                <li key={index} className="flex gap-2">
                                                    <span className="text-blue-500 mt-0.5">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl bg-green-50 p-5 border border-green-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wrench className="w-5 h-5 text-green-700" />
                                            <h3 className="font-semibold text-gray-900">Recommended Actions</h3>
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            {result.recommendedActions?.map((item, index) => (
                                                <li key={index} className="flex gap-2">
                                                    <span className="text-green-600 mt-0.5">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-purple-50 p-5 border border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-gray-900">Prevention</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        {result.prevention?.map((item, index) => (
                                            <li key={index} className="flex gap-2">
                                                <span className="text-purple-500 mt-0.5">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {result.disclaimer && (
                                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-100 flex items-start gap-3">
                                        <div className="mt-0.5">⚠️</div>
                                        <p>{result.disclaimer}</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}