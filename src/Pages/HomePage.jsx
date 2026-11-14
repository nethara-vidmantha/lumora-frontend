import React from "react";
import { Route, Routes, Link } from "react-router-dom";
import Header from "../components/header";
import { ProductPage } from "./productPage";
import ProductOverview from "./productOverview";
import CartPage from "./cart";
import CheckoutPage from "./checkout";
import CustomerAccountPage from "./customer/CustomerAccountPage";

export default function HomePage() {
    return (
        <div className="w-full min-h-screen bg-primary flex flex-col">
            <Header />

            <div className="flex-1">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="w-full">
                                {/* Hero Section */}
                                <div className="relative w-full min-h-[550px] bg-darktext text-lighttext flex items-center justify-center overflow-hidden px-6 py-20">
                                    <div className="absolute inset-0 bg-[url('/bg/beautyPot.jpg')] bg-cover bg-center opacity-40"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-darktext via-darktext/70 to-transparent"></div>

                                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                                        <span className="inline-block px-4 py-1.5 rounded-full bg-primaryaccent/20 border border-primaryaccent/40 text-primaryaccent text-xs font-bold uppercase tracking-widest mb-6">
                                            Authentic Sri Lankan Heritage
                                        </span>
                                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                                            Masterpieces of Craft & <br />
                                            <span className="text-primaryaccent">Fine Artistry</span>
                                        </h1>
                                        <p className="mt-6 text-base sm:text-lg text-lighttext/80 max-w-2xl mx-auto leading-relaxed">
                                            Connecting conscious buyers with Sri Lankan artisans and fine artists. Every creation carries a legacy of island heritage, passion, and skill.
                                        </p>

                                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                            <Link
                                                to="/products"
                                                className="px-8 py-3.5 rounded-2xl bg-primaryaccent text-lighttext font-semibold text-sm hover:bg-[#b86a55] transition shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
                                            >
                                                Explore Collection
                                            </Link>
                                            <Link
                                                to="/register/provider"
                                                className="px-8 py-3.5 rounded-2xl bg-white/10 border border-white/25 text-lighttext font-semibold text-sm hover:bg-white/20 transition backdrop-blur-sm"
                                            >
                                                Join as an Artisan
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview of Products */}
                                <div className="max-w-7xl mx-auto px-6 py-16">
                                    <div className="flex items-end justify-between mb-8">
                                        <div>
                                            <span className="text-xs font-bold text-secondaryaccent uppercase tracking-widest">
                                                Curated Handcrafts
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl font-bold text-darktext mt-1">
                                                Featured Creations
                                            </h2>
                                        </div>
                                        <Link
                                            to="/products"
                                            className="text-xs font-semibold text-primaryaccent hover:underline"
                                        >
                                            View all products →
                                        </Link>
                                    </div>
                                    <ProductPage />
                                </div>
                            </div>
                        }
                    />
                    <Route path="/products" element={<ProductPage />} />
                    <Route path="/overview/:id" element={<ProductOverview />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/account" element={<CustomerAccountPage />} />
                    <Route
                        path="/about"
                        element={
                            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                                <h1 className="text-3xl font-bold text-darktext mb-4">About Lumora Handcraft</h1>
                                <p className="text-darktext/70 leading-relaxed text-sm">
                                    Lumora Handcraft is an admin-curated marketplace dedicated to preserving and empowering authentic Sri Lankan handicraft and fine art traditions. We bridge master artisans, independent painters, and sculptors directly with art lovers worldwide.
                                </p>
                            </div>
                        }
                    />
                    <Route
                        path="/contact"
                        element={
                            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                                <h1 className="text-3xl font-bold text-darktext mb-4">Contact Lumora</h1>
                                <p className="text-darktext/70 leading-relaxed text-sm">
                                    Have inquiries regarding product authenticity, artisan partnerships, or customer assistance? Email us at support@lumorahandcraft.com.
                                </p>
                            </div>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
                                <h1 className="text-5xl font-bold text-primaryaccent mb-2">404</h1>
                                <p className="text-lg font-semibold text-darktext mb-4">Page Not Found</p>
                                <Link
                                    to="/"
                                    className="px-6 py-2.5 rounded-xl bg-primaryaccent text-lighttext text-sm font-semibold hover:bg-[#b86a55] transition"
                                >
                                    Return Home
                                </Link>
                            </div>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}
