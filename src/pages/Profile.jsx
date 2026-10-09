import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createFarmer, getFarmer, updateFarmer } from "../services/api";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { User, Phone, Globe, MapPin, ArrowRight, Loader2, CheckCircle2, LayoutDashboard, Send } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, isHindi, setLanguage } = useLanguage();

    const [formData, setFormData] = useState({
        name: "",
        phone: localStorage.getItem("agrin_farmer_phone") || "",
        telegramChatId: localStorage.getItem("agrin_telegram_chat_id") || "",
        language: localStorage.getItem("agrin_language") || "en",
        location: {
            state: "",
            district: "",
        },
    });

    const [isExisting, setIsExisting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Load existing profile details so user never has to re-fill them
    useEffect(() => {
        let isMounted = true;
        const loadProfile = async () => {
            const currentId = user?.uid || localStorage.getItem("agrin_farmer_id") || auth.currentUser?.uid;
            
            if (currentId) {
                try {
                    const res = await getFarmer(currentId);
                    if (isMounted && res?.data) {
                        const data = res.data;
                        setIsExisting(true);
                        setFormData({
                            name: data.name || user?.displayName || "",
                            phone: data.phone || localStorage.getItem("agrin_farmer_phone") || "",
                            telegramChatId: data.telegramChatId || localStorage.getItem("agrin_telegram_chat_id") || "",
                            language: data.language || localStorage.getItem("agrin_language") || "en",
                            location: {
                                state: data.location?.state || "",
                                district: data.location?.district || "",
                            },
                        });
                        if (data.phone) localStorage.setItem("agrin_farmer_phone", data.phone);
                        if (data.telegramChatId) localStorage.setItem("agrin_telegram_chat_id", data.telegramChatId);
                        if (data.language) {
                            setLanguage?.(data.language);
                        }
                    }
                } catch (err) {
                    if (isMounted) {
                        setFormData((prev) => ({
                            ...prev,
                            name: prev.name || user?.displayName || "",
                            phone: prev.phone || localStorage.getItem("agrin_farmer_phone") || "",
                            telegramChatId: prev.telegramChatId || localStorage.getItem("agrin_telegram_chat_id") || "",
                        }));
                    }
                    console.info("New profile or not yet created:", err.message);
                } finally {
                    if (isMounted) setFetching(false);
                }
            } else {
                if (isMounted) setFetching(false);
            }
        };

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, [user, setLanguage]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (name === "language" && setLanguage) {
            setLanguage(value);
        }
    }

    function handleLocationChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            location: {
                ...previous.location,
                [name]: value,
            },
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!formData.name.trim()) {
            setError(isHindi ? "कृपया अपना नाम दर्ज करें।" : "Please enter your name.");
            return;
        }

        if (!formData.phone.trim()) {
            setError(isHindi ? "कृपया अपना मोबाइल नंबर दर्ज करें।" : "Please enter your phone number.");
            return;
        }

        if (!formData.location.state.trim()) {
            setError(isHindi ? "कृपया अपना राज्य दर्ज करें।" : "Please enter your state.");
            return;
        }

        if (!formData.location.district.trim()) {
            setError(isHindi ? "कृपया अपना ज़िला दर्ज करें।" : "Please enter your district.");
            return;
        }

        try {
            setLoading(true);

            const currentFarmerId = user?.uid || localStorage.getItem("agrin_farmer_id") || auth.currentUser?.uid;

            let response;
            if (isExisting && currentFarmerId) {
                response = await updateFarmer(currentFarmerId, formData);
            } else {
                response = await createFarmer(formData);
            }

            const farmerId = response?.data?.id || currentFarmerId;

            // Save farmer ID for the next steps
            if (farmerId) {
                localStorage.setItem("agrin_farmer_id", farmerId);
            }

            // Save language preference
            localStorage.setItem("agrin_language", formData.language);
            localStorage.setItem("agrin_telegram_chat_id", formData.telegramChatId || "");

            setSuccessMessage(isHindi ? "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!" : "Profile saved successfully!");

            // If profile already existed, go to dashboard, else continue onboarding to farm setup
            setTimeout(() => {
                navigate("/farm-setup");
            }, 500);

        } catch (error) {
            console.error(error);
            // If update failed because record wasn't found, try create
            try {
                const response = await createFarmer(formData);
                const farmerId = response?.data?.id || user?.uid;
                if (farmerId) localStorage.setItem("agrin_farmer_id", farmerId);
                localStorage.setItem("agrin_language", formData.language);
                localStorage.setItem("agrin_telegram_chat_id", formData.telegramChatId || "");
                navigate("/farm-setup");
                return;
            } catch (createErr) {
                setError(
                    createErr.message ||
                    error.message ||
                    (isHindi ? "कुछ गड़बड़ हुई। कृपया पुन: प्रयास करें।" : "Something went wrong. Please try again.")
                );
            }
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    <p className="text-sm font-medium text-gray-600">
                        {isHindi ? "आपकी प्रोफ़ाइल लोड हो रही है..." : "Loading your profile details..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 flex justify-center">

            <div className="w-full max-w-2xl animate-fade-in-up">

                {/* Progress / Status Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                            {isExisting ? (isHindi ? "प्रोफ़ाइल सेटिंग" : "Profile Settings") : (isHindi ? "चरण 1 का 2" : "Step 1 of 2")}
                        </span>
                        <h2 className="text-sm font-medium text-gray-500">
                            {isExisting ? (isHindi ? "आपके सहेजे गए विवरण" : "Your Saved Details") : (isHindi ? "आपकी प्रोफ़ाइल" : "Your Profile")}
                        </h2>
                    </div>
                    {isExisting && (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            {isHindi ? "डैशबोर्ड पर जाएं" : "Go to Dashboard"}
                        </Link>
                    )}
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isExisting ? (isHindi ? "आपकी किसान प्रोफ़ाइल" : "Your Farmer Profile") : (isHindi ? "अपने बारे में बताएं" : "Tell us about yourself")}
                    </h1>
                    <p className="mt-3 text-gray-600">
                        {isExisting
                            ? (isHindi ? "आपका विवरण नीचे सुरक्षित और पहले से भरा हुआ है। आप इसे कभी भी बदल सकते हैं।" : "Your details are saved and pre-filled below. You can update them anytime.")
                            : (isHindi ? "यह जानकारी आपके खेत के लिए सटीक सलाह और मौसम जोखिम अलर्ट देने में मदद करती है।" : "This information helps us personalize your farming recommendations.")}
                    </p>
                    {isExisting && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            {isHindi ? "विवरण आपके खाते में सुरक्षित है" : "Details saved to your account"}
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 rounded-3xl bg-white p-8 shadow-sm border border-gray-100"
                >

                    {/* Section 1: Personal Info */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <User className="w-5 h-5 text-green-600" />
                            {isHindi ? "व्यक्तिगत जानकारी" : "Personal Info"}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "आपका नाम" : "Your Name"}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={isHindi ? "अपना नाम दर्ज करें" : "Enter your name"}
                                        className="w-full pl-10 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "मोबाइल नंबर (व्हाट्सएप अलर्ट इसी नंबर पर आएंगे)" : "Phone Number (WhatsApp risk alerts will be sent here)"}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder={isHindi ? "10 अंकों का व्हाट्सएप नंबर (उदा. 9876543210)" : "10-digit WhatsApp number (e.g. 9876543210)"}
                                        className="w-full pl-10 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "टेलीग्राम चैट आईडी (स्वचालित बैकग्राउंड अलर्ट के लिए)" : "Telegram Chat ID (For Automated Alerts)"}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Send className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="telegramChatId"
                                        value={formData.telegramChatId}
                                        onChange={handleChange}
                                        placeholder={isHindi ? "उदा. 123456789 या @username" : "e.g. 123456789 or @username"}
                                        className="w-full pl-10 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500">
                                    {isHindi
                                        ? "💡 अपनी टेलीग्राम चैट आईडी जानने के लिए टेलीग्राम ऐप पर @userinfobot सर्च करें और Start दबाएं।"
                                        : "💡 To get your Chat ID, search @userinfobot on Telegram and tap Start to see your ID number."}
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "पसंदीदा भाषा" : "Preferred Language"}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full pl-10 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                    >
                                        <option value="en">English (अंग्रेज़ी)</option>
                                        <option value="hi">हिन्दी (Hindi)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Section 2: Location */}
                    <div className="space-y-6 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            {isHindi ? "स्थान" : "Location"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "राज्य" : "State"}
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.location.state}
                                    onChange={handleLocationChange}
                                    placeholder={isHindi ? "अपना राज्य दर्ज करें" : "Enter your state"}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "ज़िला / शहर" : "District / City"}
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.location.district}
                                    onChange={handleLocationChange}
                                    placeholder={isHindi ? "अपना ज़िला या शहर दर्ज करें" : "Enter your district or city"}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-200 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Submit & Secondary Action */}
                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isHindi ? "सहेजा जा रहा है..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    {isExisting ? (isHindi ? "बदलाव सहेजें और आगे बढ़ें" : "Save Changes & Continue") : (isHindi ? "खेत सेटअप के लिए आगे बढ़ें" : "Continue to Farm Setup")}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {isExisting && (
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
                            >
                                {isHindi ? "रद्द करें और डैशबोर्ड पर लौटें" : "Cancel & Return to Dashboard"}
                            </button>
                        )}
                    </div>

                </form>

            </div>

        </div>
    );
}