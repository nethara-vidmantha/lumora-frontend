import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./loader";
import { FiClock, FiAlertCircle } from "react-icons/fi";

export default function ProtectedRoute({ children, allowedRoles, requireApproved = false }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-primary flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (user.role === "admin") {
            return <Navigate to="/admin" replace />;
        } else if (user.role === "provider") {
            return <Navigate to="/provider" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // Provider approval verification check
    if (requireApproved && user.role === "provider" && user.accountStatus !== "approved") {
        return (
            <div className="min-h-screen w-full bg-primary flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl border border-secondary shadow-lg p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primaryaccent/15 text-primaryaccent mx-auto flex items-center justify-center text-3xl mb-5">
                        {user.accountStatus === "pending" ? <FiClock /> : <FiAlertCircle />}
                    </div>
                    <h2 className="text-2xl font-bold text-darktext mb-2">
                        {user.accountStatus === "pending"
                            ? "Account Pending Verification"
                            : "Account Not Approved"}
                    </h2>
                    <p className="text-sm text-darktext/70 mb-6 leading-relaxed">
                        {user.accountStatus === "pending"
                            ? "Thank you for registering as a Lumora Product Provider! Your application is currently under review by our administrator team. Product submissions and marketplace features will become active once verified."
                            : "Your provider account application is currently not active. Please review administrator feedback in your profile settings or reach out to support."}
                    </p>
                    <Link
                        to="/provider"
                        className="inline-block px-6 py-3 rounded-xl bg-primaryaccent text-lighttext font-semibold text-sm hover:bg-[#b86a55] transition"
                    >
                        Back to Provider Portal
                    </Link>
                </div>
            </div>
        );
    }

    return children;
}

