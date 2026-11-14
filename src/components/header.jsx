import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { FiUser, FiLogOut, FiLayout, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { loadCart } from "../utils/cart";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const cart = loadCart();
    const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    function handleLogout() {
        setDropdownOpen(false);
        logout();
        navigate("/");
    }

    return (
        <header className="w-full h-[88px] bg-primaryaccent text-lighttext px-6 md:px-12 sticky top-0 z-40 shadow-md">
            <div className="w-full h-full flex items-center justify-between relative">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
                    <img
                        src="/logownameOriginal3.png"
                        alt="Lumora Logo"
                        className="h-12 w-auto object-contain"
                    />
                </Link>

                {/* Main Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
                    <Link to="/" className="hover:text-secondary transition-colors">
                        Home
                    </Link>
                    <Link to="/products" className="hover:text-secondary transition-colors">
                        Shop All
                    </Link>
                    <Link to="/products?mainCategory=Handicrafts" className="hover:text-secondary transition-colors">
                        Handicrafts
                    </Link>
                    <Link to="/products?mainCategory=Fine Arts" className="hover:text-secondary transition-colors">
                        Fine Arts
                    </Link>
                    <Link to="/about" className="hover:text-secondary transition-colors">
                        About
                    </Link>
                    <Link to="/contact" className="hover:text-secondary transition-colors">
                        Contact
                    </Link>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Cart Icon */}
                    <Link
                        to="/cart"
                        className="relative p-2 text-2xl hover:text-secondary transition-colors flex items-center justify-center cursor-pointer"
                        title="Shopping Cart"
                    >
                        <IoCartOutline />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-secondaryaccent text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User Auth Dropdown */}
                    {isAuthenticated && user ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition cursor-pointer text-xs font-semibold"
                            >
                                <div className="w-6 h-6 rounded-full bg-secondary text-darktext flex items-center justify-center font-bold text-xs shrink-0">
                                    {user.firstName?.[0] || "U"}
                                </div>
                                <span className="hidden sm:inline max-w-[100px] truncate">
                                    {user.firstName}
                                </span>
                                <FiChevronDown />
                            </button>

                            {dropdownOpen && (
                                <div
                                    onMouseLeave={() => setDropdownOpen(false)}
                                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-darktext shadow-2xl border border-secondary p-2 z-50 animate-fadeIn"
                                >
                                    <div className="px-3 py-2 border-b border-secondary/50">
                                        <p className="text-xs font-bold truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-[11px] text-darktext/50 truncate">
                                            {user.email}
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primaryaccent/10 text-primaryaccent text-[10px] font-bold uppercase tracking-wider">
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="py-1">
                                        {user.role === "admin" && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-primary transition text-primaryaccent font-semibold"
                                            >
                                                <FiLayout /> Admin Dashboard
                                            </Link>
                                        )}

                                        {user.role === "provider" && (
                                            <Link
                                                to="/provider"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-primary transition text-secondaryaccent font-semibold"
                                            >
                                                <FiLayout /> Provider Portal
                                            </Link>
                                        )}

                                        <Link
                                            to="/account"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-primary transition text-darktext"
                                        >
                                            <FiUser /> My Account & Orders
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-secondary/50">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        >
                                            <FiLogOut /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-xl bg-white text-primaryaccent font-semibold text-xs hover:bg-secondary transition shadow-sm"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
