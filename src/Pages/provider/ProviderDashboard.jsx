import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ProviderMyProducts from "./ProviderMyProducts";
import ProviderSubmitProduct from "./ProviderSubmitProduct";
import { Loader } from "../../components/loader";
import {
    FiLayout,
    FiPackage,
    FiPlusCircle,
    FiUser,
    FiLogOut,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiArrowLeft,
    FiShield
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProviderOverview() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE_URL}/api/products/provider/my-products`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.products) {
                    setProducts(res.data.products);
                }
            } catch (err) {
                console.error("Error fetching provider metrics:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMetrics();
    }, []);

    const totalCount = products.length;
    const approvedCount = products.filter((p) => p.approvalStatus === "approved").length;
    const pendingCount = products.filter((p) => p.approvalStatus === "pending_review").length;
    const changesCount = products.filter((p) => p.approvalStatus === "changes_requested").length;
    const rejectedCount = products.filter((p) => p.approvalStatus === "rejected").length;

    const isPendingApproval = user?.accountStatus === "pending";

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8">
            {/* Header Greeting */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-darktext">
                        Artisan Workspace
                    </h1>
                    <p className="text-xs sm:text-sm text-darktext/60 mt-1">
                        Welcome back,{" "}
                        <strong className="text-darktext">
                            {user?.providerProfile?.businessName || user?.fullName}
                        </strong>
                        . Manage your creations, review statuses, and inventory.
                    </p>
                </div>

                {!isPendingApproval && (
                    <Link
                        to="/provider/submit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primaryaccent text-lighttext font-semibold text-xs shadow-md hover:bg-[#b86a55] transition shrink-0"
                    >
                        <FiPlusCircle /> Submit New Product
                    </Link>
                )}
            </div>

            {/* Account Status Notice if Pending */}
            {isPendingApproval && (
                <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <FiClock className="text-xl text-amber-700 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Account Verification In Progress</h4>
                        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                            Your product provider application is currently being reviewed by the Lumora administration team. Once your profile is verified, you will be able to submit creations directly to the marketplace.
                        </p>
                    </div>
                </div>
            )}

            {/* Metric KPI Cards */}
            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Loader />
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-secondary shadow-sm">
                        <span className="text-xs font-semibold text-darktext/50 uppercase tracking-wider block mb-1">
                            Total Submissions
                        </span>
                        <p className="text-3xl font-bold text-darktext">{totalCount}</p>
                        <span className="text-[11px] text-darktext/60 mt-2 block">
                            All submitted items
                        </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-secondary shadow-sm">
                        <span className="text-xs font-semibold text-darktext/50 uppercase tracking-wider block mb-1">
                            Approved & Active
                        </span>
                        <p className="text-3xl font-bold text-emerald-700">{approvedCount}</p>
                        <span className="text-[11px] text-emerald-600 mt-2 block">
                            Live on marketplace
                        </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-secondary shadow-sm">
                        <span className="text-xs font-semibold text-darktext/50 uppercase tracking-wider block mb-1">
                            Under Review
                        </span>
                        <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                        <span className="text-[11px] text-amber-700 mt-2 block">
                            Awaiting admin verification
                        </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-secondary shadow-sm">
                        <span className="text-xs font-semibold text-darktext/50 uppercase tracking-wider block mb-1">
                            Needs Revision
                        </span>
                        <p className="text-3xl font-bold text-orange-600">{changesCount + rejectedCount}</p>
                        <span className="text-[11px] text-orange-700 mt-2 block">
                            Feedback provided
                        </span>
                    </div>
                </div>
            )}

            {/* Recent Submissions Preview */}
            <div className="bg-white rounded-3xl border border-secondary shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-darktext">Recent Submissions</h3>
                    <Link
                        to="/provider/products"
                        className="text-xs font-semibold text-primaryaccent hover:underline"
                    >
                        View all →
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-10 text-darktext/50 text-xs">
                        No product submissions recorded yet.
                    </div>
                ) : (
                    <div className="divide-y divide-secondary/40">
                        {products.slice(0, 5).map((item) => (
                            <div
                                key={item.productId}
                                className="py-3 flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/40 overflow-hidden shrink-0 border border-secondary">
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
                                            {item.productId} • {item.subcategory}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-xs text-primaryaccent">
                                        LKR {Number(item.price).toLocaleString()}
                                    </p>
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize mt-0.5 ${
                                            item.approvalStatus === "approved"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : item.approvalStatus === "pending_review"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-rose-100 text-rose-800"
                                        }`}
                                    >
                                        {item.approvalStatus.replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProviderDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const isActive = (path) => {
        if (path === "/provider" && location.pathname === "/provider") return true;
        if (path !== "/provider" && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="flex h-screen w-full gap-3 bg-darktext p-3 overflow-hidden">
            {/* Sidebar */}
            <div className="flex h-full w-[280px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-secondary/20 bg-[#242424] text-lighttext shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
                <div>
                    {/* Brand Header */}
                    <div className="flex h-[78px] w-full items-center rounded-t-2xl bg-secondaryaccent px-4 shadow-sm">
                        <img
                            src="/logownameOriginal3.png"
                            alt="Lumora"
                            className="h-10 w-auto object-contain"
                        />
                        <div className="ml-3">
                            <span className="text-base font-bold tracking-wide text-lighttext block leading-tight">
                                LUMORA
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-lighttext/80 font-medium">
                                Artisan Portal
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex w-full flex-col gap-1.5 px-3 pt-6">
                        <Link
                            to="/provider"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                isActive("/provider") && location.pathname === "/provider"
                                    ? "bg-secondaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <FiLayout className="text-xl transition-transform group-hover:scale-110" />
                            <span>Overview</span>
                        </Link>

                        <Link
                            to="/provider/products"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                isActive("/provider/products")
                                    ? "bg-secondaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <FiPackage className="text-xl transition-transform group-hover:scale-110" />
                            <span>My Creations</span>
                        </Link>

                        <Link
                            to="/provider/submit"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                isActive("/provider/submit")
                                    ? "bg-secondaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <FiPlusCircle className="text-xl transition-transform group-hover:scale-110" />
                            <span>Submit Product</span>
                        </Link>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10 space-y-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-xs text-lighttext/60 hover:text-lighttext transition px-2 py-1"
                    >
                        <FiArrowLeft /> Back to Storefront
                    </Link>

                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-secondaryaccent text-lighttext flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.providerProfile?.businessName?.[0] || user?.firstName?.[0] || "P"}
                            </div>
                            <div className="truncate text-left">
                                <p className="text-xs font-semibold text-lighttext truncate">
                                    {user?.providerProfile?.businessName || user?.fullName}
                                </p>
                                <p className="text-[10px] text-secondary capitalize">
                                    {user?.accountStatus || "provider"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="text-lighttext/50 hover:text-rose-400 text-lg transition p-1 cursor-pointer"
                        >
                            <FiLogOut />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="h-full flex-1 overflow-hidden rounded-2xl border border-secondary bg-primary shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
                <div className="h-full w-full overflow-y-auto scrollbar-thin">
                    <Routes>
                        <Route path="/" element={<ProviderOverview />} />
                        <Route path="/products" element={<ProviderMyProducts />} />
                        <Route path="/submit" element={<ProviderSubmitProduct />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

