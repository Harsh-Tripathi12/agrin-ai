import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import {
    getFarmer,
    getFarms,
    getWeather,
    getFarmRisk,
} from "../services/api";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [farmer, setFarmer] = useState(null);
    const [farm, setFarm] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [risk, setRisk] = useState(null);

    const loadDashboard = useCallback(async () => {
        // Safety timeout: Never stay on skeleton for more than 1 second
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        try {
            setError("");

            const farmerId = user?.uid || localStorage.getItem("agrin_farmer_id") || auth.currentUser?.uid;

            if (!farmerId) {
                // If not logged in yet, finish loading and wait
                setLoading(false);
                clearTimeout(timer);
                return;
            }

            localStorage.setItem("agrin_farmer_id", farmerId);

            // Fetch Farmer & Farms in parallel
            const [farmerRes, farmsRes] = await Promise.allSettled([
                getFarmer(farmerId),
                getFarms(farmerId),
            ]);

            let currentFarmer = null;
            if (farmerRes.status === "fulfilled" && farmerRes.value?.data) {
                currentFarmer = farmerRes.value.data;
                setFarmer(currentFarmer);
            }

            let currentFarm = null;
            if (farmsRes.status === "fulfilled" && farmsRes.value?.data?.length > 0) {
                currentFarm = farmsRes.value.data[0];
                setFarm(currentFarm);
            }

            // Unblock UI immediately once primary data is in place
            clearTimeout(timer);
            setLoading(false);

            // Determine location for weather
            const weatherLocation =
                currentFarm?.location?.district && currentFarm?.location?.state
                    ? currentFarm.location
                    : currentFarmer?.location?.district && currentFarmer?.location?.state
                    ? currentFarmer.location
                    : null;

            // Load Weather & Risk in parallel in background
            const backgroundPromises = [];

            if (weatherLocation?.district && weatherLocation?.state) {
                backgroundPromises.push(
                    getWeather(weatherLocation.district, weatherLocation.state)
                        .then((res) => {
                            if (res?.data) setWeather(res.data);
                        })
                        .catch((err) => console.warn("Weather fetch error:", err.message))
                );
            }

            backgroundPromises.push(
                getFarmRisk()
                    .then((res) => {
                        if (res?.data) {
                            setRisk(res.data);
                            // If weather wasn't loaded directly, use risk's embedded weather
                            if (res.data.weather) {
                                setWeather((prev) => prev || res.data.weather);
                            }
                        }
                    })
                    .catch((err) => console.warn("Risk fetch error:", err.message))
            );

            await Promise.allSettled(backgroundPromises);

        } catch (err) {
            console.error("Dashboard load error:", err);
            // Don't show hard error screen if we can display the dashboard gracefully
            clearTimeout(timer);
        } finally {
            clearTimeout(timer);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    }

    function getWeatherIcon(condition) {
        const text = condition.toLowerCase();

        if (text.includes("thunder")) {
            return "⛈️";
        }
        if (text.includes("rain") || text.includes("drizzle")) {
            return "🌧️";
        }
        if (text.includes("cloud")) {
            return "⛅";
        }
        if (text.includes("snow")) {
            return "❄️";
        }
        if (text.includes("fog")) {
            return "🌫️";
        }

        return "☀️";
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdfbf7] p-4">
                <div className="mb-8 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-green-100 shadow-sm">
                    <span className="text-5xl">🌱</span>
                </div>
                
                <div className="w-full max-w-6xl space-y-6">
                    {/* Header Skeleton */}
                    <div className="space-y-3">
                        <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200"></div>
                        <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200"></div>
                        <div className="h-4 w-48 animate-pulse rounded-md bg-gray-200"></div>
                    </div>
                    
                    {/* Weather Skeleton */}
                    <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Farm Skeleton */}
                        <div className="h-40 w-full animate-pulse rounded-3xl bg-gray-200"></div>
                        {/* Risk Skeleton */}
                        <div className="h-40 w-full animate-pulse rounded-3xl bg-gray-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] px-4">
                <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <div className="bg-red-50 p-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-5xl">
                                ⚠️
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Unavailable</h1>
                        <p className="mt-3 text-gray-600">{error}</p>
                    </div>
                    <div className="p-6">
                        <button
                            onClick={loadDashboard}
                            className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const current = weather?.current;

    const getRiskColor = (riskLevel) => {
        const level = (riskLevel || "").toLowerCase();
        if (level === "low") return "bg-green-100 text-green-800";
        if (level === "medium") return "bg-amber-100 text-amber-800";
        if (level === "high") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] px-4 py-6 md:px-8 md:py-10">
            <div className="mx-auto max-w-6xl">
                
                {/* Header */}
                <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-bold tracking-wider text-green-600 uppercase">
                            AgriN
                        </p>
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Namaste, {farmer?.name || "Farmer"} 👋
                        </h1>
                        <p className="mt-2 text-base text-gray-600">
                            Here is what is happening with your farm today.
                        </p>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                </header>

                {/* Weather */}
                <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                    <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <div className="p-6 sm:p-8">
                        {weather ? (
                            <>
                                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                                    <div>
                                        <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                                            Current Weather
                                        </p>
                                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                            {weather?.location?.name}
                                        </h2>
                                        <p className="text-base text-gray-500">
                                            {weather?.location?.state}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-5">
                                        <div className="text-6xl drop-shadow-sm">
                                            {getWeatherIcon(current?.condition || "")}
                                        </div>
                                        <div>
                                            <p className="text-5xl font-extrabold tracking-tighter text-gray-900">
                                                {Math.round(current?.temperature)}°C
                                            </p>
                                            <p className="mt-1 text-lg font-medium text-gray-600">
                                                {current?.condition}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-xl border border-gray-50 bg-gray-50 p-4 transition hover:bg-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Feels like</p>
                                        <p className="mt-2 text-xl font-bold text-gray-900">{Math.round(current?.feelsLike)}°C</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-50 bg-gray-50 p-4 transition hover:bg-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Humidity</p>
                                        <p className="mt-2 text-xl font-bold text-gray-900">{current?.humidity}%</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-50 bg-gray-50 p-4 transition hover:bg-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rain</p>
                                        <p className="mt-2 text-xl font-bold text-gray-900">{current?.rain} mm</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-50 bg-gray-50 p-4 transition hover:bg-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wind</p>
                                        <p className="mt-2 text-xl font-bold text-gray-900">{current?.windSpeed} km/h</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4 py-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-3xl">🌤️</div>
                                <div>
                                    <p className="font-semibold text-gray-700">Weather Unavailable</p>
                                    <p className="text-sm text-gray-400">Could not fetch weather data for your location.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {/* Farm */}
                    <section className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Your Farm</h2>
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-xl">🚜</span>
                        </div>
                        
                        {farm ? (
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">{farm.farmName || "My Farm"}</h3>
                                
                                <div className="mt-5 grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Land Size</p>
                                        <p className="mt-1 text-base font-semibold text-gray-900">{farm.landSize} {farm.landUnit}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Soil Type</p>
                                        <p className="mt-1 text-base font-semibold capitalize text-gray-900">{farm.soilType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Irrigation</p>
                                        <p className="mt-1 text-base font-semibold capitalize text-gray-900">{farm.irrigationType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Crops</p>
                                        <p className="mt-1 text-base font-semibold text-gray-900">{farm.crops?.length || 0}</p>
                                    </div>
                                </div>

                                {farm.crops?.length > 0 && (
                                    <div className="mt-6 border-t border-gray-50 pt-5">
                                        <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Current Crops</p>
                                        <div className="flex flex-wrap gap-2">
                                            {farm.crops.map((crop) => (
                                                <span
                                                    key={crop}
                                                    className="rounded-full bg-green-50 px-3.5 py-1.5 text-sm font-medium text-green-700 border border-green-100"
                                                >
                                                    {crop}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                                <span className="text-4xl mb-2">🌱</span>
                                <p className="font-bold text-gray-800">No Farm Configured</p>
                                <p className="text-xs text-gray-500 mt-1 mb-4">Set up your farm details to get personalized insights.</p>
                                <Link
                                    to="/farm-setup"
                                    className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-green-700 transition"
                                >
                                    Set Up Farm →
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Risk Summary */}
                    <section className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Farm Risk</h2>
                                <p className="mt-1 text-sm text-gray-500">Current threats & alerts</p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wider ${getRiskColor(risk?.overallRisk)}`}>
                                {risk?.overallRisk || "Unknown"}
                            </span>
                        </div>

                        <div className="flex-1">
                            {risk?.risks?.length > 0 ? (
                                <div className="space-y-3">
                                    {risk.risks.slice(0, 3).map((item, index) => (
                                        <div key={index} className="rounded-2xl bg-orange-50/70 p-4 border border-orange-100/50">
                                            <p className="font-bold text-orange-900">{item.title}</p>
                                            <p className="mt-1 text-sm text-orange-800 leading-relaxed">{item.action}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-gray-50 p-6 text-center border border-dashed border-gray-200">
                                    <span className="text-3xl opacity-50">✅</span>
                                    <p className="mt-3 text-sm font-medium text-gray-500">No major risks detected at the moment.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 7-Day Forecast */}
                {weather?.forecast?.length > 0 && (
                <section className="mt-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 px-1">7-Day Forecast</h2>
                    <div className="flex overflow-x-auto pb-4 snap-x hide-scrollbar">
                        <div className="flex gap-4 min-w-max pr-4">
                            {weather.forecast.map((day) => (
                                <div
                                    key={day.date}
                                    className="snap-start w-32 flex-shrink-0 flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm"
                                >
                                    <p className="text-sm font-bold text-gray-700">
                                        {formatDate(day.date)}
                                    </p>
                                    <div className="my-4 text-4xl drop-shadow-sm">
                                        {getWeatherIcon(day.condition)}
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 truncate w-full">
                                        {day.condition}
                                    </p>
                                    <div className="mt-3 flex items-baseline justify-center gap-1">
                                        <span className="text-lg font-bold text-gray-900">{Math.round(day.maxTemperature)}°</span>
                                        <span className="text-sm font-medium text-gray-400">/{Math.round(day.minTemperature)}°</span>
                                    </div>
                                    {(day.rainProbability ?? 0) > 0 && (
                                        <div className="mt-3 w-full rounded-lg bg-blue-50 py-1 text-xs font-medium text-blue-600 flex items-center justify-center gap-1">
                                            <span>💧</span> {day.rainProbability}%
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                )}

                {/* Quick Actions */}
                <section className="mt-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 px-1">Quick Actions</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            to="/assistant"
                            className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-100"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition-transform group-hover:scale-110">🤖</div>
                            <h3 className="text-lg font-bold text-gray-900">Farmer Assistant</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">Get AI guidance on farming, crops, and weather.</p>
                        </Link>

                        <Link
                            to="/crop-doctor"
                            className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-100"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl transition-transform group-hover:scale-110">🩺</div>
                            <h3 className="text-lg font-bold text-gray-900">Crop Doctor</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">Analyze images to detect and treat crop diseases.</p>
                        </Link>

                        <Link
                            to="/risk"
                            className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-100"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl transition-transform group-hover:scale-110">⚠️</div>
                            <h3 className="text-lg font-bold text-gray-900">Farm Risk</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">Check current alerts and weather risks.</p>
                        </Link>

                        <Link
                            to="/improve"
                            className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-100"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl transition-transform group-hover:scale-110">🌿</div>
                            <h3 className="text-lg font-bold text-gray-900">Improve Farm</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">View regenerative and practical recommendations.</p>
                        </Link>
                    </div>
                </section>
                
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}
