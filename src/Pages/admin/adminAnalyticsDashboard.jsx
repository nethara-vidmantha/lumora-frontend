import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { Loader } from "../../components/loader";
import {
    FiDollarSign,
    FiShoppingBag,
    FiUsers,
    FiPackage,
    FiTrendingUp,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiRefreshCw
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PALETTE = ["#C97B63", "#8A9A84", "#D9A05B", "#638B9B", "#9B638A", "#639B7E"];

export default function AdminAnalyticsDashboard() {
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [categoryShare, setCategoryShare] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [inventoryHealth, setInventoryHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchDashboardData() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [ovRes, trRes, catRes, topRes, invRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/analytics/overview`, { headers }),
                axios.get(`${API_BASE_URL}/api/analytics/sales-trends`, { headers }),
                axios.get(`${API_BASE_URL}/api/analytics/category-performance`, { headers }),
                axios.get(`${API_BASE_URL}/api/analytics/top-products`, { headers }),
                axios.get(`${API_BASE_URL}/api/analytics/inventory-health`, { headers })
            ]);

            if (ovRes.data.kpis) setOverview(ovRes.data.kpis);
            if (trRes.data.trends) setTrends(trRes.data.trends);
            if (catRes.data.mainCategoryShare) setCategoryShare(catRes.data.mainCategoryShare);
            if (topRes.data.topProducts) setTopProducts(topRes.data.topProducts);
            if (invRes.data) setInventoryHealth(invRes.data);
        } catch (err) {
            console.error("Failed to load analytics dashboard:", err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    // Process order status data for Donut Chart
    const orderStatusData = overview?.orderStatusBreakdown
        ? Object.keys(overview.orderStatusBreakdown).map((status) => ({
              name: status.charAt(0).toUpperCase() + status.slice(1),
              value: overview.orderStatusBreakdown[status]
          }))
        : [];

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primaryaccent">
                        Marketplace Intelligence
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-darktext tracking-tight mt-0.5">
                        Performance & Revenue Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-darktext/60 mt-1">
                        Real-time metrics aggregated directly from live orders, artisan submissions, and inventory.
                    </p>
                </div>

                <button
                    onClick={fetchDashboardData}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-secondary text-xs font-bold text-darktext hover:bg-secondary/40 transition shadow-xs cursor-pointer"
                >
                    <FiRefreshCw /> Refresh Data
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Revenue */}
                <div className="p-5 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-darktext/60">
                        <span className="text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</span>
                        <div className="w-9 h-9 rounded-xl bg-primaryaccent/15 text-primaryaccent flex items-center justify-center text-lg">
                            <FiDollarSign />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-primaryaccent">
                        LKR {overview?.totalRevenue?.toLocaleString() || "0"}
                    </div>
                    <p className="text-[11px] text-darktext/50">
                        Average Order: <strong>LKR {overview?.avgOrderValue?.toLocaleString() || "0"}</strong>
                    </p>
                </div>

                {/* Total Orders */}
                <div className="p-5 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-darktext/60">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                        <div className="w-9 h-9 rounded-xl bg-secondaryaccent/20 text-secondaryaccent flex items-center justify-center text-lg">
                            <FiShoppingBag />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-darktext">
                        {overview?.totalOrders || 0}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <FiCheckCircle /> Live transactions logged
                    </p>
                </div>

                {/* Live Products vs Pending */}
                <div className="p-5 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-darktext/60">
                        <span className="text-xs font-bold uppercase tracking-wider">Curated Catalog</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-lg">
                            <FiPackage />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-darktext">
                        {overview?.activeProducts || 0}
                    </div>
                    <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                        <FiClock /> {overview?.pendingReviewProducts || 0} pending verification
                    </p>
                </div>

                {/* Artisans & Customers */}
                <div className="p-5 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-darktext/60">
                        <span className="text-xs font-bold uppercase tracking-wider">Verified Artisans</span>
                        <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center text-lg">
                            <FiUsers />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-darktext">
                        {overview?.approvedProviderCount || 0}
                    </div>
                    <p className="text-[11px] text-darktext/50">
                        Customers: <strong>{overview?.customerCount || 0}</strong>
                    </p>
                </div>
            </div>

            {/* Sales Trend Area Chart (Past 30 Days) */}
            <div className="p-6 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-darktext">Sales Revenue Trend (LKR)</h2>
                        <p className="text-xs text-darktext/50">Chronological daily sales performance</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-primaryaccent">
                        <FiTrendingUp /> 30-Day Window
                    </div>
                </div>

                <div className="w-full h-72">
                    {trends.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-darktext/40">
                            No orders placed within the last 30 days yet.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C97B63" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#C97B63" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D8" vertical={false} />
                                <XAxis dataKey="date" stroke="#8A9A84" fontSize={11} />
                                <YAxis stroke="#8A9A84" fontSize={11} tickFormatter={(val) => `LKR ${val}`} />
                                <Tooltip
                                    formatter={(val) => [`LKR ${Number(val).toLocaleString()}`, "Revenue"]}
                                    contentStyle={{
                                        backgroundColor: "#2F2F2F",
                                        color: "#FAFAFA",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        border: "none"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#C97B63"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#revenueGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 2-Column Analytics: Category Revenue Share & Order Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Category Share Donut (6 cols) */}
                <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-4">
                    <h2 className="text-base font-bold text-darktext">Category Revenue Share</h2>
                    <p className="text-xs text-darktext/50">Handicrafts vs Fine Arts sales contribution</p>

                    <div className="w-full h-64">
                        {categoryShare.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-darktext/40">
                                No sales recorded by category yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryShare}
                                        dataKey="revenue"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                    >
                                        {categoryShare.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={PALETTE[index % PALETTE.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val) => [`LKR ${Number(val).toLocaleString()}`, "Revenue"]}
                                        contentStyle={{
                                            backgroundColor: "#2F2F2F",
                                            color: "#FAFAFA",
                                            borderRadius: "12px",
                                            fontSize: "12px"
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Order Status Breakdown Bar Chart (6 cols) */}
                <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-4">
                    <h2 className="text-base font-bold text-darktext">Order Fulfillment Status</h2>
                    <p className="text-xs text-darktext/50">Volume breakdown by delivery stage</p>

                    <div className="w-full h-64">
                        {orderStatusData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-darktext/40">
                                No order fulfillment data available.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={orderStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D8" vertical={false} />
                                    <XAxis dataKey="name" stroke="#8A9A84" fontSize={11} />
                                    <YAxis stroke="#8A9A84" fontSize={11} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#2F2F2F",
                                            color: "#FAFAFA",
                                            borderRadius: "12px",
                                            fontSize: "12px"
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#8A9A84" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory Health & Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inventory Health Card (4 cols) */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-5">
                    <h2 className="text-base font-bold text-darktext">Inventory Health</h2>
                    <p className="text-xs text-darktext/50">Catalog stock depletion monitor</p>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-emerald-600 text-base" />
                                <span className="font-bold">Healthy Stock (&gt;3 units)</span>
                            </div>
                            <span className="font-extrabold text-sm">{inventoryHealth?.healthyStock || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
                            <div className="flex items-center gap-2">
                                <FiAlertTriangle className="text-amber-600 text-base" />
                                <span className="font-bold">Low Stock (1–3 units)</span>
                            </div>
                            <span className="font-extrabold text-sm">{inventoryHealth?.lowStock || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900">
                            <div className="flex items-center gap-2">
                                <FiAlertTriangle className="text-rose-600 text-base" />
                                <span className="font-bold">Out of Stock (0 units)</span>
                            </div>
                            <span className="font-extrabold text-sm">{inventoryHealth?.outOfStock || 0}</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-secondary text-[11px] text-darktext/60 flex justify-between">
                        <span>Total Units in Warehouses:</span>
                        <strong className="text-darktext">
                            {inventoryHealth?.totalActiveStockUnits?.toLocaleString() || 0}
                        </strong>
                    </div>
                </div>

                {/* Top Selling Products Table (8 cols) */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-secondary/70 shadow-xs space-y-4">
                    <h2 className="text-base font-bold text-darktext">Top-Selling Creations</h2>
                    <p className="text-xs text-darktext/50">Best performing handicrafts and fine art pieces</p>

                    {topProducts.length === 0 ? (
                        <div className="py-12 text-center text-xs text-darktext/40">
                            No product sales recorded yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-secondary/70 text-darktext/50 uppercase tracking-wider text-[10px]">
                                        <th className="py-2.5 font-bold">Creation</th>
                                        <th className="py-2.5 font-bold">SKU</th>
                                        <th className="py-2.5 font-bold">Unit Price</th>
                                        <th className="py-2.5 font-bold">Units Sold</th>
                                        <th className="py-2.5 font-bold text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/40">
                                    {topProducts.map((p) => (
                                        <tr key={p._id} className="hover:bg-secondary/20">
                                            <td className="py-3 flex items-center gap-2.5">
                                                <img
                                                    src={p.image}
                                                    alt={p.name}
                                                    className="w-8 h-8 rounded-lg object-cover bg-secondary shrink-0"
                                                />
                                                <span className="font-semibold text-darktext truncate max-w-[180px]">
                                                    {p.name}
                                                </span>
                                            </td>
                                            <td className="py-3 font-mono text-darktext/60">{p._id}</td>
                                            <td className="py-3">LKR {p.price?.toLocaleString()}</td>
                                            <td className="py-3 font-bold text-darktext">{p.unitsSold}</td>
                                            <td className="py-3 font-extrabold text-primaryaccent text-right">
                                                LKR {p.totalRevenue?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

