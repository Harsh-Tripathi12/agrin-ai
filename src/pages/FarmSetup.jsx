import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createFarm, createFarmer } from "../services/api";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { Sprout, Ruler, Layers, Droplets, Leaf, MapPin, ArrowRight, Loader2 } from 'lucide-react';

export default function FarmSetup() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [farmerId, setFarmerId] = useState("");

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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const currentId = user?.uid || localStorage.getItem("agrin_farmer_id") || auth.currentUser?.uid;

        if (currentId) {
            setFarmerId(currentId);
            localStorage.setItem("agrin_farmer_id", currentId);
        }
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

        if (!formData.soilType) {
            setError("Please select your soil type.");
            return;
        }

        if (!formData.irrigationType) {
            setError("Please select your irrigation type.");
            return;
        }

        try {
            setLoading(true);

            const cropsArray = formData.crops
                ? formData.crops.split(",").map((crop) => crop.trim()).filter(Boolean)
                : [];
            const farmLocation =
                formData.location.state?.trim() && formData.location.district?.trim()
                    ? { state: formData.location.state.trim(), district: formData.location.district.trim() }
                    : null;

            const farmPayload = {
                farmerId: currentFarmerId,
                farmName: formData.farmName.trim(),
                landSize: Number(formData.landSize),
                landUnit: formData.landUnit,
                soilType: formData.soilType,
                irrigationType: formData.irrigationType,
                crops: cropsArray,
                location: farmLocation,
            };

            try {
                await createFarm(farmPayload);
            } catch (farmErr) {
                // If farmer profile was missing in DB, auto-create farmer and retry
                console.warn("Retrying farm creation after ensuring farmer profile:", farmErr.message);
                try {
                    await createFarmer({
                        name: "Farmer",
                        location: farmLocation,
                    });
                    await createFarm(farmPayload);
                } catch (retryErr) {
                    throw retryErr;
                }
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
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-green-700">Step 2 of 2</span>
                        <span className="text-sm font-medium text-gray-500">Farm Details</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full w-full transition-all duration-500"></div>
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Set up your farm
                    </h1>
                    <p className="mt-3 text-gray-600">
                        Tell us about your farm so we can provide more accurate recommendations.
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
                            Farm Identity
                        </h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Farm Name
                            </label>
                            <input
                                type="text"
                                name="farmName"
                                value={formData.farmName}
                                onChange={handleChange}
                                placeholder="e.g. My Family Farm"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>
                    </div>

                    {/* Section 2: Land Details */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Ruler className="w-5 h-5 text-green-600" />
                            Land Details
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Land Size
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="landSize"
                                    value={formData.landSize}
                                    onChange={handleChange}
                                    placeholder="e.g. 5"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Unit
                                </label>
                                <select
                                    name="landUnit"
                                    value={formData.landUnit}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                >
                                    <option value="acre">Acre</option>
                                    <option value="hectare">Hectare</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-gray-400" /> Soil Type
                                </label>
                                <select
                                    name="soilType"
                                    value={formData.soilType}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                >
                                    <option value="">Select soil type</option>
                                    <option value="alluvial">Alluvial</option>
                                    <option value="black">Black Soil</option>
                                    <option value="red">Red Soil</option>
                                    <option value="sandy">Sandy</option>
                                    <option value="loamy">Loamy</option>
                                    <option value="clay">Clay</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Droplets className="w-4 h-4 text-gray-400" /> Irrigation Type
                                </label>
                                <select
                                    name="irrigationType"
                                    value={formData.irrigationType}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none bg-white"
                                >
                                    <option value="">Select irrigation type</option>
                                    <option value="rainfed">Rainfed</option>
                                    <option value="borewell">Borewell</option>
                                    <option value="canal">Canal</option>
                                    <option value="drip">Drip</option>
                                    <option value="sprinkler">Sprinkler</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Crops */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Leaf className="w-5 h-5 text-green-600" />
                            Crops
                        </h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                What do you grow?
                            </label>
                            <input
                                type="text"
                                name="crops"
                                value={formData.crops}
                                onChange={handleChange}
                                placeholder="e.g. Wheat, Rice, Potato"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Separate multiple crops with commas.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Location */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Farm Location
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.location.state}
                                    onChange={handleLocationChange}
                                    placeholder="e.g. Uttar Pradesh"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    District
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.location.district}
                                    onChange={handleLocationChange}
                                    placeholder="e.g. Prayagraj"
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
                                Continue to Dashboard →
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
                                Saving Farm...
                            </>
                        ) : (
                            <>
                                Save Farm & Continue
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                </form>

            </div>

        </div>
    );
}