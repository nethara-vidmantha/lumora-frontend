import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleRequestToken(e) {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
                email: email.trim()
            });

            if (res.data.resetToken) {
                setResetToken(res.data.resetToken);
            }
            toast.success(res.data.message || "Password reset token generated.");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process request.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        if (!resetToken.trim() || !newPassword) {
            toast.error("Please provide reset token and new password.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                token: resetToken.trim(),
                newPassword,
                confirmPassword
            });

            toast.success(res.data.message || "Password reset successfully!");
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full min-h-screen relative flex items-center justify-center p-6 bg-darktext">
            <div className="absolute inset-0 bg-[url('/bg/darkPottery.jpg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/85"></div>

            <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 text-lighttext">
                <Link to="/" className="inline-block mb-4">
                    <img src="/logownameOriginal.png" alt="Lumora" className="w-48 mx-auto" />
                </Link>

                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
                        <p className="text-xs text-lighttext/70 mb-6 leading-relaxed">
                            Enter the email address registered with your Lumora account to receive a reset token.
                        </p>

                        <form onSubmit={handleRequestToken} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full h-11 px-4 rounded-xl bg-white/85 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 rounded-xl bg-primaryaccent hover:bg-[#b86a55] font-semibold text-sm transition shadow-lg disabled:opacity-60 cursor-pointer"
                            >
                                {isSubmitting ? "Processing..." : "Generate Reset Token"}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
                        <p className="text-xs text-lighttext/70 mb-6 leading-relaxed">
                            Enter the reset token generated for <strong className="text-secondary">{email}</strong> and set your new password.
                        </p>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                    Reset Token
                                </label>
                                <textarea
                                    rows="2"
                                    required
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    placeholder="Paste reset token here"
                                    className="w-full p-3 rounded-xl bg-white/85 text-darktext text-xs outline-none focus:ring-2 focus:ring-primaryaccent resize-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                    New Password (min 6 characters)
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-11 px-4 rounded-xl bg-white/85 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-lighttext/80 mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-11 px-4 rounded-xl bg-white/85 text-darktext text-sm outline-none focus:ring-2 focus:ring-primaryaccent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 rounded-xl bg-primaryaccent hover:bg-[#b86a55] font-semibold text-sm transition shadow-lg disabled:opacity-60 cursor-pointer"
                            >
                                {isSubmitting ? "Resetting Password..." : "Update Password"}
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <div className="text-center py-4">
                        <div className="w-14 h-14 bg-secondaryaccent/20 text-secondaryaccent rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Password Reset Done</h2>
                        <p className="text-sm text-lighttext/80 mb-6">
                            Your password has been securely updated. You can now log into Lumora with your new credentials.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block w-full py-3 rounded-xl bg-primaryaccent text-lighttext font-semibold text-sm hover:bg-[#b86a55] transition"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-white/15 text-center">
                    <Link to="/login" className="text-xs text-lighttext/70 hover:text-lighttext hover:underline">
                        ← Return to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

