import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader } from "../../components/loader";
import {
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiAlertCircle,
    FiSearch,
    FiEye,
    FiX,
    FiGlobe,
    FiSlash,
    FiExternalLink
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminProductApprovals() {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("pending_review");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Review Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Rejection / Feedback Prompt State
    const [modalAction, setModalAction] = useState(null); // 'reject' | 'request_changes' | null
    const [feedbackText, setFeedbackText] = useState("");
    const [autoPublish, setAutoPublish] = useState(true);

    useEffect(() => {
        loadSubmissions();
    }, [statusFilter, categoryFilter]);

    async function loadSubmissions() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = `${API_BASE_URL}/api/products/admin/submissions`;
            const params = [];
            if (statusFilter !== "all") params.push(`approvalStatus=${statusFilter}`);
            if (categoryFilter !== "all") params.push(`mainCategory=${categoryFilter}`);
            if (params.length > 0) url += `?${params.join("&")}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.products) {
                setSubmissions(response.data.products);
            }
        } catch (error) {
            console.error("Failed to load submissions:", error);
            toast.error("Failed to load product submissions.");
        } finally {
            setIsLoading(false);
        }
    }

    const filteredSubmissions = submissions.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.productId.toLowerCase().includes(query) ||
            p.providerProfile?.businessName?.toLowerCase().includes(query) ||
            p.artistName?.toLowerCase().includes(query)
        );
    });

    const pendingCount = submissions.filter((s) => s.approvalStatus === "pending_review").length;

    // Approve Product
    async function handleApprove(productId) {
        setIsActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${API_BASE_URL}/api/products/admin/submissions/${productId}/review`,
                {
                    action: "approve",
                    autoPublish
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Product approved and verified successfully!");
            setSelectedProduct(null);
            loadSubmissions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve product");
        } finally {
            setIsActionLoading(false);
        }
    }

    // Submit Reject or Request Changes
    async function handleConfirmFeedbackAction() {
        if (!selectedProduct || !modalAction) return;

        if (!feedbackText.trim()) {
            toast.error(
                modalAction === "reject"
                    ? "Please enter a mandatory rejection reason."
                    : "Please specify what revisions or corrections are requested."
            );
            return;
        }

        setIsActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                action: modalAction,
                rejectionReason: modalAction === "reject" ? feedbackText.trim() : undefined,
                feedback: modalAction === "request_changes" ? feedbackText.trim() : undefined
            };

            await axios.patch(
                `${API_BASE_URL}/api/products/admin/submissions/${selectedProduct.productId}/review`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(
                modalAction === "reject"
                    ? "Product has been rejected with feedback recorded."
                    : "Product marked with modifications requested."
            );

            setModalAction(null);
            setFeedbackText("");
            setSelectedProduct(null);
            loadSubmissions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setIsActionLoading(false);
        }
    }

    // Toggle Live Publication
    async function handleTogglePublication(productId) {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_BASE_URL}/api/products/admin/${productId}/publish`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            loadSubmissions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to toggle publication");
        }
    }

    return (
        <div className="w-full min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-darktext">
                        Product Submissions & Curatorial Approval
                    </h1>
                    <p className="text-xs sm:text-sm text-darktext/60 mt-1">
                        Review artisan submissions, verify pricing and craft heritage, approve for public listing, or request revisions.
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-darktext/40 text-sm" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search product, SKU, artisan..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-secondary bg-white text-darktext text-xs outline-none focus:border-primaryaccent focus:ring-2 focus:ring-primaryaccent/15"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary pb-4 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: "pending_review", label: "Pending Review", badge: pendingCount },
                        { id: "approved", label: "Approved" },
                        { id: "changes_requested", label: "Changes Requested" },
                        { id: "rejected", label: "Rejected" },
                        { id: "all", label: "All Submissions" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === tab.id
                                    ? "bg-primaryaccent text-lighttext shadow-sm"
                                    : "bg-white border border-secondary text-darktext/70 hover:bg-secondary/40"
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.badge > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-darktext text-[10px] font-bold">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-darktext/60 font-semibold">Category:</span>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="h-9 px-3 rounded-xl border border-secondary bg-white text-darktext text-xs outline-none focus:border-primaryaccent"
                    >
                        <option value="all">All Categories</option>
                        <option value="Handicrafts">Handicrafts</option>
                        <option value="Fine Arts">Fine Arts</option>
                    </select>
                </div>
            </div>

            {/* Submissions List */}
            {isLoading ? (
                <div className="py-24 flex justify-center">
                    <Loader />
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-secondary p-8">
                    <p className="text-base font-semibold text-darktext">No submissions in this queue</p>
                    <p className="text-xs text-darktext/50 mt-1">
                        All products in this category have been processed or none match the criteria.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-secondary bg-white shadow-sm">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="border-b border-secondary bg-secondary/30 text-xs uppercase tracking-wider text-darktext/70 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Creation</th>
                                    <th className="px-6 py-4">Artisan / Studio</th>
                                    <th className="px-6 py-4">Classification</th>
                                    <th className="px-6 py-4">Price & Stock</th>
                                    <th className="px-6 py-4">Review Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/40">
                                {filteredSubmissions.map((item) => (
                                    <tr key={item.productId} className="hover:bg-primary/50 transition">
                                        {/* Product Thumbnail & Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-xl bg-secondary/30 overflow-hidden shrink-0 border border-secondary">
                                                    <img
                                                        src={item.images?.[0] || "/public/bg/pottery.jpg"}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-darktext text-xs line-clamp-1">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[11px] text-darktext/50 font-mono">
                                                        {item.productId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Artisan / Studio */}
                                        <td className="px-6 py-4 text-xs">
                                            <p className="font-semibold text-darktext">
                                                {item.providerProfile?.businessName ||
                                                    `${item.provider?.firstName || "Unknown"} ${
                                                        item.provider?.lastName || "Artisan"
                                                    }`}
                                            </p>
                                            <p className="text-darktext/50 text-[11px]">
                                                {item.providerProfile?.city || item.originLocation || "Sri Lanka"}
                                            </p>
                                        </td>

                                        {/* Classification */}
                                        <td className="px-6 py-4 text-xs">
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-[11px] font-semibold text-secondaryaccent uppercase">
                                                {item.mainCategory}
                                            </span>
                                            <p className="text-darktext/60 text-[11px] mt-0.5">
                                                {item.subcategory}
                                            </p>
                                        </td>

                                        {/* Price & Stock */}
                                        <td className="px-6 py-4 text-xs">
                                            <p className="font-bold text-primaryaccent">
                                                LKR {Number(item.price).toLocaleString()}
                                            </p>
                                            <p className="text-darktext/50 text-[11px]">
                                                {item.stock} in stock
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-xs">
                                            {item.approvalStatus === "pending_review" && (
                                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold inline-flex items-center gap-1">
                                                    <FiClock /> In Review
                                                </span>
                                            )}
                                            {item.approvalStatus === "approved" && (
                                                <div className="space-y-1">
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                                                        <FiCheckCircle /> Approved
                                                    </span>
                                                    <div>
                                                        {item.publicationStatus === "published" ? (
                                                            <span className="text-[10px] text-emerald-700 font-semibold block">
                                                                ● Live on Store
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-darktext/40 font-semibold block">
                                                                ○ Unpublished
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {item.approvalStatus === "changes_requested" && (
                                                <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold inline-flex items-center gap-1">
                                                    <FiAlertCircle /> Revisions
                                                </span>
                                            )}
                                            {item.approvalStatus === "rejected" && (
                                                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold inline-flex items-center gap-1">
                                                    <FiXCircle /> Rejected
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(item);
                                                        setActiveImageIdx(0);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-primaryaccent/10 text-primaryaccent font-semibold text-xs hover:bg-primaryaccent hover:text-lighttext transition cursor-pointer flex items-center gap-1"
                                                >
                                                    <FiEye /> Inspect
                                                </button>

                                                {item.approvalStatus === "approved" && (
                                                    <button
                                                        onClick={() => handleTogglePublication(item.productId)}
                                                        title={
                                                            item.publicationStatus === "published"
                                                                ? "Unpublish from Storefront"
                                                                : "Publish to Storefront"
                                                        }
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                                                            item.publicationStatus === "published"
                                                                ? "bg-secondary text-darktext hover:bg-secondary/70"
                                                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                                                        }`}
                                                    >
                                                        {item.publicationStatus === "published" ? (
                                                            <>
                                                                <FiSlash /> Unpublish
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiGlobe /> Publish
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= INSPECTION & REVIEW MODAL ================= */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-secondary shadow-2xl max-w-4xl w-full p-6 sm:p-8 my-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setSelectedProduct(null);
                                setModalAction(null);
                            }}
                            className="absolute right-5 top-5 text-darktext/50 hover:text-darktext text-xl cursor-pointer"
                        >
                            <FiX />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-bold uppercase tracking-wider text-secondaryaccent">
                                {selectedProduct.mainCategory} • {selectedProduct.subcategory}
                            </span>
                            <span className="font-mono text-xs text-darktext/50">
                                {selectedProduct.productId}
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-darktext mb-4">
                            {selectedProduct.name}
                        </h2>

                        {/* Top Grid: Gallery & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Image Viewer */}
                            <div>
                                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-secondary/30 border border-secondary mb-3">
                                    <img
                                        src={
                                            selectedProduct.images?.[activeImageIdx] ||
                                            "/public/bg/pottery.jpg"
                                        }
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {selectedProduct.images?.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {selectedProduct.images.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImageIdx(i)}
                                                className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                                                    activeImageIdx === i
                                                        ? "border-primaryaccent scale-105"
                                                        : "border-secondary opacity-70 hover:opacity-100"
                                                }`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details Panel */}
                            <div className="flex flex-col justify-between space-y-4">
                                <div className="space-y-4 text-xs text-darktext/80 bg-primary/40 p-5 rounded-2xl border border-secondary">
                                    <div className="flex items-center justify-between pb-3 border-b border-secondary">
                                        <div>
                                            <span className="text-[11px] text-darktext/50 block">Selling Price</span>
                                            <span className="text-2xl font-bold text-primaryaccent">
                                                LKR {Number(selectedProduct.price).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] text-darktext/50 block">Initial Stock</span>
                                            <span className="text-base font-bold text-darktext">
                                                {selectedProduct.stock} units
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <strong className="block text-darktext mb-1">Artisan / Studio:</strong>
                                        <p className="font-semibold text-secondaryaccent">
                                            {selectedProduct.providerProfile?.businessName ||
                                                `${selectedProduct.provider?.firstName} ${selectedProduct.provider?.lastName}`}
                                        </p>
                                        <p className="text-darktext/60">
                                            Contact: {selectedProduct.provider?.email} (
                                            {selectedProduct.providerProfile?.businessPhone ||
                                                selectedProduct.provider?.phone ||
                                                "N/A"}
                                            )
                                        </p>
                                    </div>

                                    {/* Fine Arts or Handicrafts Specs */}
                                    {selectedProduct.mainCategory === "Fine Arts" ? (
                                        <div className="space-y-1.5 pt-2 border-t border-secondary">
                                            <p>
                                                <strong>Artist:</strong> {selectedProduct.artistName || "N/A"}
                                            </p>
                                            <p>
                                                <strong>Medium:</strong> {selectedProduct.medium} on{" "}
                                                {selectedProduct.surface}
                                            </p>
                                            <p>
                                                <strong>Year:</strong> {selectedProduct.yearCreated || "N/A"} •{" "}
                                                {selectedProduct.editionInfo}
                                            </p>
                                            <p>
                                                <strong>Framed:</strong>{" "}
                                                {selectedProduct.isFramed ? "Yes (Included)" : "No"} •{" "}
                                                <strong>Authenticity Certificate:</strong>{" "}
                                                {selectedProduct.hasCertificateOfAuthenticity
                                                    ? "Certified"
                                                    : "None"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 pt-2 border-t border-secondary">
                                            {selectedProduct.productionTechnique && (
                                                <p>
                                                    <strong>Technique:</strong>{" "}
                                                    {selectedProduct.productionTechnique}
                                                </p>
                                            )}
                                            {selectedProduct.materials?.length > 0 && (
                                                <p>
                                                    <strong>Materials:</strong>{" "}
                                                    {selectedProduct.materials.join(", ")}
                                                </p>
                                            )}
                                            {selectedProduct.dimensions?.length > 0 && (
                                                <p>
                                                    <strong>Dimensions:</strong>{" "}
                                                    {selectedProduct.dimensions.length} ×{" "}
                                                    {selectedProduct.dimensions.width} ×{" "}
                                                    {selectedProduct.dimensions.height} cm
                                                </p>
                                            )}
                                            {selectedProduct.originLocation && (
                                                <p>
                                                    <strong>Origin:</strong> {selectedProduct.originLocation}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Product Story */}
                                <div>
                                    <strong className="block text-xs font-semibold text-darktext mb-1">
                                        Description & Heritage:
                                    </strong>
                                    <p className="text-xs text-darktext/70 leading-relaxed max-h-28 overflow-y-auto">
                                        {selectedProduct.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prompt for Feedback / Rejection if open */}
                        {modalAction && (
                            <div className="mb-6 p-5 rounded-2xl bg-primary border-2 border-primaryaccent/40 animate-fadeIn">
                                <h4 className="text-sm font-bold text-darktext mb-1">
                                    {modalAction === "reject"
                                        ? "Enter Rejection Reason (Mandatory)"
                                        : "Enter Modification Instructions for Artisan"}
                                </h4>
                                <p className="text-xs text-darktext/60 mb-3">
                                    This feedback will appear directly on the provider's dashboard so they can understand the curation decision or correct specifications.
                                </p>
                                <textarea
                                    rows="3"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder={
                                        modalAction === "reject"
                                            ? "Specify why this product cannot be published..."
                                            : "Specify needed changes (e.g. Higher resolution images, accurate dimensions)..."
                                    }
                                    className="w-full p-3 rounded-xl border border-secondary bg-white text-xs outline-none focus:border-primaryaccent resize-none mb-3"
                                ></textarea>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setModalAction(null);
                                            setFeedbackText("");
                                        }}
                                        className="px-4 py-2 rounded-xl border border-secondary text-xs font-semibold hover:bg-secondary cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={isActionLoading}
                                        onClick={handleConfirmFeedbackAction}
                                        className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-60 ${
                                            modalAction === "reject"
                                                ? "bg-rose-600 hover:bg-rose-700"
                                                : "bg-orange-600 hover:bg-orange-700"
                                        }`}
                                    >
                                        {isActionLoading
                                            ? "Saving..."
                                            : modalAction === "reject"
                                            ? "Confirm Rejection"
                                            : "Send Modification Request"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review Buttons */}
                        {!modalAction && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-secondary">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="autoPublishCheck"
                                        checked={autoPublish}
                                        onChange={(e) => setAutoPublish(e.target.checked)}
                                        className="w-4 h-4 text-primaryaccent rounded accent-primaryaccent"
                                    />
                                    <label
                                        htmlFor="autoPublishCheck"
                                        className="text-xs font-semibold text-darktext"
                                    >
                                        Publish to live storefront immediately upon approval
                                    </label>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => setModalAction("request_changes")}
                                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs font-semibold transition cursor-pointer"
                                    >
                                        Request Changes
                                    </button>
                                    <button
                                        onClick={() => setModalAction("reject")}
                                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-semibold transition cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        disabled={isActionLoading}
                                        onClick={() => handleApprove(selectedProduct.productId)}
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                                    >
                                        <FiCheckCircle /> Approve Product
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

