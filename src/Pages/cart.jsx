import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadCart, addToCart, GetTotal } from "../utils/cart";
import { FiTrash2, FiShoppingBag, FiArrowRight, FiShield, FiTruck, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setCart(loadCart());
        setIsLoaded(true);
    }, []);

    function handleQuantityChange(item, delta) {
        addToCart(item, delta);
        setCart(loadCart());
    }

    function handleRemoveItem(item) {
        addToCart(item, -item.quantity);
        setCart(loadCart());
        toast.success(`Removed "${item.name}" from your cart.`);
    }

    const subtotal = GetTotal();
    const isFreeShipping = subtotal >= 25000;
    const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : 450) : 0;
    const total = subtotal + shippingFee;

    if (!isLoaded) return null;

    if (cart.length === 0) {
        return (
            <div className="w-full min-h-[70vh] bg-primary flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary/60 flex items-center justify-center text-3xl text-darktext/40 mb-4">
                    <FiShoppingBag />
                </div>
                <h2 className="text-2xl font-bold text-darktext">Your Shopping Cart is Empty</h2>
                <p className="text-xs sm:text-sm text-darktext/60 max-w-sm mt-1 mb-8 leading-relaxed">
                    Explore our curated collection of Sri Lankan woodcrafts, traditional masks, brassware, and canvas fine art.
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primaryaccent text-lighttext font-semibold text-xs hover:bg-[#b86a55] transition shadow-md"
                >
                    <FiArrowLeft /> Browse Heritage Creations
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-primary pb-20">
            {/* Header */}
            <div className="bg-[#242424] text-lighttext py-8 px-4 sm:px-6 lg:px-8 border-b border-secondary/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Cart</h1>
                        <p className="text-xs text-lighttext/60 mt-0.5">
                            {cart.length} unique creation{cart.length > 1 ? "s" : ""} selected for purchase
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="text-xs text-primaryaccent hover:underline flex items-center gap-1 font-semibold"
                    >
                        <FiArrowLeft /> Continue Shopping
                    </Link>
                </div>
            </div>

            {/* Cart Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Cart Items List (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.productId}
                                className="p-4 sm:p-5 rounded-2xl bg-secondary/40 border border-secondary/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-secondary/50"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-secondary shrink-0 border border-secondary"
                                    />
                                    <div className="min-w-0">
                                        <span className="font-mono text-[10px] text-darktext/50 uppercase">
                                            {item.productId}
                                        </span>
                                        <h3 className="font-bold text-darktext text-sm sm:text-base truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs font-bold text-primaryaccent mt-1">
                                            LKR {item.price?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Quantity Control & Subtotal */}
                                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-secondary/40">
                                    <div className="flex items-center rounded-xl border border-secondary bg-white overflow-hidden shadow-xs">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(item, -1)}
                                            className="px-2.5 py-1 text-xs font-bold text-darktext/70 hover:bg-secondary cursor-pointer"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 text-xs font-bold text-darktext min-w-[28px] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(item, 1)}
                                            className="px-2.5 py-1 text-xs font-bold text-darktext/70 hover:bg-secondary cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="text-right min-w-[90px]">
                                        <span className="text-xs sm:text-sm font-extrabold text-darktext block">
                                            LKR {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(item)}
                                        title="Remove creation"
                                        className="text-darktext/40 hover:text-rose-500 transition text-base p-1 cursor-pointer"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Domestic Delivery Policy Notice */}
                        <div className="p-4 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center gap-3 text-xs text-darktext/70">
                            <FiTruck className="text-xl text-primaryaccent shrink-0" />
                            <div>
                                <span className="font-bold text-darktext block">
                                    {isFreeShipping ? "Free Nationwide Delivery Applied!" : "Nationwide Delivery"}
                                </span>
                                <span>
                                    {isFreeShipping
                                        ? "Your order qualifies for complimentary insured delivery across Sri Lanka."
                                        : `Add LKR ${(25000 - subtotal).toLocaleString()} more to qualify for Free Islandwide Delivery.`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary Sidebar (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="rounded-3xl bg-secondary/50 border border-secondary/80 p-6 shadow-sm sticky top-6 space-y-6">
                            <h2 className="text-base font-bold text-darktext uppercase tracking-wider pb-3 border-b border-secondary">
                                Order Summary
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between text-darktext/70">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-darktext">
                                        LKR {subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-darktext/70">
                                    <span>Estimated Shipping</span>
                                    <span className="font-bold text-darktext">
                                        {shippingFee === 0 ? "FREE" : `LKR ${shippingFee}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-extrabold text-darktext pt-3 border-t border-secondary">
                                    <span>Total (LKR)</span>
                                    <span className="text-primaryaccent">
                                        LKR {total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                state={{ cart }}
                                className="w-full py-4 rounded-2xl bg-primaryaccent text-lighttext font-bold text-xs uppercase tracking-wider hover:bg-[#b86a55] transition shadow-md flex items-center justify-center gap-2 text-center"
                            >
                                Proceed to Checkout <FiArrowRight />
                            </Link>

                            <div className="pt-4 border-t border-secondary/50 space-y-2 text-[11px] text-darktext/60">
                                <div className="flex items-center gap-2">
                                    <FiShield className="text-secondaryaccent shrink-0" />
                                    <span>Authenticity Guaranteed & Insured Transit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiTruck className="text-secondaryaccent shrink-0" />
                                    <span>Delivered within 3–5 working days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
