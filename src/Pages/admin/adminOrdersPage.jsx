import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader } from "../../components/loader";
import {
    FiShoppingBag,
    FiSearch,
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiEye,
    FiX,
    FiMapPin,
    FiUser
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Status update modal state
    const [newStatus, setNewStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    async function fetchOrders() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            if (selectedStatus !== "all") params.append("status", selectedStatus);
            if (searchQuery) params.append("search", searchQuery);

            const res = await axios.get(`${API_BASE_URL}/api/orders/admin/all?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.orders) {
                setOrders(res.data.orders);
            }
        } catch (err) {
            console.error("Failed to load orders:", err);
            toast.error("Could not fetch customer orders.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus]);

    function handleSearch(e) {
        e.preventDefault();
        fetchOrders();
    }

    function openOrderModal(order) {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus);
        setTrackingNumber(order.trackingNumber || "");
        setStatusNote("");
    }

    async function handleUpdateStatus(e) {
        e.preventDefault();
        if (!selectedOrder) return;

        setIsUpdating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_BASE_URL}/api/orders/admin/${selectedOrder.orderId}/status`,
                {
                    orderStatus: newStatus,
                    trackingNumber: trackingNumber.trim(),
                    note: statusNote.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            setSelectedOrder(null);
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update order status.");
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primaryaccent">
                    Fulfillment Operations
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-darktext tracking-tight mt-0.5">
                    Customer Order Management
                </h1>
                <p className="text-xs sm:text-sm text-darktext/60 mt-1">
                    Process domestic Sri Lankan shipments, assign tracking, and manage fulfillment timelines.
                </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-secondary/70">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setSelectedStatus(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition cursor-pointer ${
                                selectedStatus === s
                                    ? "bg-primaryaccent text-lighttext shadow-xs"
                                    : "text-darktext/70 hover:bg-secondary/40"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search order ID, name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border border-secondary text-xs text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-darktext/40" />
                </form>
            </div>

            {/* Orders Table */}
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader />
                </div>
            ) : orders.length === 0 ? (
                <div className="py-16 text-center text-xs text-darktext/50 rounded-3xl border border-dashed border-secondary bg-secondary/15">
                    No orders match your active filter.
                </div>
            ) : (
                <div className="rounded-3xl bg-white border border-secondary/70 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-secondary/30 border-b border-secondary/60 text-darktext/60 uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-3 px-4 font-bold">Order Reference</th>
                                    <th className="py-3 px-4 font-bold">Customer</th>
                                    <th className="py-3 px-4 font-bold">Items</th>
                                    <th className="py-3 px-4 font-bold">Total (LKR)</th>
                                    <th className="py-3 px-4 font-bold">Status</th>
                                    <th className="py-3 px-4 font-bold">Date Placed</th>
                                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/40">
                                {orders.map((ord) => {
                                    const statusColors = {
                                        pending: "bg-amber-100 text-amber-800",
                                        confirmed: "bg-blue-100 text-blue-800",
                                        processing: "bg-purple-100 text-purple-800",
                                        shipped: "bg-sky-100 text-sky-800",
                                        delivered: "bg-emerald-100 text-emerald-800",
                                        cancelled: "bg-rose-100 text-rose-800"
                                    };

                                    return (
                                        <tr key={ord.orderId} className="hover:bg-secondary/15 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-darktext">
                                                {ord.orderId}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-darktext block">
                                                    {ord.customerName}
                                                </span>
                                                <span className="text-[11px] text-darktext/50 block">
                                                    {ord.email}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-darktext/80">
                                                {ord.items?.length || 0} creation{ord.items?.length > 1 ? "s" : ""}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-primaryaccent">
                                                LKR {ord.total?.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        statusColors[ord.orderStatus] || "bg-secondary text-darktext"
                                                    }`}
                                                >
                                                    {ord.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-darktext/60">
                                                {new Date(ord.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => openOrderModal(ord)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-darktext font-bold text-[11px] transition cursor-pointer"
                                                >
                                                    <FiEye /> Inspect & Update
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Inspect & Update Order Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-darktext/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-3xl border border-secondary shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-secondary/40 border-b border-secondary flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-darktext flex items-center gap-2">
                                    <FiShoppingBag /> Order Details: {selectedOrder.orderId}
                                </h3>
                                <p className="text-[11px] text-darktext/60">
                                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-1 text-darktext/40 hover:text-darktext text-lg cursor-pointer"
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 text-xs scrollbar-thin">
                            {/* Delivery Address Card */}
                            <div className="p-4 rounded-2xl bg-secondary/30 border border-secondary space-y-1">
                                <span className="font-bold text-[10px] uppercase text-darktext/50 tracking-wider flex items-center gap-1">
                                    <FiMapPin /> Delivery Destination
                                </span>
                                <p className="font-bold text-darktext text-sm">
                                    {selectedOrder.shippingAddress?.fullName} ({selectedOrder.shippingAddress?.phone})
                                </p>
                                <p className="text-darktext/70">
                                    {selectedOrder.shippingAddress?.addressLine1}
                                    {selectedOrder.shippingAddress?.addressLine2 ? `, ${selectedOrder.shippingAddress.addressLine2}` : ""},{" "}
                                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district},{" "}
                                    {selectedOrder.shippingAddress?.province} ({selectedOrder.shippingAddress?.postalCode})
                                </p>
                            </div>

                            {/* Ordered Items List */}
                            <div className="space-y-2">
                                <span className="font-bold text-[10px] uppercase text-darktext/50 tracking-wider">
                                    Purchased Creations
                                </span>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-secondary/20 border border-secondary flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-10 h-10 rounded-lg object-cover bg-secondary"
                                                />
                                                <div>
                                                    <h4 className="font-bold text-darktext">{item.name}</h4>
                                                    <span className="text-[10px] font-mono text-darktext/50">
                                                        {item.productId}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] text-darktext/60 block">
                                                    Qty: {item.quantity} × LKR {item.price?.toLocaleString()}
                                                </span>
                                                <span className="font-bold text-darktext">
                                                    LKR {(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Update Form */}
                            <form onSubmit={handleUpdateStatus} className="p-5 rounded-2xl bg-secondary/40 border border-secondary space-y-4">
                                <h4 className="font-bold text-darktext text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <FiTruck className="text-primaryaccent" /> Update Fulfillment Status
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            New Status
                                        </label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-secondary text-xs text-darktext font-medium cursor-pointer"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            Domestic Courier Tracking #
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. PRONTO-LK-445522"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-secondary text-xs text-darktext"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-darktext block mb-1">
                                        Status Update Note / Customer Update
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dispatched via Colombo courier hub."
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white border border-secondary text-xs text-darktext"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-4 py-2 rounded-xl border border-secondary text-darktext/70 text-xs font-semibold hover:bg-secondary cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="px-5 py-2 rounded-xl bg-primaryaccent text-lighttext text-xs font-semibold hover:bg-[#b86a55] transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {isUpdating ? "Updating..." : "Save Status"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

