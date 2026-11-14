import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiMapPin, FiChevronDown, FiChevronUp } from "react-icons/fi";

const SRI_LANKAN_PROVINCES = [
    "Western Province",
    "Central Province",
    "Southern Province",
    "North Western Province",
    "Sabaragamuwa Province",
    "Eastern Province",
    "Northern Province",
    "North Central Province",
    "Uva Province"
];

const SRI_LANKAN_DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara",
    "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota",
    "Kurunegala", "Puttalam",
    "Kegalle", "Ratnapura",
    "Batticaloa", "Ampara", "Trincomalee",
    "Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya",
    "Anuradhapura", "Polonnaruwa",
    "Badulla", "Monaragala"
];

export default function RegisterCustomerPage() {
    const navigate = useNavigate();
    const { registerCustomer } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Optional address fields
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("Colombo");
    const [province, setProvince] = useState("Western Province");
    const [postalCode, setPostalCode] = useState("");

    async function handleRegister(e) {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            confirmPassword
        };

        if (showAddressForm && addressLine1.trim() && city.trim()) {
            payload.deliveryAddress = {
                fullName: `${firstName} ${lastName}`.trim(),
                phone: phone.trim(),
                addressLine1: addressLine1.trim(),
                addressLine2: addressLine2.trim(),
                city: city.trim(),
                district: district.trim(),
                province: province.trim(),
                postalCode: postalCode.trim(),
                country: "Sri Lanka",
                isDefault: true
            };
        }

        try {
            await registerCustomer(payload);
            toast.success("Account created successfully! Welcome to Lumora.");
            navigate("/");
        } catch (error) {
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full min-h-screen relative overflow-x-hidden bg-primary">
            {/* Background Image & Overlay */}
            <div className="fixed inset-0 bg-[url('/bg/darkPottery.jpg')] bg-cover bg-center"></div>
            <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/85"></div>

            <div className="relative z-10 flex min-h-screen">
                {/* LEFT HERO PANEL (Desktop) */}
                <div className="hidden lg:flex w-5/12 flex-col justify-between p-12 text-lighttext">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logowname.png"
                            alt="Lumora Logo"
                            className="w-10 h-10 object-contain drop-shadow-md"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-lg font-bold tracking-wide">
                                LUMORA
                            </span>
                            <span className="text-lighttext/70 text-xs tracking-[0.3em] uppercase">
                                Handcraft
                            </span>
                        </div>
                    </div>

                    {/* Inspiring Statement */}
                    <div className="max-w-md my-auto">
                        <span className="inline-block px-3 py-1 rounded-full bg-primaryaccent/20 text-primaryaccent text-xs font-semibold tracking-wider uppercase mb-4">
                            Customer Membership
                        </span>
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                            Join the <br />
                            <span className="text-primaryaccent">Artisan Movement</span>
                        </h1>
                        <p className="mt-5 text-base text-lighttext/80 leading-relaxed">
                            Create your account to discover curated Sri Lankan handicrafts, authentic fine art masterpieces, and support independent artisans across the island.
                        </p>
                        <div className="mt-8 flex items-center gap-4 text-xs text-lighttext/60">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-secondaryaccent"></span>
                                Verified Artisans
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primaryaccent"></span>
                                Secure Ordering
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-secondaryaccent"></span>
                                Islandwide Delivery
                            </span>
                        </div>
                    </div>

                    {/* Bottom Attribution */}
                    <div className="text-xs text-lighttext/50">
                        <p>© 2026 LUMORA Handcraft. Empowering Sri Lankan craftsmanship.</p>
                    </div>
                </div>

                {/* RIGHT REGISTRATION FORM */}
                <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
                    <div className="w-full max-w-xl backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-10 relative my-6">
                        {/* Glow effect */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primaryaccent/20 blur-3xl rounded-full pointer-events-none"></div>

                        {/* Mobile Brand Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                            <img src="/logownameOriginal.png" alt="Lumora" className="w-44" />
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-lighttext">
                                Create Customer Account
                            </h2>
                            <p className="text-sm text-lighttext/70 mt-1">
                                Begin your journey with genuine Sri Lankan creations.
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Name Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Kasun"
                                        className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm placeholder:text-darktext/40 outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Perera"
                                        className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm placeholder:text-darktext/40 outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* Email & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="kasun@example.com"
                                        className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm placeholder:text-darktext/40 outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                        Mobile Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+94 77 123 4567"
                                        className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm placeholder:text-darktext/40 outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                        Password (min. 6 characters) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-11 px-4 pr-10 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm placeholder:text-darktext/40 outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-darktext/50 hover:text-darktext"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm placeholder:text-darktext/40 outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* Optional Delivery Address Toggle */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-lighttext text-xs font-medium transition cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <FiMapPin className="text-primaryaccent" />
                                        Add Default Delivery Address (Optional)
                                    </span>
                                    {showAddressForm ? <FiChevronUp /> : <FiChevronDown />}
                                </button>

                                {showAddressForm && (
                                    <div className="mt-3 p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-lighttext/70 mb-1">
                                                Address Line 1 *
                                            </label>
                                            <input
                                                type="text"
                                                value={addressLine1}
                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                placeholder="Street address, house number"
                                                className="w-full h-10 px-3 rounded-lg bg-white/90 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-lighttext/70 mb-1">
                                                Address Line 2
                                            </label>
                                            <input
                                                type="text"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                placeholder="Apartment, suite, unit (optional)"
                                                className="w-full h-10 px-3 rounded-lg bg-white/90 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-medium text-lighttext/70 mb-1">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="e.g. Colombo 07"
                                                    className="w-full h-10 px-3 rounded-lg bg-white/90 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-lighttext/70 mb-1">
                                                    Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={postalCode}
                                                    onChange={(e) => setPostalCode(e.target.value)}
                                                    placeholder="00700"
                                                    className="w-full h-10 px-3 rounded-lg bg-white/90 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-medium text-lighttext/70 mb-1">
                                                    District
                                                </label>
                                                <select
                                                    value={district}
                                                    onChange={(e) => setDistrict(e.target.value)}
                                                    className="w-full h-10 px-3 rounded-lg bg-white/90 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent"
                                                >
                                                    {SRI_LANKAN_DISTRICTS.map((d) => (
                                                        <option key={d} value={d}>
                                                            {d}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-lighttext/70 mb-1">
                                                    Province
                                                </label>
                                                <select
                                                    value={province}
                                                    onChange={(e) => setProvince(e.target.value)}
                                                    className="w-full h-10 px-3 rounded-lg bg-white/90 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent"
                                                >
                                                    {SRI_LANKAN_PROVINCES.map((p) => (
                                                        <option key={p} value={p}>
                                                            {p}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 mt-6 rounded-xl bg-gradient-to-r from-primaryaccent to-[#b86a55] text-lighttext font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center cursor-pointer"
                            >
                                {isSubmitting ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        {/* Sign in & Provider links */}
                        <div className="mt-6 pt-5 border-t border-white/15 text-center space-y-3">
                            <p className="text-xs text-lighttext/80">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-primaryaccent font-semibold hover:underline"
                                >
                                    Sign In
                                </Link>
                            </p>
                            <p className="text-xs text-lighttext/60">
                                Are you an artisan or fine artist?{" "}
                                <Link
                                    to="/register/provider"
                                    className="text-secondary text-xs font-semibold hover:underline"
                                >
                                    Join as a Product Provider →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

