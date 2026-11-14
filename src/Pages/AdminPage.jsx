import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { MdOutlineDashboardCustomize, MdOutlineShoppingCartCheckout, MdOutlineFactCheck } from "react-icons/md";
import { BsInboxes } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi2";
import { FiLogOut, FiArrowLeft } from "react-icons/fi";
import AdminProductPage from "./admin/adminProductPage";
import AddProductPage from "./admin/adminAddNewProduct";
import UpdateProductPage from "./admin/adminUpdateProduct";
import AdminUsersPage from "./admin/adminUsersPage";
import AdminProductApprovals from "./admin/adminProductApprovals";
import AdminAnalyticsDashboard from "./admin/adminAnalyticsDashboard";
import AdminOrdersPage from "./admin/adminOrdersPage";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const isActive = (path) => {
        if (path === "/admin" && location.pathname === "/admin") return true;
        if (path !== "/admin" && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="flex h-screen w-full gap-3 bg-darktext p-3 overflow-hidden">
            {/* Sidebar */}
            <div className="
                flex h-full w-[280px] shrink-0
                flex-col justify-between
                overflow-hidden
                rounded-2xl
                border border-secondary/20
                bg-[#242424]
                text-lighttext
                shadow-[0_10px_35px_rgba(0,0,0,0.3)]
            ">
                {/* Brand Header */}
                <div>
                    <div className="
                        flex h-[78px] w-full
                        items-center
                        rounded-t-2xl
                        bg-primaryaccent
                        px-4
                        shadow-sm
                    ">
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
                                Admin Portal
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex w-full flex-col gap-1.5 px-3 pt-6">
                        {/* Dashboard */}
                        <Link
                            to="/admin"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                isActive("/admin") && !location.pathname.includes("/admin/")
                                    ? "bg-primaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <MdOutlineDashboardCustomize className="text-xl transition-transform group-hover:scale-110" />
                            <span>Dashboard</span>
                        </Link>

                        {/* Products */}
                        <Link
                            to="/admin/products"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                isActive("/admin/products") ||
                                isActive("/admin/add-product") ||
                                isActive("/admin/update-product")
                                    ? "bg-primaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <BsInboxes className="text-xl transition-transform group-hover:scale-110" />
                            <span>Products</span>
                        </Link>

                        {/* Product Approvals */}
                        <Link
                            to="/admin/approvals"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                isActive("/admin/approvals")
                                    ? "bg-primaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <MdOutlineFactCheck className="text-xl transition-transform group-hover:scale-110" />
                            <span>Product Approvals</span>
                        </Link>

                        {/* Orders */}
                        <Link
                            to="/admin/orders"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                isActive("/admin/orders")
                                    ? "bg-primaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <MdOutlineShoppingCartCheckout className="text-xl transition-transform group-hover:scale-110" />
                            <span>Orders</span>
                        </Link>

                        {/* Users & Providers */}
                        <Link
                            to="/admin/users"
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                isActive("/admin/users")
                                    ? "bg-primaryaccent text-lighttext shadow-md"
                                    : "text-lighttext/70 hover:bg-white/10 hover:text-lighttext"
                            }`}
                        >
                            <HiOutlineUsers className="text-xl transition-transform group-hover:scale-110" />
                            <span>Users & Providers</span>
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
                            <div className="w-8 h-8 rounded-full bg-primaryaccent text-lighttext flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.firstName?.[0] || "A"}
                            </div>
                            <div className="truncate text-left">
                                <p className="text-xs font-semibold text-lighttext truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] text-secondaryaccent uppercase tracking-wider">
                                    Administrator
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
            <div className="
                h-full
                flex-1
                overflow-hidden
                rounded-2xl
                border border-secondary
                bg-primary
                shadow-[0_10px_35px_rgba(0,0,0,0.15)]
            ">
                <div className="h-full w-full overflow-y-auto scrollbar-thin">
                    <Routes>
                        <Route path="/" element={<AdminAnalyticsDashboard />} />
                        <Route path="/products" element={<AdminProductPage />} />
                        <Route path="/approvals" element={<AdminProductApprovals />} />
                        <Route path="/add-product" element={<AddProductPage />} />
                        <Route path="/update-product" element={<UpdateProductPage />} />

                        <Route path="/users" element={<AdminUsersPage />} />

                        <Route path="/orders" element={<AdminOrdersPage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
