import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "../../components/loader";
import { addToCart } from "../../utils/cart";
import {
    FiShoppingBag,
    FiHeart,
    FiMapPin,
    FiUser,
    FiTruck,
    FiTrash2,
    FiCheckCircle,
    FiX,
    FiPlus,
    FiArrowRight
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SRI_LANKAN_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
    "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
    "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const SRI_LANKAN_PROVINCES = [
    "Central", "Eastern", "North Central", "Northern", "North Western",
    "Sabaragamuwa", "Southern", "Uva", "Western"
];

export default function CustomerAccountPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'wishlist', 'addresses', 'profile'
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // New address modal state
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addrFullName, setAddrFullName] = useState("");
    const [addrPhone, setAddrPhone] = useState("");
    const [addrLine1, setAddrLine1] = useState("");
    const [addrLine2, setAddrLine2] = useState("");
    const [addrCity, setAddrCity] = useState("");
    const [addrDistrict, setAddrDistrict] = useState("Colombo");
    const [addrProvince, setAddrProvince] = useState("Western");
    const [addrPostalCode, setAddrPostalCode] = useState("");
    const [addrIsDefault, setAddrIsDefault] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchUserData() {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [ordRes, wishRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/orders/my-orders`, { headers }),
                    axios.get(`${API_BASE_URL}/api/users/wishlist`, { headers })
                ]);

                if (isMounted) {
                    if (ordRes.data.orders) setOrders(ordRes.data.orders);
                    if (wishRes.data.wishlist) setWishlist(wishRes.data.wishlist);
                    if (user?.deliveryAddresses) setAddresses(user.deliveryAddresses);
                }
            } catch (err) {
                console.error("Failed to fetch user account data:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchUserData();
        return () => {
            isMounted = false;
        };
    }, [user]);

    async function handleCancelOrder(orderId) {
        if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${API_BASE_URL}/api/orders/${orderId}/cancel`,
                { reason: "Customer requested cancellation via portal" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Order successfully cancelled.");
            setOrders((prev) =>
                prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: "cancelled" } : o))
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel order.");
        }
    }

    async function handleRemoveFromWishlist(productId) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${API_BASE_URL}/api/users/wishlist/${productId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setWishlist((prev) => prev.filter((p) => p.productId !== productId));
            toast.success("Removed from wishlist.");
        } catch (err) {
            toast.error("Failed to update wishlist.");
        }
    }

    async function handleAddAddress(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const payload = {
                fullName: addrFullName.trim(),
                phone: addrPhone.trim(),
                addressLine1: addrLine1.trim(),
                addressLine2: addrLine2.trim(),
                city: addrCity.trim(),
                district: addrDistrict,
                province: addrProvince,
                postalCode: addrPostalCode.trim() || "00000",
                country: "Sri Lanka",
                isDefault: addrIsDefault
            };

            const res = await axios.post(`${API_BASE_URL}/api/users/addresses`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Address added successfully!");
            if (res.data.deliveryAddresses) {
                setAddresses(res.data.deliveryAddresses);
            }
            setIsAddressModalOpen(false);
            setAddrFullName("");
            setAddrPhone("");
            setAddrLine1("");
            setAddrLine2("");
            setAddrCity("");
            setAddrPostalCode("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add address.");
        }
    }

    async function handleSetDefaultAddress(addressId) {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_BASE_URL}/api/users/addresses/${addressId}/default`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Default address updated.");
            if (res.data.deliveryAddresses) {
                setAddresses(res.data.deliveryAddresses);
            }
        } catch (err) {
            toast.error("Failed to update default address.");
        }
    }

    async function handleDeleteAddress(addressId) {
        if (!window.confirm("Delete this address from your book?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(`${API_BASE_URL}/api/users/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Address deleted.");
            if (res.data.deliveryAddresses) {
                setAddresses(res.data.deliveryAddresses);
            }
        } catch (err) {
            toast.error("Failed to delete address.");
        }
    }

    const statusBadgeColors = {
        pending: "bg-amber-100 text-amber-800",
        confirmed: "bg-blue-100 text-blue-800",
        processing: "bg-purple-100 text-purple-800",
        shipped: "bg-sky-100 text-sky-800",
        delivered: "bg-emerald-100 text-emerald-800",
        cancelled: "bg-rose-100 text-rose-800"
    };

    return (
        <div className="w-full min-h-screen bg-primary pb-20">
            {/* Header Banner */}
            <div className="bg-[#242424] text-lighttext py-10 px-4 sm:px-6 lg:px-8 border-b border-secondary/20">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primaryaccent text-lighttext flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                            {user?.firstName?.[0] || "C"}
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primaryaccent">
                                Collector Portal
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {user?.firstName} {user?.lastName}
                            </h1>
                            <p className="text-xs text-lighttext/60">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-lighttext transition border border-white/20 cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="bg-secondary/40 border-b border-secondary/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                            activeTab === "orders"
                                ? "bg-primaryaccent text-lighttext shadow-sm"
                                : "text-darktext/70 hover:bg-secondary hover:text-darktext"
                        }`}
                    >
                        <FiShoppingBag /> My Orders ({orders.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                            activeTab === "wishlist"
                                ? "bg-primaryaccent text-lighttext shadow-sm"
                                : "text-darktext/70 hover:bg-secondary hover:text-darktext"
                        }`}
                    >
                        <FiHeart /> Wishlist ({wishlist.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("addresses")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                            activeTab === "addresses"
                                ? "bg-primaryaccent text-lighttext shadow-sm"
                                : "text-darktext/70 hover:bg-secondary hover:text-darktext"
                        }`}
                    >
                        <FiMapPin /> Delivery Addresses ({addresses.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                            activeTab === "profile"
                                ? "bg-primaryaccent text-lighttext shadow-sm"
                                : "text-darktext/70 hover:bg-secondary hover:text-darktext"
                        }`}
                    >
                        <FiUser /> Profile Info
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {/* Tab 1: Orders History */}
                        {activeTab === "orders" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-darktext">Order History & Tracking</h2>

                                {orders.length === 0 ? (
                                    <div className="p-12 text-center rounded-3xl bg-secondary/20 border border-dashed border-secondary text-xs text-darktext/50">
                                        You haven't placed any orders yet.{" "}
                                        <Link to="/products" className="text-primaryaccent font-bold hover:underline ml-1">
                                            Start browsing creations
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.orderId}
                                                className="p-5 sm:p-6 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-4"
                                            >
                                                {/* Order Top Bar */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-secondary/50 text-xs">
                                                    <div>
                                                        <span className="font-mono font-bold text-darktext text-sm">
                                                            {order.orderId}
                                                        </span>
                                                        <span className="text-darktext/50 ml-2">
                                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                statusBadgeColors[order.orderStatus] || "bg-secondary text-darktext"
                                                            }`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>

                                                        {["pending", "confirmed"].includes(order.orderStatus) && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order.orderId)}
                                                                className="text-rose-600 hover:text-rose-700 font-semibold text-xs cursor-pointer"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Items Mini List */}
                                                <div className="space-y-3">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 text-xs">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-12 h-12 rounded-lg object-cover bg-secondary shrink-0"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <Link
                                                                    to={`/overview/${item.productId}`}
                                                                    className="font-bold text-darktext hover:text-primaryaccent transition truncate block"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <p className="text-[11px] text-darktext/50">
                                                                    Qty: {item.quantity} × LKR {item.price?.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <span className="font-extrabold text-darktext">
                                                                LKR {(item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Bottom Tracking & Total Summary */}
                                                <div className="pt-4 border-t border-secondary/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                                    {order.trackingNumber ? (
                                                        <div className="flex items-center gap-2 text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                                                            <FiTruck className="text-base shrink-0" />
                                                            <span>
                                                                Tracking: <strong>{order.trackingNumber}</strong>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-darktext/50">
                                                            Courier dispatch assigned upon processing.
                                                        </span>
                                                    )}

                                                    <div className="text-right">
                                                        <span className="text-darktext/60 mr-2">Total Paid:</span>
                                                        <span className="text-base font-extrabold text-primaryaccent">
                                                            LKR {order.total?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Wishlist */}
                        {activeTab === "wishlist" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-darktext">Saved Creations</h2>

                                {wishlist.length === 0 ? (
                                    <div className="p-12 text-center rounded-3xl bg-secondary/20 border border-dashed border-secondary text-xs text-darktext/50">
                                        Your wishlist is empty. Tap the heart icon on any creation to save it for later.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {wishlist.map((item) => (
                                            <div
                                                key={item.productId}
                                                className="p-4 rounded-3xl bg-white border border-secondary/70 shadow-xs flex flex-col justify-between space-y-3"
                                            >
                                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
                                                    <img
                                                        src={item.images?.[0]}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveFromWishlist(item.productId)}
                                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-rose-500 flex items-center justify-center shadow-sm cursor-pointer"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondaryaccent">
                                                        {item.subcategory}
                                                    </span>
                                                    <h4 className="font-bold text-darktext text-sm truncate">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-sm font-extrabold text-primaryaccent mt-1">
                                                        LKR {item.price?.toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => {
                                                            addToCart(item, 1);
                                                            toast.success("Added to cart!");
                                                        }}
                                                        className="flex-1 py-2 rounded-xl bg-primaryaccent text-lighttext font-bold text-xs hover:bg-[#b86a55] transition text-center cursor-pointer"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                    <Link
                                                        to={`/overview/${item.productId}`}
                                                        className="px-3 py-2 rounded-xl border border-secondary text-darktext text-xs hover:bg-secondary/40 font-semibold flex items-center justify-center"
                                                    >
                                                        <FiArrowRight />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Delivery Addresses */}
                        {activeTab === "addresses" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-darktext">Saved Addresses</h2>
                                    <button
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primaryaccent text-lighttext text-xs font-bold hover:bg-[#b86a55] transition shadow-xs cursor-pointer"
                                    >
                                        <FiPlus /> Add New Address
                                    </button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="p-12 text-center rounded-3xl bg-secondary/20 border border-dashed border-secondary text-xs text-darktext/50">
                                        No delivery addresses saved yet. Add an address for quicker checkout.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr._id}
                                                className={`p-5 rounded-3xl border transition space-y-3 relative ${
                                                    addr.isDefault
                                                        ? "bg-secondary/30 border-primaryaccent shadow-xs"
                                                        : "bg-white border-secondary/70"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-darktext text-sm">
                                                        {addr.fullName}
                                                    </h4>
                                                    {addr.isDefault && (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-primaryaccent text-lighttext text-[10px] font-bold uppercase tracking-wider">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-darktext/80 leading-relaxed">
                                                    {addr.addressLine1}
                                                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city},{" "}
                                                    {addr.district}, {addr.province} ({addr.postalCode})
                                                </p>
                                                <p className="text-xs font-semibold text-darktext/60">
                                                    Phone: {addr.phone}
                                                </p>

                                                <div className="flex items-center gap-4 pt-3 border-t border-secondary/50 text-xs">
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefaultAddress(addr._id)}
                                                            className="text-primaryaccent font-bold hover:underline cursor-pointer"
                                                        >
                                                            Set as Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr._id)}
                                                        className="text-rose-500 hover:text-rose-700 font-semibold ml-auto cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 4: Profile Details */}
                        {activeTab === "profile" && (
                            <div className="max-w-xl p-6 sm:p-8 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-5 text-xs">
                                <h2 className="text-xl font-bold text-darktext">Personal Details</h2>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-darktext/50 uppercase font-semibold block text-[10px]">
                                            Full Name
                                        </span>
                                        <p className="text-sm font-bold text-darktext">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-darktext/50 uppercase font-semibold block text-[10px]">
                                            Email Address
                                        </span>
                                        <p className="text-sm font-bold text-darktext">{user?.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-darktext/50 uppercase font-semibold block text-[10px]">
                                            Contact Number
                                        </span>
                                        <p className="text-sm font-bold text-darktext">
                                            {user?.phone || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-darktext/50 uppercase font-semibold block text-[10px]">
                                            Account Role
                                        </span>
                                        <p className="text-xs font-bold text-secondaryaccent uppercase">
                                            {user?.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 bg-darktext/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white rounded-3xl border border-secondary shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-secondary">
                            <h3 className="font-bold text-sm text-darktext flex items-center gap-2">
                                <FiMapPin className="text-primaryaccent" /> Add Sri Lankan Delivery Address
                            </h3>
                            <button
                                onClick={() => setIsAddressModalOpen(false)}
                                className="p-1 text-darktext/40 hover:text-darktext text-lg cursor-pointer"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-darktext block mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addrFullName}
                                        onChange={(e) => setAddrFullName(e.target.value)}
                                        placeholder="Kasun Silva"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-darktext block mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={addrPhone}
                                        onChange={(e) => setAddrPhone(e.target.value)}
                                        placeholder="+94 77 123 4567"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-darktext block mb-1">Address Line 1 *</label>
                                <input
                                    type="text"
                                    required
                                    value={addrLine1}
                                    onChange={(e) => setAddrLine1(e.target.value)}
                                    placeholder="No. 45/2, Temple Road"
                                    className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-darktext block mb-1">Address Line 2</label>
                                <input
                                    type="text"
                                    value={addrLine2}
                                    onChange={(e) => setAddrLine2(e.target.value)}
                                    placeholder="Apartment or landmark"
                                    className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-darktext block mb-1">City *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addrCity}
                                        onChange={(e) => setAddrCity(e.target.value)}
                                        placeholder="Kandy"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-darktext block mb-1">District *</label>
                                    <select
                                        value={addrDistrict}
                                        onChange={(e) => setAddrDistrict(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                    >
                                        {SRI_LANKAN_DISTRICTS.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-darktext block mb-1">Province *</label>
                                    <select
                                        value={addrProvince}
                                        onChange={(e) => setAddrProvince(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                    >
                                        {SRI_LANKAN_PROVINCES.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-darktext block mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        value={addrPostalCode}
                                        onChange={(e) => setAddrPostalCode(e.target.value)}
                                        placeholder="20000"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-secondary text-darktext"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="defaultChk"
                                    checked={addrIsDefault}
                                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                                    className="w-4 h-4 text-primaryaccent rounded"
                                />
                                <label htmlFor="defaultChk" className="text-xs font-semibold text-darktext">
                                    Set as default delivery address
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-secondary">
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-secondary text-darktext font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-primaryaccent text-lighttext font-bold hover:bg-[#b86a55] transition cursor-pointer"
                                >
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

