import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFarmer } from "../services/api";
import { auth } from "../config/firebase";
import { User, Phone, Globe, MapPin, ArrowRight, Loader2 } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        language: "en",
        location: {
            state: "",
            district: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

        if (!formData.name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        if (!formData.location.state.trim()) {
            setError("Please enter your state.");
            return;
        }

        if (!formData.location.district.trim()) {
            setError("Please enter your district.");
            return;
        }

        try {
            setLoading(true);

            const response = await createFarmer(formData);

            const farmerId = response.data?.id || auth.currentUser?.uid;

            // Save farmer ID for the next steps
            if (farmerId) {
                localStorage.setItem(
                    "agrin_farmer_id",
                    farmerId
                );
            }

            // Save language preference
            localStorage.setItem(
                "agrin_language",
                formData.language
            );

            navigate("/farm-setup");

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Something went wrong. Please try again."
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
                        <span className="text-sm font-semibold text-green-700">Step 1 of 2</span>
                        <span className="text-sm font-medium text-gray-500">Your Profile</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full w-1/2 transition-all duration-500"></div>
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Tell us about yourself
                    </h1>
                    <p className="mt-3 text-gray-600">
                        This information helps us personalize your farming recommendations.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 rounded-3xl bg-white p-8 shadow-sm border border-gray-100"
                >

                    {/* Section 1: Personal Info */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <User className="w-5 h-5 text-green-600" />
                            Personal Info
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Your Name
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
                                        placeholder="Enter your name"
                                        className="w-full pl-10 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Phone Number
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
                                        placeholder="Enter your phone number"
                                        className="w-full pl-10 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Preferred Language
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
                                        <option value="en">English</option>
                                        <option value="hi">हिन्दी</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Section 2: Location */}
                    <div className="space-y-6 pt-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Location
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                            {error}
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
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue to Farm Setup
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                </form>

            </div>

        </div>
    );
}