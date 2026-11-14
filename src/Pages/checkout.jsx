import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { clearCart, loadCart } from "../utils/cart";
import {
    FiCheckCircle,
    FiShield,
    FiTruck,
    FiMapPin,
    FiCreditCard,
    FiDollarSign,
    FiArrowLeft,
    FiLock
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

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cart, setCart] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(null);

    // Shipping Address Form State
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("Colombo");
    const [province, setProvince] = useState("Western");
    const [postalCode, setPostalCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
    const [notes, setNotes] = useState("");

    // Initialize Cart
    useEffect(() => {
        const passedCart = location.state?.cart || loadCart();
        if (!passedCart || passedCart.length === 0) {
            navigate("/cart");
        } else {
            setCart(passedCart);
        }
    }, [location.state, navigate]);

    // Populate user defaults if available
    useEffect(() => {
        if (user) {
            setFullName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
            setPhone(user.phone || "");

            const defaultAddr = user.deliveryAddresses?.find((a) => a.isDefault) || user.deliveryAddresses?.[0];
            if (defaultAddr) {
                setFullName(defaultAddr.fullName || `${user.firstName} ${user.lastName}`);
                setPhone(defaultAddr.phone || user.phone || "");
                setAddressLine1(defaultAddr.addressLine1 || "");
                setAddressLine2(defaultAddr.addressLine2 || "");
                setCity(defaultAddr.city || "");
                setDistrict(defaultAddr.district || "Colombo");
                setProvince(defaultAddr.province || "Western");
                setPostalCode(defaultAddr.postalCode || "");
            }
        }
    }, [user]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isFreeShipping = subtotal >= 25000;
    const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : 450) : 0;
    const total = subtotal + shippingFee;

    async function handlePlaceOrder(e) {
        e.preventDefault();

        if (!user) {
            toast.error("Please sign in before placing your order.");
            navigate("/login");
            return;
        }

        if (!fullName || !phone || !addressLine1 || !city || !district) {
            toast.error("Please provide all required delivery details.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const orderPayload = {
                items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                shippingAddress: {
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    addressLine1: addressLine1.trim(),
                    addressLine2: addressLine2.trim(),
                    city: city.trim(),
                    district,
                    province,
                    postalCode: postalCode.trim() || "00000",
                    country: "Sri Lanka"
                },
                paymentMethod,
                notes: notes.trim()
            };

            const res = await axios.post(`${API_BASE_URL}/api/orders`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            clearCart();
            setOrderCompleted(res.data.order);
            toast.success("Order placed successfully!");
        } catch (err) {
            console.error("Order placement error:", err);
            toast.error(err.response?.data?.message || "Failed to complete order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Success Screen
    if (orderCompleted) {
        return (
            <div className="w-full min-h-[80vh] bg-primary flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl w-full bg-lighttext rounded-3xl p-6 sm:p-10 border border-secondary shadow-lg text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
                        <FiCheckCircle />
                    </div>

                    <div>
                        <span className="text-[11px] font-bold tracking-widest text-secondaryaccent uppercase">
                            Order Confirmed
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-darktext mt-1">
                            Thank you for supporting Sri Lankan artisans!
                        </h1>
                        <p className="text-xs sm:text-sm text-darktext/70 mt-2 max-w-md mx-auto">
                            Your order has been recorded in our system. A confirmation notification has been sent to your account.
                        </p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-secondary/40 border border-secondary text-left space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-darktext/60">Order Reference:</span>
                            <span className="font-mono font-bold text-darktext">{orderCompleted.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-darktext/60">Payment Method:</span>
                            <span className="font-bold text-darktext capitalize">
                                {orderCompleted.paymentMethod?.replace(/_/g, " ")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-darktext/60">Total Amount:</span>
                            <span className="font-extrabold text-primaryaccent">
                                LKR {orderCompleted.total?.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-darktext/60">Delivery Address:</span>
                            <span className="font-medium text-darktext truncate max-w-xs text-right">
                                {orderCompleted.shippingAddress?.addressLine1}, {orderCompleted.shippingAddress?.city}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link
                            to="/products"
                            className="flex-1 py-3.5 rounded-2xl bg-primaryaccent text-lighttext font-semibold text-xs hover:bg-[#b86a55] transition text-center shadow-md"
                        >
                            Explore More Creations
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-primary pb-20">
            {/* Header Banner */}
            <div className="bg-[#242424] text-lighttext py-8 px-4 sm:px-6 lg:px-8 border-b border-secondary/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h1>
                        <p className="text-xs text-lighttext/60 mt-0.5">
                            Secure Sri Lankan Handcraft & Fine Art Purchase
                        </p>
                    </div>
                    <Link
                        to="/cart"
                        className="text-xs text-primaryaccent hover:underline flex items-center gap-1 font-semibold"
                    >
                        <FiArrowLeft /> Back to Cart
                    </Link>
                </div>
            </div>

            {/* Main Checkout Form Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <form onSubmit={handlePlaceOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Customer Info, Shipping Address, Payment Method (7-8 cols) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Step 1: Delivery Address */}
                            <div className="p-6 rounded-3xl bg-secondary/35 border border-secondary/70 shadow-xs space-y-5">
                                <h2 className="text-sm font-bold text-darktext uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-secondary">
                                    <FiMapPin className="text-primaryaccent" /> 1. Sri Lankan Delivery Address
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            Recipient Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="e.g. Kasun Silva"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            Mobile Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+94 77 123 4567"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="font-semibold text-darktext block mb-1">
                                            Address Line 1 (Street Address) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressLine1}
                                            onChange={(e) => setAddressLine1(e.target.value)}
                                            placeholder="e.g. No. 45/2, Temple Road"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="font-semibold text-darktext block mb-1">
                                            Address Line 2 (Apartment, Suite, Unit - Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={addressLine2}
                                            onChange={(e) => setAddressLine2(e.target.value)}
                                            placeholder="e.g. Floor 2, Apt 4"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            City / Town *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g. Kandy / Colombo"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            District *
                                        </label>
                                        <select
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent cursor-pointer"
                                        >
                                            {SRI_LANKAN_DISTRICTS.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            Province *
                                        </label>
                                        <select
                                            value={province}
                                            onChange={(e) => setProvince(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent cursor-pointer"
                                        >
                                            {SRI_LANKAN_PROVINCES.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-darktext block mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder="e.g. 00300"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Payment Method */}
                            <div className="p-6 rounded-3xl bg-secondary/35 border border-secondary/70 shadow-xs space-y-4">
                                <h2 className="text-sm font-bold text-darktext uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-secondary">
                                    <FiDollarSign className="text-primaryaccent" /> 2. Payment Method
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <label
                                        className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                                            paymentMethod === "cash_on_delivery"
                                                ? "border-primaryaccent bg-primaryaccent/10 text-darktext font-bold"
                                                : "border-secondary bg-white text-darktext/70 hover:bg-secondary/20"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">Cash on Delivery</span>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="cash_on_delivery"
                                                checked={paymentMethod === "cash_on_delivery"}
                                                onChange={() => setPaymentMethod("cash_on_delivery")}
                                                className="text-primaryaccent"
                                            />
                                        </div>
                                        <p className="text-[11px] font-normal text-darktext/60">
                                            Pay in cash upon arrival across Sri Lanka.
                                        </p>
                                    </label>

                                    <label
                                        className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                                            paymentMethod === "bank_transfer"
                                                ? "border-primaryaccent bg-primaryaccent/10 text-darktext font-bold"
                                                : "border-secondary bg-white text-darktext/70 hover:bg-secondary/20"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">Bank Transfer</span>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="bank_transfer"
                                                checked={paymentMethod === "bank_transfer"}
                                                onChange={() => setPaymentMethod("bank_transfer")}
                                                className="text-primaryaccent"
                                            />
                                        </div>
                                        <p className="text-[11px] font-normal text-darktext/60">
                                            Commercial Bank / BOC transfer instructions provided.
                                        </p>
                                    </label>

                                    <label
                                        className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                                            paymentMethod === "card"
                                                ? "border-primaryaccent bg-primaryaccent/10 text-darktext font-bold"
                                                : "border-secondary bg-white text-darktext/70 hover:bg-secondary/20"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">Card Payment</span>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="card"
                                                checked={paymentMethod === "card"}
                                                onChange={() => setPaymentMethod("card")}
                                                className="text-primaryaccent"
                                            />
                                        </div>
                                        <p className="text-[11px] font-normal text-darktext/60">
                                            Visa, Mastercard, & Sri Lankan debit cards.
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {/* Delivery Instructions / Notes */}
                            <div className="p-5 rounded-2xl bg-secondary/35 border border-secondary/70">
                                <label className="text-xs font-bold text-darktext block mb-1">
                                    Special Delivery Notes / Instructions (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Call before delivery, leave with security gate..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-secondary text-xs text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                />
                            </div>
                        </div>

                        {/* Right: Order Summary Sidebar (4-5 cols) */}
                        <div className="lg:col-span-4">
                            <div className="rounded-3xl bg-secondary/50 border border-secondary/80 p-6 shadow-sm sticky top-6 space-y-6">
                                <h2 className="text-base font-bold text-darktext uppercase tracking-wider pb-3 border-b border-secondary">
                                    Order Summary ({cart.length} item{cart.length > 1 ? "s" : ""})
                                </h2>

                                {/* Items mini list */}
                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                    {cart.map((item) => (
                                        <div key={item.productId} className="flex items-center gap-3 text-xs">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-lg object-cover bg-secondary shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-darktext truncate">{item.name}</h4>
                                                <p className="text-[11px] text-darktext/60">
                                                    Qty: {item.quantity} × LKR {item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="font-bold text-darktext">
                                                LKR {(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-2.5 text-xs pt-3 border-t border-secondary">
                                    <div className="flex justify-between text-darktext/70">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-darktext">
                                            LKR {subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-darktext/70">
                                        <span>Shipping</span>
                                        <span className="font-bold text-darktext">
                                            {shippingFee === 0 ? "FREE" : `LKR ${shippingFee}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-extrabold text-darktext pt-3 border-t border-secondary">
                                        <span>Total</span>
                                        <span className="text-primaryaccent">
                                            LKR {total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-2xl bg-primaryaccent text-lighttext font-bold text-xs uppercase tracking-wider hover:bg-[#b86a55] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <FiLock /> {isSubmitting ? "Processing Order..." : "Confirm & Place Order"}
                                </button>

                                <div className="pt-2 text-center text-[11px] text-darktext/50 flex items-center justify-center gap-1.5">
                                    <FiShield className="text-secondaryaccent" />
                                    <span>Encrypted & Protected Transaction</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
