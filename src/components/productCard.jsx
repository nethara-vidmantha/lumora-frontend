import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiHeart, FiMapPin, FiStar } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imgSrc, setImgSrc] = useState(product.images?.[0] || "/bg/beautyPot.jpg");

    async function handleToggleWishlist(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please sign in to save items.");
            navigate("/login");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${API_BASE_URL}/api/users/wishlist/${product.productId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsWishlisted(res.data.isSaved);
            toast.success(res.data.message);
        } catch (err) {
            toast.error("Failed to update wishlist");
        }
    }

    const discountPercent =
        product.labelPrice > product.price
            ? Math.round(((product.labelPrice - product.price) / product.labelPrice) * 100)
            : 0;

    const isOutOfStock = product.stock <= 0;

    return (
        <div className="group w-full max-w-[320px] bg-white rounded-3xl border border-secondary/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
            {/* Image Container with subtle zoom */}
            <div className="relative w-full h-[240px] overflow-hidden bg-secondary/30">
                <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    src={imgSrc}
                    alt={product.name}
                    onError={() => setImgSrc("/bg/beautyPot.jpg")}
                />

                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-primaryaccent text-lighttext text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {discountPercent}% OFF
                    </span>
                )}

                {/* Stock Warning Badge */}
                {isOutOfStock ? (
                    <span className="absolute bottom-3 left-3 bg-rose-600/90 backdrop-blur-xs text-lighttext text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        Sold Out
                    </span>
                ) : product.stock <= 3 ? (
                    <span className="absolute bottom-3 left-3 bg-amber-600/90 backdrop-blur-xs text-lighttext text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        Only {product.stock} Left
                    </span>
                ) : null}

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    title="Save to Wishlist"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-darktext hover:text-rose-500 flex items-center justify-center shadow-sm transition backdrop-blur-xs cursor-pointer"
                >
                    <FiHeart className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-sm"} />
                </button>
            </div>

            {/* Content Container */}
            <div className="flex flex-col flex-grow p-5 space-y-2">
                {/* Category & Origin */}
                <div className="flex items-center justify-between text-[11px] text-secondaryaccent uppercase tracking-wider font-semibold">
                    <span className="truncate max-w-[150px]">{product.subcategory || product.category}</span>
                    <span className="font-mono text-[10px] text-darktext/40">{product.productId}</span>
                </div>

                {/* Product Name */}
                <h3 className="text-sm font-bold text-darktext line-clamp-1 group-hover:text-primaryaccent transition-colors">
                    {product.name}
                </h3>

                {/* Provenance / Artist Note */}
                <div className="flex items-center gap-1 text-[11px] text-darktext/60 truncate">
                    {product.artistName ? (
                        <span>By {product.artistName}</span>
                    ) : product.originLocation ? (
                        <span className="flex items-center gap-1">
                            <FiMapPin className="text-primaryaccent" /> {product.originLocation}
                        </span>
                    ) : (
                        <span>Curated Artisan Craft</span>
                    )}
                </div>

                {/* Pricing Section */}
                <div className="pt-2 mt-auto flex items-baseline justify-between">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-base font-extrabold text-primaryaccent">
                                LKR {product.price?.toLocaleString()}
                            </span>
                            {product.labelPrice > product.price && (
                                <span className="text-xs text-darktext/40 line-through">
                                    LKR {product.labelPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <FiStar className="fill-amber-500 text-amber-500" />
                            <span>{product.averageRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <Link
                    to={`/overview/${product.productId}`}
                    className="w-full mt-3 py-2.5 rounded-xl bg-primaryaccent hover:bg-[#b86a55] text-lighttext font-bold text-xs transition shadow-xs flex items-center justify-center text-center"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
