import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    async function handleLogin(e) {
        if (e) e.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        setIsLoading(true);

        try {
            const { user } = await login(email.trim(), password);
            toast.success(`Welcome back, ${user.firstName}!`);

            // Check if there was a redirected location
            const from = location.state?.from?.pathname;

            if (user.role === "admin") {
                navigate(from || "/admin");
            } else if (user.role === "provider") {
                navigate(from || "/provider");
            } else {
                navigate(from || "/");
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error(error.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full h-screen relative overflow-hidden bg-darktext">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/bg/darkPottery.jpg')] bg-cover bg-center scale-105"></div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/85"></div>

            <div className="relative z-10 flex h-full">
                {/* LEFT SIDE BRAND HIGHLIGHT */}
                <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-between">
                    {/* TOP LEFT BRAND */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logowname.png"
                            alt="Lumora Logo"
                            className="w-10 h-10 object-contain drop-shadow-md"
                        />
                        <div className="flex leading-tight gap-[12px] items-center">
                            <span className="text-secondary text-lg font-semibold tracking-wide">
                                LUMORA
                            </span>
                            <span className="text-lighttext/70 text-xs tracking-[0.3em] uppercase">
                                Handcraft
                            </span>
                        </div>
                    </div>

                    {/* MAIN TEXT */}
                    <div className="flex items-center justify-center w-full my-auto">
                        <div className="max-w-xl">
                            <h1 className="text-5xl xl:text-6xl font-bold text-lighttext leading-tight">
                                Handmade
                                <br />
                                <span className="text-primaryaccent">with Love</span>
                            </h1>

                            <p className="mt-6 text-lg text-lighttext/80 leading-8">
                                Discover timeless handcrafted creations and authentic fine arts made by talented Sri Lankan artisans.
                            </p>

                            <div className="mt-10 w-24 h-1 bg-primaryaccent rounded-full"></div>
                        </div>
                    </div>

                    {/* BOTTOM LEFT */}
                    <div className="max-w-xs">
                        <p className="text-xs text-lighttext/60 leading-5 tracking-wide">
                            © 2026 LUMORA Handcraft.
                            All creations are made with passion, patience, and tradition.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE LOGIN CARD */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                    <div className="
                        w-full
                        max-w-md
                        backdrop-blur-2xl
                        bg-white/10
                        border
                        border-white/20
                        rounded-3xl
                        shadow-2xl
                        p-8 sm:p-10
                        flex
                        flex-col
                        items-center
                        relative
                        overflow-hidden
                    ">
                        {/* Glow */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primaryaccent/20 blur-3xl rounded-full pointer-events-none"></div>

                        {/* Logo */}
                        <Link to="/" className="cursor-pointer">
                            <img
                                src="/logownameOriginal.png"
                                alt="Lumora"
                                className="w-52 mb-3 drop-shadow-lg"
                            />
                        </Link>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-lighttext">
                            Welcome Back
                        </h2>

                        <p className="text-lighttext/70 mt-1 mb-6 text-center text-sm">
                            Sign in to continue your handmade journey.
                        </p>

                        <form onSubmit={handleLogin} className="w-full space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    className="
                                        w-full
                                        h-12
                                        px-5
                                        rounded-xl
                                        bg-white/80
                                        border
                                        border-white/30
                                        text-darktext
                                        text-sm
                                        placeholder:text-darktext/50
                                        outline-none
                                        transition
                                        focus:border-primaryaccent
                                        focus:ring-2
                                        focus:ring-primaryaccent/40
                                        focus:bg-white
                                    "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-lighttext/80">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-primaryaccent hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter your password"
                                        className="
                                            w-full
                                            h-12
                                            px-5
                                            pr-12
                                            rounded-xl
                                            bg-white/80
                                            border
                                            border-white/30
                                            text-darktext
                                            text-sm
                                            placeholder:text-darktext/50
                                            outline-none
                                            transition
                                            focus:border-primaryaccent
                                            focus:ring-2
                                            focus:ring-primaryaccent/40
                                            focus:bg-white
                                        "
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-darktext/50 hover:text-darktext cursor-pointer"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="
                                    w-full
                                    h-12
                                    mt-6
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-primaryaccent
                                    to-[#b86a55]
                                    text-lighttext
                                    font-semibold
                                    text-sm
                                    tracking-wide
                                    shadow-lg
                                    transition-all
                                    duration-300
                                    hover:scale-[1.02]
                                    hover:shadow-2xl
                                    active:scale-95
                                    disabled:opacity-60
                                    cursor-pointer
                                "
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        {/* Sign up options */}
                        <div className="w-full mt-6 pt-5 border-t border-white/15 text-center space-y-2">
                            <p className="text-xs text-lighttext/80">
                                New to Lumora?{" "}
                                <Link
                                    to="/register"
                                    className="text-primaryaccent font-semibold hover:underline"
                                >
                                    Create Customer Account
                                </Link>
                            </p>
                            <p className="text-xs text-lighttext/60">
                                Artisan or Artist?{" "}
                                <Link
                                    to="/register/provider"
                                    className="text-secondary text-xs font-semibold hover:underline"
                                >
                                    Apply as Product Provider
                                </Link>
                            </p>
                        </div>

                        {/* Footer text */}
                        <p className="text-[11px] text-lighttext/50 text-center tracking-wide mt-6">
                            Crafted with passion • Inspired by tradition
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
