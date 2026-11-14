import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader } from "../../components/loader";
import {
    FiUsers,
    FiUserCheck,
    FiClock,
    FiAlertCircle,
    FiSearch,
    FiCheck,
    FiX,
    FiLock,
    FiUnlock,
    FiExternalLink,
    FiMapPin,
    FiPhone,
    FiMail
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
    const [activeTab, setActiveTab] = useState("providers"); // 'providers' | 'customers' | 'all'
    const [providerStatusFilter, setProviderStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Selected Provider for Review Modal
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch users based on tab and filters
    useEffect(() => {
        loadUsers();
    }, [activeTab, providerStatusFilter]);

    async function loadUsers() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            let endpoint = `${API_BASE_URL}/api/users`;

            if (activeTab === "customers") {
                endpoint = `${API_BASE_URL}/api/users/customers`;
            } else if (activeTab === "providers") {
                endpoint = `${API_BASE_URL}/api/users/providers`;
                if (providerStatusFilter !== "all") {
                    endpoint += `?status=${providerStatusFilter}`;
                }
            }

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.users) {
                setUsers(response.data.users);
            } else if (response.data.customers) {
                setUsers(response.data.customers);
            } else if (response.data.providers) {
                setUsers(response.data.providers);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load user records");
        } finally {
            setIsLoading(false);
        }
    }

    // Filter by search term on client side for quick responsiveness
    const filteredUsers = users.filter((u) => {
        const query = searchTerm.toLowerCase();
        const nameMatch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(query);
        const emailMatch = u.email.toLowerCase().includes(query);
        const businessMatch = u.providerProfile?.businessName?.toLowerCase().includes(query);
        return nameMatch || emailMatch || businessMatch;
    });

    // Counts for KPI Cards
    const totalCount = users.length;
    const pendingCount = users.filter((u) => u.accountStatus === "pending").length;

    // Approve Provider
    async function handleApproveProvider(userId) {
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_BASE_URL}/api/users/${userId}/status`,
                { status: "approved" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Provider approved! They can now submit products.");
            setSelectedProvider(null);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve provider");
        } finally {
            setActionLoading(false);
        }
    }

    // Reject Provider
    async function handleRejectProvider() {
        if (!selectedProvider) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${API_BASE_URL}/api/users/${selectedProvider._id}/status`,
                {
                    status: "rejected",
                    rejectionReason: rejectionReason.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Provider application marked as rejected.");
            setRejectionModalVisible(false);
            setSelectedProvider(null);
            setRejectionReason("");
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject provider");
        } finally {
            setActionLoading(false);
        }
    }

    // Suspend / Reactivate Provider
    async function handleToggleSuspend(userId, currentStatus) {
        const nextStatus = currentStatus === "suspended" ? "approved" : "suspended";
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${API_BASE_URL}/api/users/${userId}/status`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Provider status updated to ${nextStatus}.`);
            loadUsers();
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    // Toggle Block User
    async function handleToggleBlock(userId) {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_BASE_URL}/api/users/${userId}/block`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update block state");
        }
    }

    return (
        <div className="min-h-screen w-full bg-primary p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-darktext">
                        User & Provider Management
                    </h1>
                    <p className="text-sm text-darktext/60 mt-1">
                        Review artisan applications, verify product providers, and manage platform customers.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-darktext/40" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name, email, studio..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent focus:ring-2 focus:ring-primaryaccent/15"
                    />
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-2 border-b border-secondary pb-3 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("providers")}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                        activeTab === "providers"
                            ? "bg-primaryaccent text-lighttext shadow-sm"
                            : "bg-white text-darktext/70 hover:bg-secondary/40 border border-secondary"
                    }`}
                >
                    <FiUserCheck />
                    <span>Product Providers</span>
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-darktext text-xs font-bold animate-pulse">
                            {pendingCount} Pending
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("customers")}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                        activeTab === "customers"
                            ? "bg-primaryaccent text-lighttext shadow-sm"
                            : "bg-white text-darktext/70 hover:bg-secondary/40 border border-secondary"
                    }`}
                >
                    <FiUsers />
                    <span>Customers</span>
                </button>

                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                        activeTab === "all"
                            ? "bg-primaryaccent text-lighttext shadow-sm"
                            : "bg-white text-darktext/70 hover:bg-secondary/40 border border-secondary"
                    }`}
                >
                    <span>All Accounts</span>
                </button>
            </div>

            {/* Sub-Filters for Providers */}
            {activeTab === "providers" && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <span className="text-xs font-semibold text-darktext/60 mr-2">Filter Status:</span>
                    {["all", "pending", "approved", "rejected", "suspended"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setProviderStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                                providerStatusFilter === st
                                    ? "bg-darktext text-lighttext"
                                    : "bg-white border border-secondary text-darktext/70 hover:bg-secondary/30"
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-hidden rounded-2xl border border-secondary bg-white shadow-sm">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-base font-semibold text-darktext">No accounts found</p>
                        <p className="text-xs text-darktext/50 mt-1">
                            Try adjusting your search criteria or filter options.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="border-b border-secondary bg-secondary/30 text-xs uppercase tracking-wider text-darktext/70 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role / Details</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/40">
                                {filteredUsers.map((item) => {
                                    const isProvider = item.role === "provider";
                                    const profile = item.providerProfile;

                                    return (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-primary/50 transition-colors"
                                        >
                                            {/* User identity */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0 border border-secondary flex items-center justify-center font-bold text-darktext/60">
                                                        {item.profilePicture ? (
                                                            <img
                                                                src={item.profilePicture}
                                                                alt={item.firstName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            item.firstName[0]
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-darktext">
                                                            {item.firstName} {item.lastName}
                                                        </p>
                                                        <p className="text-xs text-darktext/50">
                                                            {item.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Details / Business */}
                                            <td className="px-6 py-4">
                                                {isProvider ? (
                                                    <div>
                                                        <p className="font-medium text-darktext text-xs">
                                                            {profile?.businessName || "Artisan Workshop"}
                                                        </p>
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-secondary/70 text-[11px] text-secondaryaccent font-semibold mt-1">
                                                            {profile?.specialization || "Handicrafts"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primaryaccent/10 text-primaryaccent text-xs font-semibold uppercase">
                                                            {item.role}
                                                        </span>
                                                        {item.deliveryAddresses?.length > 0 && (
                                                            <p className="text-[11px] text-darktext/50 mt-1">
                                                                {item.deliveryAddresses.length} saved address
                                                                {item.deliveryAddresses.length > 1 ? "es" : ""}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Contact */}
                                            <td className="px-6 py-4 text-xs text-darktext/80">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5">
                                                        <FiPhone className="text-darktext/40" />
                                                        {item.phone || profile?.businessPhone || "N/A"}
                                                    </span>
                                                    {profile?.city && (
                                                        <span className="flex items-center gap-1.5 text-darktext/60">
                                                            <FiMapPin className="text-darktext/40" />
                                                            {profile.city}, {profile.district}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {item.isBlocked ? (
                                                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1">
                                                        <FiLock /> Blocked
                                                    </span>
                                                ) : isProvider ? (
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 capitalize ${
                                                            item.accountStatus === "approved"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : item.accountStatus === "pending"
                                                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                                                : item.accountStatus === "rejected"
                                                                ? "bg-rose-100 text-rose-800"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {item.accountStatus === "pending" && <FiClock />}
                                                        {item.accountStatus}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                                        Active
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isProvider && (
                                                        <button
                                                            onClick={() => setSelectedProvider(item)}
                                                            className="px-3 py-1.5 rounded-lg bg-primaryaccent/10 text-primaryaccent font-semibold text-xs hover:bg-primaryaccent hover:text-lighttext transition cursor-pointer"
                                                        >
                                                            Inspect Studio
                                                        </button>
                                                    )}

                                                    {isProvider && item.accountStatus === "pending" && (
                                                        <button
                                                            onClick={() => handleApproveProvider(item._id)}
                                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1 shadow-sm"
                                                        >
                                                            <FiCheck /> Approve
                                                        </button>
                                                    )}

                                                    {item.role !== "admin" && (
                                                        <button
                                                            onClick={() => handleToggleBlock(item._id)}
                                                            title={item.isBlocked ? "Unblock User" : "Block User"}
                                                            className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                                item.isBlocked
                                                                    ? "bg-red-600 text-white hover:bg-red-700"
                                                                    : "bg-secondary text-darktext hover:bg-secondary/70"
                                                            }`}
                                                        >
                                                            {item.isBlocked ? <FiUnlock /> : <FiLock />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ================= PROVIDER INSPECTION MODAL ================= */}
            {selectedProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-secondary shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 relative">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedProvider(null)}
                            className="absolute right-5 top-5 text-darktext/50 hover:text-darktext text-lg cursor-pointer"
                        >
                            <FiX />
                        </button>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-secondary/60 border border-secondary overflow-hidden flex items-center justify-center text-2xl font-bold text-darktext/60 shrink-0">
                                {selectedProvider.providerProfile?.logo ? (
                                    <img
                                        src={selectedProvider.providerProfile.logo}
                                        alt="Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    selectedProvider.providerProfile?.businessName?.[0] || "P"
                                )}
                            </div>
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primaryaccent/15 text-primaryaccent text-xs font-semibold capitalize mb-1">
                                    {selectedProvider.providerProfile?.providerType?.replace("_", " ") || "Artisan"}
                                </span>
                                <h2 className="text-2xl font-bold text-darktext">
                                    {selectedProvider.providerProfile?.businessName}
                                </h2>
                                <p className="text-xs text-darktext/60">
                                    Artisan Owner: {selectedProvider.firstName} {selectedProvider.lastName} ({selectedProvider.email})
                                </p>
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="space-y-4 text-xs text-darktext/80 bg-primary/40 p-5 rounded-2xl border border-secondary mb-6">
                            <div>
                                <strong className="text-darktext block mb-1">Craft Specialization:</strong>
                                <p className="text-secondaryaccent font-semibold">
                                    {selectedProvider.providerProfile?.specialization}
                                </p>
                            </div>

                            <div>
                                <strong className="text-darktext block mb-1">Artisan / Studio Story:</strong>
                                <p className="leading-relaxed text-darktext/70 whitespace-pre-line">
                                    {selectedProvider.providerProfile?.businessDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-secondary">
                                <div>
                                    <strong className="text-darktext block mb-1">Workshop Location:</strong>
                                    <p>
                                        {selectedProvider.providerProfile?.businessAddress}
                                        <br />
                                        {selectedProvider.providerProfile?.city},{" "}
                                        {selectedProvider.providerProfile?.district}
                                        <br />
                                        {selectedProvider.providerProfile?.province} -{" "}
                                        {selectedProvider.providerProfile?.postalCode}
                                    </p>
                                </div>
                                <div>
                                    <strong className="text-darktext block mb-1">Contact & Verification:</strong>
                                    <p>Phone: {selectedProvider.providerProfile?.businessPhone}</p>
                                    {selectedProvider.providerProfile?.businessRegNumber && (
                                        <p>BR Number: {selectedProvider.providerProfile.businessRegNumber}</p>
                                    )}
                                    {selectedProvider.providerProfile?.portfolioUrl && (
                                        <a
                                            href={selectedProvider.providerProfile.portfolioUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primaryaccent inline-flex items-center gap-1 hover:underline mt-1"
                                        >
                                            View Portfolio Link <FiExternalLink />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rejection notice if exists */}
                        {selectedProvider.providerProfile?.rejectionReason && (
                            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                                <strong>Previous Rejection Feedback:</strong>{" "}
                                {selectedProvider.providerProfile.rejectionReason}
                            </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-secondary">
                            <button
                                onClick={() => setSelectedProvider(null)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-secondary text-darktext font-medium text-xs hover:bg-secondary cursor-pointer"
                            >
                                Close
                            </button>

                            {selectedProvider.accountStatus !== "approved" && (
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleApproveProvider(selectedProvider._id)}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm cursor-pointer disabled:opacity-60"
                                >
                                    Approve Provider
                                </button>
                            )}

                            {selectedProvider.accountStatus !== "rejected" && (
                                <button
                                    onClick={() => setRejectionModalVisible(true)}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition shadow-sm cursor-pointer"
                                >
                                    Reject / Request Changes
                                </button>
                            )}

                            {selectedProvider.accountStatus === "approved" && (
                                <button
                                    onClick={() =>
                                        handleToggleSuspend(
                                            selectedProvider._id,
                                            selectedProvider.accountStatus
                                        )
                                    }
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition shadow-sm cursor-pointer"
                                >
                                    Suspend Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= REJECTION FEEDBACK MODAL ================= */}
            {rejectionModalVisible && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-secondary shadow-2xl max-w-md w-full p-6 text-darktext">
                        <h3 className="text-lg font-bold mb-2">Reject Provider Application</h3>
                        <p className="text-xs text-darktext/60 mb-4">
                            Please provide detailed feedback for the artisan explaining why their application was rejected or what modifications are requested.
                        </p>

                        <textarea
                            rows="4"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason or requested corrections..."
                            className="w-full p-3 rounded-xl border border-secondary bg-primary text-xs outline-none focus:ring-2 focus:ring-primaryaccent resize-none mb-4"
                        ></textarea>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejectionModalVisible(false)}
                                className="px-4 py-2 rounded-lg border border-secondary text-xs font-semibold hover:bg-secondary cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={actionLoading}
                                onClick={handleRejectProvider}
                                className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm cursor-pointer disabled:opacity-60"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

