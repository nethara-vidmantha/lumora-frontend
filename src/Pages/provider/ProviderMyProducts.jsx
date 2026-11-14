import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader } from "../../components/loader";
import ProviderSubmitProduct from "./ProviderSubmitProduct";
import {
    FiPlus,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiXCircle,
    FiEdit3,
    FiEye,
    FiSearch,
    FiExternalLink
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProviderMyProducts() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Editing modal / inline state
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadMyProducts();
    }, [statusFilter]);

    async function loadMyProducts() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = `${API_BASE_URL}/api/products/provider/my-products`;
            if (statusFilter !== "all") {
                url += `?status=${statusFilter}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.products) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error("Failed to load provider products:", error);
            toast.error("Failed to load your submitted products.");
        } finally {
            setIsLoading(false);
        }
    }

    const filteredProducts = products.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.productId.toLowerCase().includes(query) ||
            p.subcategory?.toLowerCase().includes(query)
        );
    });

    if (editingProduct) {
        return (
            <div>
                <button
                    onClick={() => setEditingProduct(null)}
                    className="mb-4 text-xs font-semibold text-primaryaccent hover:underline flex items-center gap-1 cursor-pointer"
                >
                    ← Back to My Submissions
                </button>
                <ProviderSubmitProduct
                    initialData={editingProduct}
                    isEditMode={true}
                    onComplete={() => {
                        setEditingProduct(null);
                        loadMyProducts();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-darktext">
                        My Product Submissions
                    </h1>
                    <p className="text-xs sm:text-sm text-darktext/60 mt-1">
                        Track the review, approval, and publication status of your submitted handicrafts and fine arts.
                    </p>
                </div>

                <Link
                    to="/provider/submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primaryaccent text-lighttext font-semibold text-xs shadow-md hover:bg-[#b86a55] transition shrink-0"
                >
                    <FiPlus /> Submit New Creation
                </Link>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary pb-4 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: "all", label: "All Items" },
                        { id: "pending_review", label: "Pending Review" },
                        { id: "approved", label: "Approved" },
                        { id: "changes_requested", label: "Changes Requested" },
                        { id: "rejected", label: "Rejected" },
                        { id: "draft", label: "Drafts" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                statusFilter === tab.id
                                    ? "bg-darktext text-lighttext shadow-sm"
                                    : "bg-white border border-secondary text-darktext/70 hover:bg-secondary/40"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-darktext/40 text-sm" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search your items..."
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-secondary bg-white text-darktext text-xs outline-none focus:border-primaryaccent focus:ring-2 focus:ring-primaryaccent/15"
                    />
                </div>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="py-24 flex justify-center">
                    <Loader />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-secondary p-8">
                    <p className="text-base font-semibold text-darktext">No products found</p>
                    <p className="text-xs text-darktext/60 mt-1 mb-5">
                        {statusFilter === "all"
                            ? "You have not submitted any products yet."
                            : `No products currently match status '${statusFilter}'.`}
                    </p>
                    <Link
                        to="/provider/submit"
                        className="inline-block px-5 py-2.5 rounded-xl bg-primaryaccent text-lighttext font-semibold text-xs hover:bg-[#b86a55] transition"
                    >
                        Submit Your First Creation
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((item) => (
                        <div
                            key={item.productId}
                            className="bg-white rounded-3xl border border-secondary shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                        >
                            {/* Image Header with Badges */}
                            <div className="relative w-full h-48 bg-secondary/30 overflow-hidden">
                                <img
                                    src={item.images?.[0] || "/public/bg/pottery.jpg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Category Tag */}
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                    {item.mainCategory}
                                </span>

                                {/* Status Tag */}
                                <div className="absolute top-3 right-3">
                                    {item.approvalStatus === "pending_review" && (
                                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                            <FiClock /> In Review
                                        </span>
                                    )}
                                    {item.approvalStatus === "approved" && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                            <FiCheckCircle /> Approved
                                        </span>
                                    )}
                                    {item.approvalStatus === "changes_requested" && (
                                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                            <FiAlertCircle /> Revisions Needed
                                        </span>
                                    )}
                                    {item.approvalStatus === "rejected" && (
                                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                            <FiXCircle /> Rejected
                                        </span>
                                    )}
                                    {item.approvalStatus === "draft" && (
                                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold shadow-sm">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between text-[11px] text-darktext/50 mb-1">
                                        <span className="font-mono">{item.productId}</span>
                                        <span>{item.subcategory}</span>
                                    </div>

                                    <h3 className="font-bold text-darktext text-base line-clamp-1 mb-2">
                                        {item.name}
                                    </h3>

                                    <p className="text-xs text-darktext/60 line-clamp-2 mb-4 leading-relaxed">
                                        {item.description}
                                    </p>

                                    {/* Feedback Alert Box if changes requested or rejected */}
                                    {(item.approvalStatus === "changes_requested" ||
                                        item.approvalStatus === "rejected") && (
                                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mb-4">
                                            <strong className="block font-semibold mb-0.5">
                                                Administrator Feedback:
                                            </strong>
                                            <p className="text-rose-700 leading-snug">
                                                {item.adminFeedback || item.rejectionReason || "Please review and revise creation specifications."}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Price & Actions */}
                                <div className="pt-4 border-t border-secondary/60">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-[10px] text-darktext/50 block">Price</span>
                                            <span className="font-bold text-base text-primaryaccent">
                                                LKR {Number(item.price).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[10px] text-darktext/50 block">Stock</span>
                                            <span
                                                className={`text-xs font-semibold ${
                                                    item.stock <= 2
                                                        ? "text-rose-600"
                                                        : "text-secondaryaccent"
                                                }`}
                                            >
                                                {item.stock} unit{item.stock !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        {(item.approvalStatus === "changes_requested" ||
                                            item.approvalStatus === "rejected" ||
                                            item.approvalStatus === "draft") && (
                                            <button
                                                onClick={() => setEditingProduct(item)}
                                                className="flex-1 h-9 rounded-xl bg-primaryaccent text-lighttext font-semibold text-xs hover:bg-[#b86a55] transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                            >
                                                <FiEdit3 /> Edit & Resubmit
                                            </button>
                                        )}

                                        {item.approvalStatus === "approved" && (
                                            <Link
                                                to={`/overview/${item.productId}`}
                                                target="_blank"
                                                className="flex-1 h-9 rounded-xl border border-secondary text-darktext hover:bg-secondary font-semibold text-xs transition flex items-center justify-center gap-1.5"
                                            >
                                                <FiEye /> View Store Page
                                            </Link>
                                        )}

                                        {item.approvalStatus === "pending_review" && (
                                            <div className="w-full text-center py-1.5 text-xs text-amber-700 bg-amber-50 rounded-xl font-medium">
                                                Verification in progress
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

