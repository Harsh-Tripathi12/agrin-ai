import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { Mail, Lock, Eye, EyeOff, Sprout, Loader2 } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            localStorage.setItem("agrin_farmer_id", result.user.uid);
            navigate("/profile");
        } catch (error) {
            console.error("Signup error:", error);
            if (error.code === "auth/email-already-in-use") {
                setError("An account with this email already exists.");
            } else {
                setError(error.message || "Unable to create account.");
            }
        } finally {
            setLoading(false);
        }
    }

    const getPasswordStrength = (pass) => {
        if (!pass) return { label: "", color: "bg-gray-200" };
        if (pass.length < 6) return { label: "Weak", color: "bg-red-500 w-1/3" };
        if (pass.length < 10) return { label: "Medium", color: "bg-amber-500 w-2/3" };
        return { label: "Strong", color: "bg-[#16a34a] w-full" };
    };

    const strength = getPasswordStrength(password);

    return (
        <div className="flex min-h-screen bg-[#f4f7f1] md:p-6 lg:p-10">
            <div className="m-auto w-full max-w-5xl bg-white md:rounded-[2.5rem] md:shadow-[0_20px_60px_rgba(35,70,40,0.10)] overflow-hidden grid md:grid-cols-2 h-screen md:h-auto">
                
                {/* Brand Area (Left Desktop) */}
                <div className="relative hidden md:flex min-h-[600px] flex-col justify-between overflow-hidden bg-[#174c2c] p-10 text-white">
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-400/10" />
                    <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-green-300/10" />

                    <div className="relative z-10 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                            <Sprout size={25} />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight">AgriN</span>
                    </div>

                    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                        <h2 className="max-w-sm text-4xl font-extrabold leading-[1.15]">
                            Join the smart farming revolution
                        </h2>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-green-50/75">
                            Create your account to start managing your farm with precision and confidence.
                        </p>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-14 lg:px-16 animate-in fade-in duration-700 overflow-y-auto">
                    
                    {/* Mobile Header */}
                    <div className="md:hidden flex flex-col items-center mb-10 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white mb-4 shadow-lg shadow-green-600/20">
                            <Sprout size={32} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">AgriN</h1>
                    </div>

                    <div className="w-full max-w-sm mx-auto">
                        <div className="mb-8 text-left hidden md:block">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Create an account
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your details to get started.
                            </p>
                        </div>
                        <div className="mb-8 text-center md:hidden">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Create an account
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your details to get started.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                            
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="At least 6 characters"
                                        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-300 ${strength.color}`}></div>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-500 uppercase w-12 text-right">
                                            {strength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="Repeat your password"
                                        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 animate-in shake duration-300 mt-4">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[#16a34a] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition-all hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm font-medium text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
                            Already have an account?{" "}
                            <Link to="/login" className="text-[#16a34a] hover:text-green-800 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}