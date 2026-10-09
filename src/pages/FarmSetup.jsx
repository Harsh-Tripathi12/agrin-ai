import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createFarm, createFarmer, getFarmer, getFarms } from "../services/api";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Sprout, Ruler, Layers, Droplets, Leaf, MapPin, ArrowRight, Loader2 } from 'lucide-react';

const STANDARD_SOILS = ["alluvial", "black", "red", "sandy", "loamy", "clay"];
const STANDARD_IRRIGATIONS = ["rainfed", "borewell", "canal", "drip", "sprinkler"];

export default function FarmSetup() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, isHindi } = useLanguage();

    const [farmerId, setFarmerId] = useState("");
    const [farmerProfileLocation, setFarmerProfileLocation] = useState(null);
    const [hasExistingFarm, setHasExistingFarm] = useState(false);

    const [formData, setFormData] = useState({
        farmName: "",
        landSize: "",
        landUnit: "acre",
        soilType: "",
        irrigationType: "",
        crops: "",
        location: {
            state: "",
            district: "",
        },
    });

    const [customSoilType, setCustomSoilType] = useState("");
    const [customIrrigationType, setCustomIrrigationType] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadInitialData = async () => {
            const currentId = user?.uid || localStorage.getItem("agrin_farmer_id") || auth.currentUser?.uid;

            if (currentId) {
                setFarmerId(currentId);
                localStorage.setItem("agrin_farmer_id", currentId);

                // 1. Fetch farmer profile to pre-fill location if available
                getFarmer(currentId).then((res) => {
                    if (res?.data?.location) {
                        setFarmerProfileLocation(res.data.location);
                        setFormData((prev) => ({
                            ...prev,
                            location: {
                                state: prev.location.state || res.data.location.state || "",
                                district: prev.location.district || res.data.location.district || "",
                            }
                        }));
                    }
                }).catch((err) => console.warn("Could not prefill farmer profile:", err.message));

                // 2. Fetch existing farm to pre-fill farm details
                getFarms(currentId).then((res) => {
                    if (res?.data?.length > 0) {
                        setHasExistingFarm(true);
                        const sortedFarms = [...res.data].sort((a, b) => {
                            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                            return dateB - dateA;
                        });
                        const latestFarm = sortedFarms[0];

                        const isStandardSoil = STANDARD_SOILS.includes(latestFarm.soilType?.toLowerCase());
                        const isStandardIrrigation = STANDARD_IRRIGATIONS.includes(latestFarm.irrigationType?.toLowerCase());

                        if (!isStandardSoil && latestFarm.soilType) {
                            setCustomSoilType(latestFarm.soilType);
                        }
                        if (!isStandardIrrigation && latestFarm.irrigationType) {
                            setCustomIrrigationType(latestFarm.irrigationType);
                        }

                        setFormData((prev) => ({
                            ...prev,
                            farmName: prev.farmName || latestFarm.farmName || "",
                            landSize: prev.landSize || latestFarm.landSize || "",
                            landUnit: latestFarm.landUnit || prev.landUnit || "acre",
                            soilType: isStandardSoil ? latestFarm.soilType?.toLowerCase() : (latestFarm.soilType ? "other" : ""),
                            irrigationType: isStandardIrrigation ? latestFarm.irrigationType?.toLowerCase() : (latestFarm.irrigationType ? "other" : ""),
                            crops: prev.crops || (Array.isArray(latestFarm.crops) ? latestFarm.crops.join(", ") : ""),
                            location: {
                                state: prev.location.state || latestFarm.location?.state || "",
                                district: prev.location.district || latestFarm.location?.district || "",
                            },
                        }));
                    }
                }).catch((err) => console.warn("Could not prefill farm data:", err.message));
            }
        };

        loadInitialData();
    }, [user]);


    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
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

        const currentFarmerId = user?.uid || farmerId || localStorage.getItem("agrin_farmer_id") || auth.currentUser?.uid;

        if (!currentFarmerId) {
            setError(
                "Farmer profile not found. Please log in or complete your profile first."
            );
            return;
        }

        if (!formData.farmName.trim()) {
            setError("Please enter your farm name.");
            return;
        }

        if (!formData.landSize) {
            setError("Please enter your land size.");
            return;
        }

        const effectiveSoilType = formData.soilType === "other"
            ? customSoilType.trim()
            : formData.soilType;

        const effectiveIrrigationType = formData.irrigationType === "other"
            ? customIrrigationType.trim()
            : formData.irrigationType;

        if (!effectiveSoilType) {
            setError("Please select or enter your soil type/quality.");
            return;
        }

        if (!effectiveIrrigationType) {
            setError("Please select or enter your irrigation type.");
            return;
        }

        try {
            setLoading(true);

            const cropsArray = formData.crops
                ? formData.crops.split(",").map((crop) => crop.trim()).filter(Boolean)
                : [];
            
            const finalState = formData.location.state?.trim() || farmerProfileLocation?.state?.trim() || "";
            const finalDistrict = formData.location.district?.trim() || farmerProfileLocation?.district?.trim() || "";
            const farmLocation =
                finalState && finalDistrict
                    ? { state: finalState, district: finalDistrict }
                    : null;

            const farmPayload = {
                farmerId: currentFarmerId,
                farmName: formData.farmName.trim(),
                landSize: Number(formData.landSize),
                landUnit: formData.landUnit,
                soilType: effectiveSoilType,
                irrigationType: effectiveIrrigationType,
                crops: cropsArray,
                location: farmLocation,
            };

            try {
                await createFarm(farmPayload);
            } catch (farmErr) {
                // If farmer profile was missing in DB, auto-create farmer and retry
                console.warn("Retrying farm creation after ensuring farmer profile:", farmErr.message);
                await createFarmer({
                    name: "Farmer",
                    location: farmLocation,
                });
                await createFarm(farmPayload);
            }

            localStorage.setItem("agrin_farmer_id", currentFarmerId);
            navigate("/dashboard");

        } catch (error) {
            console.error("Farm creation failed:", error);

            setError(
                error.message ||
                "Unable to save farm details."
            );

        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 flex justify-center">

            <div className="w-full max-w-2xl animate-fade-in-up">

                {/* Progress Indicator */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                            {hasExistingFarm ? (isHindi ? "खेत सेटिंग" : "Farm Settings") : (isHindi ? "चरण 2 का 2" : "Step 2 of 2")}
                        </span>
                        <h2 className="text-sm font-medium text-gray-500">
                            {hasExistingFarm ? (isHindi ? "आपके खेत की जानकारी" : "Your Farm Information") : (isHindi ? "खेत का विवरण" : "Farm Details")}
                        </h2>
                    </div>
                    {hasExistingFarm && (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition"
                        >
                            {isHindi ? "डैशबोर्ड पर जाएं →" : "Go to Dashboard →"}
                        </Link>
                    )}
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {hasExistingFarm ? (isHindi ? "आपके खेत का विवरण" : "Your Farm Details") : (isHindi ? "अपना खेत सेटअप करें" : "Set up your farm")}
                    </h1>
                    <p className="mt-3 text-gray-600">
                        {hasExistingFarm
                            ? (isHindi ? "आपके खेत का विवरण सहेजा गया है। आप इसे बदल सकते हैं या डैशबोर्ड पर जा सकते हैं।" : "Your farm details are saved and pre-filled. You can modify them or continue to dashboard.")
                            : (isHindi ? "हमें अपने खेत के बारे में बताएं ताकि हम सटीक सलाह और मौसम आधारित जोखिम अलर्ट दे सकें।" : "Tell us about your farm so we can provide more accurate recommendations.")}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 rounded-3xl bg-white p-8 shadow-sm border border-gray-100"
                >

                    {/* Section 1: Farm Identity */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Sprout className="w-5 h-5 text-green-600" />
                            {isHindi ? "खेत की पहचान" : "Farm Identity"}
                        </h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {isHindi ? "खेत का नाम" : "Farm Name"}
                            </label>
                            <input
                                type="text"
                                name="farmName"
                                value={formData.farmName}
                                onChange={handleChange}
                                placeholder={isHindi ? "उदा. मेरा खेत" : "e.g. My Family Farm"}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>
                    </div>

                    {/* Section 2: Land Details */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Ruler className="w-5 h-5 text-green-600" />
                            {isHindi ? "ज़मीन का विवरण" : "Land Details"}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "ज़मीन का आकार" : "Land Size"}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="landSize"
                                    value={formData.landSize}
                                    onChange={handleChange}
                                    placeholder={isHindi ? "उदा. 5" : "e.g. 5"}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {isHindi ? "इकाई" : "Unit"}
                                </label>
                                <select
                                    name="landUnit"
                                    value={formData.landUnit}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                >
                                    <option value="acre">{isHindi ? "एकड़ (Acre)" : "Acre"}</option>
                                    <option value="hectare">{isHindi ? "हेक्टेयर (Hectare)" : "Hectare"}</option>
                                    <option value="bigha">{isHindi ? "बीघा (Bigha)" : "Bigha"}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-gray-400" /> {isHindi ? "मिट्टी का प्रकार" : "Soil Type / Quality"}
                                </label>
                                <select
                                    name="soilType"
                                    value={formData.soilType}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                >
                                    <option value="">{isHindi ? "-- मिट्टी का प्रकार चुनें --" : "-- Select soil type --"}</option>
                                    <option value="alluvial">{isHindi ? "जलोढ़ मिट्टी (Alluvial)" : "Alluvial"}</option>
                                    <option value="black">{isHindi ? "काली मिट्टी (Black Soil)" : "Black Soil"}</option>
                                    <option value="red">{isHindi ? "लाल मिट्टी (Red Soil)" : "Red Soil"}</option>
                                    <option value="sandy">{isHindi ? "बलुई मिट्टी (Sandy)" : "Sandy"}</option>
                                    <option value="loamy">{isHindi ? "दोमट मिट्टी (Loamy)" : "Loamy"}</option>
                                    <option value="clay">{isHindi ? "चिकनी मिट्टी (Clay)" : "Clay"}</option>
                                    <option value="other">{isHindi ? "अन्य / विशेष गुणवत्ता" : "Other / Custom Quality"}</option>
                                </select>
                                {formData.soilType === "other" && (
                                    <div className="mt-3">
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                            {isHindi ? "मिट्टी का प्रकार बताएं" : "Specify Soil Quality / Type"}
                                        </label>
                                        <input
                                            type="text"
                                            value={customSoilType}
                                            onChange={(e) => setCustomSoilType(e.target.value)}
                                            placeholder={isHindi ? "उदा. गाद दोमट, लवणीय..." : "e.g. Silt loam, Saline, Peaty..."}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Droplets className="w-4 h-4 text-gray-400" /> {isHindi ? "सिंचाई का साधन" : "Irrigation Type"}
                                </label>
                                <select
                                    name="irrigationType"
                                    value={formData.irrigationType}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                >
                                    <option value="">{isHindi ? "-- सिंचाई का तरीका चुनें --" : "-- Select irrigation type --"}</option>
                                    <option value="rainfed">{isHindi ? "वर्षा आधारित (Rainfed)" : "Rainfed"}</option>
                                    <option value="borewell">{isHindi ? "बोरवेल / नलकूप (Borewell)" : "Borewell"}</option>
                                    <option value="canal">{isHindi ? "नहर (Canal)" : "Canal"}</option>
                                    <option value="drip">{isHindi ? "ड्रिप / टपक सिंचाई (Drip)" : "Drip"}</option>
                                    <option value="sprinkler">{isHindi ? "फव्वारा / स्प्रिंकलर (Sprinkler)" : "Sprinkler"}</option>
                                    <option value="other">{isHindi ? "अन्य विधि" : "Other / Custom Method"}</option>
                                </select>
                                {formData.irrigationType === "other" && (
                                    <div className="mt-3">
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                            {isHindi ? "सिंचाई का तरीका बताएं" : "Specify Irrigation Method"}
                                        </label>
                                        <input
                                            type="text"
                                            value={customIrrigationType}
                                            onChange={(e) => setCustomIrrigationType(e.target.value)}
                                            placeholder={isHindi ? "उदा. ट्यूबवेल, नदी पंप..." : "e.g. Tube well, River lift, Furrow..."}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Crops */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Leaf className="w-5 h-5 text-green-600" />
                            {isHindi ? "फसलें" : "Crops"}
                        </h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {isHindi ? "आप कौन सी फसल उगाते हैं?" : "What do you grow?"}
                            </label>
                            <input
                                type="text"
                                name="crops"
                                value={formData.crops}
                                onChange={handleChange}
                                placeholder={isHindi ? "उदा. गेहूं, धान, आलू, सरसों" : "e.g. Wheat, Rice, Potato"}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                {isHindi ? "कई फसलों के बीच कॉमा (,) लगाएं।" : "Separate multiple crops with commas."}
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Location */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            {isHindi ? "खेत का स्थान" : "Farm Location"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex flex-col gap-2">
                            <p>{error}</p>
                            <Link
                                to="/dashboard"
                                className="text-green-700 font-semibold underline hover:text-green-800 text-xs self-start"
                            >
                                {isHindi ? "डैशबोर्ड पर जारी रखें →" : "Continue to Dashboard →"}
                            </Link>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isHindi ? "खेत सहेजा जा रहा है..." : "Saving Farm..."}
                            </>
                        ) : (
                            <>
                                {hasExistingFarm ? (isHindi ? "खेत विवरण अपडेट करें" : "Update Farm Details") : (isHindi ? "खेत सहेजें और आगे बढ़ें" : "Save Farm & Continue")}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                </form>

            </div>

        </div>
    );
}