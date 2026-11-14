import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/loginPage";
import RegisterCustomerPage from "./Pages/RegisterCustomerPage";
import RegisterProviderPage from "./Pages/RegisterProviderPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import AdminPage from "./Pages/AdminPage";
import ProviderDashboard from "./Pages/provider/ProviderDashboard";
import TestPage from "./Pages/TestPage";
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="w-full min-h-screen bg-primary text-darktext flex flex-col">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#2F2F2F",
                                color: "#FAFAFA",
                                borderRadius: "12px",
                                border: "1px solid #EDE4D8",
                                fontSize: "14px"
                            }
                        }}
                    />

                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterCustomerPage />} />
                        <Route path="/register/provider" element={<RegisterProviderPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* Admin Portal (Protected: Admin only) */}
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Provider Portal (Protected: Provider only) */}
                        <Route
                            path="/provider/*"
                            element={
                                <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Test route */}
                        <Route path="/test" element={<TestPage />} />

                        {/* Public / Customer Storefront routes */}
                        <Route path="/*" element={<HomePage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
