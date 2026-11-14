import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import ImageSlider from "../components/imageSlider";
import { Loader } from "../components/loader";
import { addToCart } from "../utils/cart";
import { useAuth } from "../context/AuthContext";
import {
    FiHeart,
    FiShoppingCart,
    FiCheck,
    FiShield,
    FiTruck,
    FiMapPin,
    FiAward,
    FiStar,
    FiUserCheck,
    FiShare2,
    FiArrowLeft,
    FiInfo
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductOverview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("specs"); // 'specs', 'artisan', 'reviews'

    // New review form
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchDetails() {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const [prodRes, revRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/products/${id}`, { headers }),
                    axios.get(`${API_BASE_URL}/api/reviews/${id}`).catch(() => ({ data: { reviews: [] } }))
                ]);

                if (isMounted) {
                    setProduct(prodRes.data);
                    if (revRes.data?.reviews) setReviews(revRes.data.reviews);
                }
            } catch (err) {
                console.error("Failed to load product overview:", err);
                if (isMounted) toast.error("Could not load creation details.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchDetails();
        return () => {
            isMounted = false;
        };
    }, [id]);

    async function handleToggleWishlist() {
        if (!user) {
            toast.error("Please sign in to save items to your wishlist.");
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

    function handleAddToCart() {
        if (!product || product.stock < 1) {
            toast.error("This creation is currently out of stock.");
            return;
        }
        addToCart(product, quantity);
        toast.success(`Added ${quantity} item(s) to your cart!`);
    }

    function handleBuyNow() {
        if (!product || product.stock < 1) {
            toast.error("This creation is currently out of stock.");
            return;
        }
        addToCart(product, quantity);
        navigate("/cart");
    }

    function handleShare() {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    }

    async function handleSubmitReview(e) {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in to submit a review.");
            navigate("/login");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${API_BASE_URL}/api/reviews/${product.productId}`,
                {
                    rating: reviewRating,
                    title: reviewTitle,
                    comment: reviewComment
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Review submitted successfully!");
            setReviews([res.data.review, ...reviews]);
            setReviewTitle("");
            setReviewComment("");
            if (product) {
                setProduct({
                    ...product,
                    averageRating: res.data.averageRating,
                    numReviews: res.data.numReviews
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-darktext">Creation Not Found</h2>
                <p className="text-sm text-darktext/60 mt-1 mb-6">
                    This creation may be unpublished or under administrator review.
                </p>
                <Link
                    to="/products"
                    className="px-6 py-2.5 rounded-xl bg-primaryaccent text-lighttext font-semibold text-xs hover:bg-[#b86a55] transition"
                >
                    Back to Gallery
                </Link>
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;
    const isFineArt = product.mainCategory === "Fine Arts";

    return (
        <div className="w-full min-h-screen bg-primary text-darktext pb-20">
            {/* Breadcrumb Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-darktext/60 border-b border-secondary/40">
                <div className="flex items-center gap-2">
                    <Link to="/" className="hover:text-darktext">
                        Home
                    </Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-darktext">
                        Creations
                    </Link>
                    <span>/</span>
                    <span className="text-darktext font-medium truncate max-w-[200px] sm:max-w-xs">
                        {product.name}
                    </span>
                </div>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 hover:text-darktext cursor-pointer"
                >
                    <FiShare2 /> Share
                </button>
            </div>

            {/* Main Product Showcase Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left: Media Slider (5 cols) */}
                    <div className="lg:col-span-6 xl:col-span-6">
                        <div className="rounded-3xl bg-secondary/30 p-4 sm:p-6 border border-secondary shadow-sm sticky top-6">
                            <ImageSlider images={product.images || []} />
                        </div>
                    </div>

                    {/* Right: Product Details & Purchase Actions (6-7 cols) */}
                    <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-start">
                        {/* Categories & Product ID */}
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-secondary text-secondaryaccent text-xs font-bold uppercase tracking-wider">
                                    {product.mainCategory}
                                </span>
                                <span className="text-xs font-semibold text-darktext/60">
                                    {product.subcategory}
                                </span>
                            </div>
                            <span className="font-mono text-xs text-darktext/50 bg-secondary/80 px-2.5 py-1 rounded-md">
                                {product.productId}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-darktext leading-tight mb-2">
                            {product.name}
                        </h1>

                        {/* Ratings & Artisan Quick Badge */}
                        <div className="flex items-center gap-4 text-xs mb-4">
                            <div className="flex items-center gap-1 text-amber-600 font-semibold">
                                <FiStar className="fill-amber-500 text-amber-500" />
                                <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : "New"}</span>
                                <span className="text-darktext/40">({product.numReviews || 0} reviews)</span>
                            </div>

                            {product.providerProfile && (
                                <div className="flex items-center gap-1 text-darktext/70 border-l border-secondary pl-4">
                                    <FiMapPin className="text-primaryaccent" />
                                    <span>
                                        {product.providerProfile.city}, {product.providerProfile.district}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="p-4 rounded-2xl bg-secondary/40 border border-secondary/60 mb-6 flex items-baseline justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-darktext/50 uppercase tracking-widest block mb-0.5">
                                    Price
                                </span>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl sm:text-3xl font-extrabold text-primaryaccent">
                                        LKR {product.price?.toLocaleString()}
                                    </span>
                                    {product.labelPrice > product.price && (
                                        <span className="text-sm sm:text-base text-darktext/40 line-through">
                                            LKR {product.labelPrice?.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stock Indicator */}
                            <div className="text-right">
                                {isOutOfStock ? (
                                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                                        Out of Stock
                                    </span>
                                ) : product.stock <= 3 ? (
                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                        Only {product.stock} Left
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                                        <FiCheck /> In Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description Summary */}
                        <p className="text-xs sm:text-sm text-darktext/80 leading-relaxed mb-6">
                            {product.description}
                        </p>

                        {/* Fine Art Key Badges */}
                        {isFineArt && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6 text-xs">
                                <div className="p-3 rounded-xl bg-secondary/30 border border-secondary/50">
                                    <span className="text-[10px] text-darktext/50 block font-semibold uppercase">Medium</span>
                                    <span className="font-bold text-darktext">{product.medium || "Original Medium"}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-secondary/30 border border-secondary/50">
                                    <span className="text-[10px] text-darktext/50 block font-semibold uppercase">Surface</span>
                                    <span className="font-bold text-darktext">{product.surface || "Canvas"}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-secondary/30 border border-secondary/50">
                                    <span className="text-[10px] text-darktext/50 block font-semibold uppercase">Authenticity</span>
                                    <span className="font-bold text-darktext">
                                        {product.hasCertificateOfAuthenticity ? "COA Included" : "Verified Island Craft"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector & Purchase Buttons */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4">
                                <label className="text-xs font-bold text-darktext uppercase tracking-wider">
                                    Quantity:
                                </label>
                                <div className="flex items-center rounded-xl border border-secondary bg-white overflow-hidden shadow-xs">
                                    <button
                                        type="button"
                                        disabled={quantity <= 1 || isOutOfStock}
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="px-3 py-1.5 text-sm font-bold text-darktext/70 hover:bg-secondary/50 disabled:opacity-40 cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1.5 text-xs font-bold text-darktext text-center min-w-[36px]">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={quantity >= product.stock || isOutOfStock}
                                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                        className="px-3 py-1.5 text-sm font-bold text-darktext/70 hover:bg-secondary/50 disabled:opacity-40 cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 py-3.5 rounded-2xl bg-primaryaccent text-lighttext font-semibold text-xs tracking-wide hover:bg-[#b86a55] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                                >
                                    <FiShoppingCart /> Add to Cart
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={isOutOfStock}
                                    className="flex-1 py-3.5 rounded-2xl bg-secondaryaccent text-lighttext font-semibold text-xs tracking-wide hover:bg-[#798873] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                                >
                                    Buy Now
                                </button>

                                <button
                                    onClick={handleToggleWishlist}
                                    title="Save to Wishlist"
                                    className={`px-4 py-3.5 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
                                        isWishlisted
                                            ? "border-rose-400 bg-rose-50 text-rose-600"
                                            : "border-secondary bg-white text-darktext/60 hover:text-rose-500 hover:border-rose-200"
                                    }`}
                                >
                                    <FiHeart className={isWishlisted ? "fill-rose-500" : ""} />
                                </button>
                            </div>
                        </div>

                        {/* Reassurance Grid */}
                        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-secondary/50 text-center text-darktext/70">
                            <div className="p-2">
                                <FiShield className="mx-auto text-lg text-primaryaccent mb-1" />
                                <p className="text-[11px] font-bold text-darktext">100% Authentic</p>
                                <p className="text-[10px] text-darktext/50">Admin Curated</p>
                            </div>
                            <div className="p-2 border-x border-secondary/50">
                                <FiTruck className="mx-auto text-lg text-primaryaccent mb-1" />
                                <p className="text-[11px] font-bold text-darktext">Islandwide Delivery</p>
                                <p className="text-[10px] text-darktext/50">Secure Packaging</p>
                            </div>
                            <div className="p-2">
                                <FiAward className="mx-auto text-lg text-primaryaccent mb-1" />
                                <p className="text-[11px] font-bold text-darktext">Artisan Support</p>
                                <p className="text-[10px] text-darktext/50">Direct Empowerment</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed Technical Details & Reviews Section */}
                <div className="mt-16 pt-8 border-t border-secondary/60">
                    <div className="flex items-center gap-4 border-b border-secondary/60 pb-3 mb-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("specs")}
                            className={`pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
                                activeTab === "specs"
                                    ? "border-b-2 border-primaryaccent text-primaryaccent"
                                    : "text-darktext/60 hover:text-darktext"
                            }`}
                        >
                            Technical Specifications
                        </button>
                        <button
                            onClick={() => setActiveTab("artisan")}
                            className={`pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
                                activeTab === "artisan"
                                    ? "border-b-2 border-primaryaccent text-primaryaccent"
                                    : "text-darktext/60 hover:text-darktext"
                            }`}
                        >
                            Artisan & Provenance
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
                                activeTab === "reviews"
                                    ? "border-b-2 border-primaryaccent text-primaryaccent"
                                    : "text-darktext/60 hover:text-darktext"
                            }`}
                        >
                            Customer Reviews ({reviews.length})
                        </button>
                    </div>

                    {/* Tab 1: Technical Specifications */}
                    {activeTab === "specs" && (
                        <div className="max-w-4xl rounded-2xl bg-secondary/30 p-6 border border-secondary/60">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                                {product.materials && product.materials.length > 0 && (
                                    <div>
                                        <dt className="font-semibold text-darktext/50 uppercase">Materials Used</dt>
                                        <dd className="font-bold text-darktext mt-0.5">
                                            {product.materials.join(", ")}
                                        </dd>
                                    </div>
                                )}
                                {product.productionTechnique && (
                                    <div>
                                        <dt className="font-semibold text-darktext/50 uppercase">Production Technique</dt>
                                        <dd className="font-bold text-darktext mt-0.5">
                                            {product.productionTechnique}
                                        </dd>
                                    </div>
                                )}
                                {product.dimensions && product.dimensions.length > 0 && (
                                    <div>
                                        <dt className="font-semibold text-darktext/50 uppercase">Dimensions</dt>
                                        <dd className="font-bold text-darktext mt-0.5">
                                            {product.dimensions.length} × {product.dimensions.width} ×{" "}
                                            {product.dimensions.height} {product.dimensions.unit}
                                        </dd>
                                    </div>
                                )}
                                {product.weight && product.weight.value > 0 && (
                                    <div>
                                        <dt className="font-semibold text-darktext/50 uppercase">Weight</dt>
                                        <dd className="font-bold text-darktext mt-0.5">
                                            {product.weight.value} {product.weight.unit}
                                        </dd>
                                    </div>
                                )}
                                {product.originLocation && (
                                    <div>
                                        <dt className="font-semibold text-darktext/50 uppercase">Origin / Craft Locality</dt>
                                        <dd className="font-bold text-darktext mt-0.5">
                                            {product.originLocation}
                                        </dd>
                                    </div>
                                )}
                                {isFineArt && (
                                    <>
                                        <div>
                                            <dt className="font-semibold text-darktext/50 uppercase">Year Created</dt>
                                            <dd className="font-bold text-darktext mt-0.5">
                                                {product.yearCreated || "Contemporary"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-darktext/50 uppercase">Edition</dt>
                                            <dd className="font-bold text-darktext mt-0.5">
                                                {product.editionInfo || "1/1 Original"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-darktext/50 uppercase">Framing</dt>
                                            <dd className="font-bold text-darktext mt-0.5">
                                                {product.isFramed ? "Framed & Ready to Hang" : "Unframed Canvas"}
                                            </dd>
                                        </div>
                                    </>
                                )}
                            </dl>
                        </div>
                    )}

                    {/* Tab 2: Artisan Provenance */}
                    {activeTab === "artisan" && (
                        <div className="max-w-4xl rounded-2xl bg-secondary/30 p-6 border border-secondary/60">
                            {product.providerProfile ? (
                                <div className="space-y-4 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-secondaryaccent text-lighttext flex items-center justify-center font-bold text-base">
                                            {product.providerProfile.businessName?.[0] || "A"}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-darktext">
                                                {product.providerProfile.businessName}
                                            </h4>
                                            <p className="text-[11px] text-secondaryaccent capitalize">
                                                {product.providerProfile.providerType?.replace("_", " ")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-darktext/75 leading-relaxed">
                                        {product.providerProfile.businessDescription}
                                    </p>
                                    <div className="flex items-center gap-4 text-darktext/60 pt-2 border-t border-secondary/50">
                                        <span>
                                            <strong>Studio Location:</strong> {product.providerProfile.city},{" "}
                                            {product.providerProfile.district} ({product.providerProfile.province})
                                        </span>
                                        <span>
                                            <strong>Specialization:</strong> {product.providerProfile.specialization}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-darktext/60">
                                    Curated directly by Lumora Heritage Administration.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Customer Reviews */}
                    {activeTab === "reviews" && (
                        <div className="max-w-4xl space-y-8">
                            {/* Review Form */}
                            <div className="rounded-2xl bg-secondary/30 p-6 border border-secondary/60">
                                <h3 className="font-bold text-sm text-darktext mb-1">
                                    Share Your Feedback
                                </h3>
                                <p className="text-xs text-darktext/60 mb-4">
                                    Have you purchased this creation? Share your thoughts with other collectors.
                                </p>

                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-darktext block mb-1">
                                            Rating:
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="text-lg text-amber-500 cursor-pointer"
                                                >
                                                    <FiStar
                                                        className={star <= reviewRating ? "fill-amber-500" : ""}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-xs font-bold text-darktext ml-2">
                                                {reviewRating} / 5 Stars
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Headline (e.g. Masterful hand carving!)"
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-secondary text-xs text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <div>
                                        <textarea
                                            required
                                            rows={3}
                                            placeholder="Write your review about the craft quality, details, and packaging..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-secondary text-xs text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="px-5 py-2.5 rounded-xl bg-primaryaccent text-lighttext text-xs font-semibold hover:bg-[#b86a55] transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-darktext/50 rounded-2xl border border-dashed border-secondary">
                                        No reviews yet for this creation. Be the first to leave a review!
                                    </div>
                                ) : (
                                    reviews.map((rev) => (
                                        <div
                                            key={rev._id}
                                            className="p-5 rounded-2xl bg-secondary/30 border border-secondary/60 space-y-2 text-xs"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-amber-500">
                                                        {[...Array(rev.rating)].map((_, i) => (
                                                            <FiStar key={i} className="fill-amber-500 text-xs" />
                                                        ))}
                                                    </div>
                                                    <span className="font-bold text-darktext">{rev.title}</span>
                                                </div>
                                                <span className="text-[10px] text-darktext/40">
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-darktext/80 leading-relaxed">{rev.comment}</p>

                                            <div className="flex items-center gap-3 text-[11px] text-darktext/50 pt-2 border-t border-secondary/40">
                                                <span>By {rev.customerName || "Collector"}</span>
                                                {rev.isVerifiedPurchase && (
                                                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                                        <FiUserCheck /> Verified Buyer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
