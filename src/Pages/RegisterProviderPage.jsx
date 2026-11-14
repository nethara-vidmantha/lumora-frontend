import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FiCheckCircle, FiShield, FiUploadCloud, FiEye, FiEyeOff } from "react-icons/fi";
import mediaUpload from "../utils/mediaUpload";

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

const PROVIDER_TYPES = [
    { value: "individual_artisan", label: "Individual Artisan / Craftsperson" },
    { value: "handicraft_business", label: "Handicraft Business / Workshop" },
    { value: "independent_artist", label: "Independent Fine Artist / Painter / Sculptor" },
    { value: "fine_art_studio", label: "Fine Art Studio / Collective" },
    { value: "other", label: "Other Traditional Craft Producer" }
];

export default function RegisterProviderPage() {
    const navigate = useNavigate();
    const { registerProvider } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    // Section 1: Contact & Credentials
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Section 2: Artisan / Studio Profile
    const [businessName, setBusinessName] = useState("");
    const [providerType, setProviderType] = useState("individual_artisan");
    const [specialization, setSpecialization] = useState("");
    const [businessDescription, setBusinessDescription] = useState("");

    // Section 3: Location & Verification
    const [businessAddress, setBusinessAddress] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("Colombo");
    const [province, setProvince] = useState("Western Province");
    const [postalCode, setPostalCode] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessRegNumber, setBusinessRegNumber] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [facebook, setFacebook] = useState("");
    const [instagram, setInstagram] = useState("");
    const [logoFile, setLogoFile] = useState(null);

    function validateStep1() {
        if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
            toast.error("Please fill in your name, email, phone, and password.");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return false;
        }
        return true;
    }

    function validateStep2() {
        if (!businessName.trim() || !specialization.trim() || !businessDescription.trim()) {
            toast.error("Please provide your business/artist name, craft specialization, and description.");
            return false;
        }
        return true;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!businessAddress.trim() || !city.trim() || !postalCode.trim()) {
            toast.error("Please provide your complete workshop or studio address.");
            return;
        }

        setIsSubmitting(true);

        try {
            let logoUrl = "";
            if (logoFile) {
                try {
                    logoUrl = await mediaUpload(logoFile);
                } catch (err) {
                    console.warn("Logo upload failed, continuing without logo", err);
                }
            }

            const payload = {
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
                confirmPassword,
                businessName: businessName.trim(),
                providerType,
                specialization: specialization.trim(),
                businessDescription: businessDescription.trim(),
                businessAddress: businessAddress.trim(),
                city: city.trim(),
                district,
                province,
                postalCode: postalCode.trim(),
                businessPhone: businessPhone.trim() || phone.trim(),
                businessRegNumber: businessRegNumber.trim(),
                portfolioUrl: portfolioUrl.trim(),
                socialLinks: {
                    facebook: facebook.trim(),
                    instagram: instagram.trim()
                },
                logo: logoUrl
            };

            await registerProvider(payload);
            setIsRegistered(true);
            toast.success("Application submitted successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to submit application.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isRegistered) {
        return (
            <div className="w-full min-h-screen bg-primary flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl border border-secondary shadow-2xl p-8 sm:p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-secondaryaccent/15 text-secondaryaccent mx-auto flex items-center justify-center text-4xl mb-6">
                        <FiCheckCircle />
                    </div>
                    <span className="inline-block px-3.5 py-1 rounded-full bg-secondaryaccent/20 text-secondaryaccent text-xs font-bold uppercase tracking-wider mb-3">
                        Application Received
                    </span>
                    <h1 className="text-3xl font-bold text-darktext mb-3">
                        Welcome to Lumora Handcraft
                    </h1>
                    <p className="text-sm text-darktext/70 mb-6 leading-relaxed">
                        Thank you for applying as a product provider, <strong className="text-darktext">{businessName}</strong>. Your account has been registered with status <span className="font-semibold text-primaryaccent">Pending Verification</span>.
                    </p>

                    <div className="bg-primary/70 rounded-2xl p-5 mb-8 text-left border border-secondary text-xs text-darktext/80 space-y-2">
                        <div className="flex items-start gap-2">
                            <FiShield className="text-primaryaccent text-base mt-0.5 shrink-0" />
                            <span>
                                <strong>Admin Review Process:</strong> Our curator team verifies your artisan background and portfolio to protect authentic Sri Lankan craft heritage.
                            </span>
                        </div>
                        <p className="pl-6 text-darktext/60">
                            Once your account is approved, you will be notified and your provider dashboard will unlock the "Submit Product" feature.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/provider"
                            className="flex-1 h-12 rounded-xl bg-primaryaccent text-lighttext font-semibold text-sm flex items-center justify-center hover:bg-[#b86a55] transition shadow-md"
                        >
                            Open Provider Dashboard
                        </Link>
                        <Link
                            to="/"
                            className="flex-1 h-12 rounded-xl border border-secondary bg-primary text-darktext font-semibold text-sm flex items-center justify-center hover:bg-secondary transition"
                        >
                            Back to Storefront
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen relative overflow-x-hidden bg-primary">
            {/* Background & Overlay */}
            <div className="fixed inset-0 bg-[url('/bg/pottery.jpg')] bg-cover bg-center"></div>
            <div className="fixed inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/90"></div>

            <div className="relative z-10 flex min-h-screen">
                {/* LEFT HERO / VALUE PROPOSITION */}
                <div className="hidden lg:flex w-5/12 flex-col justify-between p-12 text-lighttext">
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

                    <div className="max-w-md my-auto">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondaryaccent/25 text-secondaryaccent text-xs font-semibold tracking-wider uppercase mb-4">
                            Artisans & Artists Portal
                        </span>
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                            Showcase Your Craft <br />
                            <span className="text-primaryaccent">To The World</span>
                        </h1>
                        <p className="mt-5 text-sm xl:text-base text-lighttext/80 leading-relaxed">
                            Join Lumora as a verified Product Provider. Submit handcrafted wooden crafts, pottery, batik, brass, masks, or fine art paintings for administrator review and publication.
                        </p>

                        <div className="mt-8 space-y-3 text-xs text-lighttext/75 bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <p className="font-semibold text-lighttext flex items-center gap-2">
                                <FiShield className="text-secondaryaccent text-base" />
                                Admin-Controlled Marketplace Model:
                            </p>
                            <p className="leading-relaxed">
                                • Providers submit creations with images and specifications.
                                <br />
                                • Administrators review quality and verify pricing.
                                <br />
                                • Approved products are published and inventory is tracked safely.
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-lighttext/50">
                        <p>© 2026 LUMORA Handcraft. Empowering Sri Lankan craftsmanship.</p>
                    </div>
                </div>

                {/* RIGHT STEP-BY-STEP FORM */}
                <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
                    <div className="w-full max-w-2xl backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-10 relative my-6">
                        {/* Glow */}
                        <div className="absolute -top-10 -right-10 w-44 h-44 bg-secondaryaccent/20 blur-3xl rounded-full pointer-events-none"></div>

                        {/* Title & Progress */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                                    Step {currentStep} of 3
                                </span>
                                <span className="text-xs text-lighttext/60">
                                    {currentStep === 1
                                        ? "Personal Credentials"
                                        : currentStep === 2
                                        ? "Artisan Profile"
                                        : "Workshop Location"}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-primaryaccent transition-all duration-300"
                                    style={{ width: `${(currentStep / 3) * 100}%` }}
                                ></div>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-bold text-lighttext mt-5">
                                Product Provider Application
                            </h2>
                            <p className="text-xs sm:text-sm text-lighttext/70 mt-1">
                                {currentStep === 1 && "Create your provider login and personal contact details."}
                                {currentStep === 2 && "Tell us about your craft, studio, and artistic specialization."}
                                {currentStep === 3 && "Provide your workshop location and business verification details."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ================= STEP 1 ================= */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                            Your Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="e.g. Sunil Dharmasena"
                                            className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Email Address (for login & stock alerts) *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="artisan@domain.lk"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Contact Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+94 71 234 5678"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Password (min 6 characters) *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full h-11 px-4 pr-10 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
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
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (validateStep1()) setCurrentStep(2);
                                            }}
                                            className="px-8 h-11 rounded-xl bg-primaryaccent text-lighttext font-semibold text-sm hover:bg-[#b86a55] transition shadow-md cursor-pointer"
                                        >
                                            Next: Studio Profile →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ================= STEP 2 ================= */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                            Business Name or Artist Alias *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            placeholder="e.g. Kandy Woodcrafts or Sunil Fine Arts"
                                            className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Provider Type *
                                            </label>
                                            <select
                                                value={providerType}
                                                onChange={(e) => setProviderType(e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            >
                                                {PROVIDER_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value}>
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Product Specialization *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                placeholder="e.g. Traditional Masks, Oil on Canvas, Pottery"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                            Business / Artisan Description *
                                        </label>
                                        <textarea
                                            rows="4"
                                            required
                                            value={businessDescription}
                                            onChange={(e) => setBusinessDescription(e.target.value)}
                                            placeholder="Describe your craft heritage, background, workshop practices, materials, or artistic journey..."
                                            className="w-full p-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="px-6 h-11 rounded-xl bg-white/10 text-lighttext text-sm hover:bg-white/20 transition cursor-pointer"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (validateStep2()) setCurrentStep(3);
                                            }}
                                            className="px-8 h-11 rounded-xl bg-primaryaccent text-lighttext font-semibold text-sm hover:bg-[#b86a55] transition shadow-md cursor-pointer"
                                        >
                                            Next: Location & Verification →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ================= STEP 3 ================= */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                            Workshop / Studio Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={businessAddress}
                                            onChange={(e) => setBusinessAddress(e.target.value)}
                                            placeholder="No. 45, Temple Road"
                                            className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="Kandy"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Postal Code *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                placeholder="20000"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                District *
                                            </label>
                                            <select
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            >
                                                {SRI_LANKAN_DISTRICTS.map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Province *
                                            </label>
                                            <select
                                                value={province}
                                                onChange={(e) => setProvince(e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            >
                                                {SRI_LANKAN_PROVINCES.map((p) => (
                                                    <option key={p} value={p}>
                                                        {p}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Business Registration No. (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={businessRegNumber}
                                                onChange={(e) => setBusinessRegNumber(e.target.value)}
                                                placeholder="e.g. PV-123456"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Portfolio / Website URL (Optional)
                                            </label>
                                            <input
                                                type="url"
                                                value={portfolioUrl}
                                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Instagram Profile
                                            </label>
                                            <input
                                                type="text"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                placeholder="@artisan_crafts"
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                                Facebook Page
                                            </label>
                                            <input
                                                type="text"
                                                value={facebook}
                                                onChange={(e) => setFacebook(e.target.value)}
                                                placeholder="facebook.com/..."
                                                className="w-full h-11 px-4 rounded-xl bg-white/85 border border-white/30 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Logo upload */}
                                    <div>
                                        <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                            Studio Logo / Artisan Portrait (Optional)
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-lighttext text-xs cursor-pointer transition">
                                                <FiUploadCloud className="text-base text-primaryaccent" />
                                                <span>Choose image</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setLogoFile(e.target.files[0])}
                                                    className="hidden"
                                                />
                                            </label>
                                            {logoFile && (
                                                <span className="text-xs text-secondary truncate max-w-[200px]">
                                                    {logoFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="px-6 h-11 rounded-xl bg-white/10 text-lighttext text-sm hover:bg-white/20 transition cursor-pointer"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 h-12 rounded-xl bg-gradient-to-r from-primaryaccent to-[#b86a55] text-lighttext font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                                        >
                                            {isSubmitting ? "Submitting Application..." : "Submit Application"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="mt-6 pt-5 border-t border-white/15 text-center">
                            <p className="text-xs text-lighttext/80">
                                Already registered as a provider?{" "}
                                <Link
                                    to="/login"
                                    className="text-primaryaccent font-semibold hover:underline"
                                >
                                    Sign In Here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

