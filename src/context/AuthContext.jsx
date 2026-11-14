import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    // Synchronize axios authorization header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Check token and load current user profile on app load
    useEffect(() => {
        async function loadUser() {
            const savedToken = localStorage.getItem("token");
            if (!savedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` }
                });

                if (response.data.success && response.data.user) {
                    setUser(response.data.user);
                    setToken(savedToken);
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Auth verification failed:", error);
                // Token invalid or expired
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        loadUser();
    }, []);

    // Login
    async function login(email, password) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const { token: receivedToken, user: receivedUser } = response.data;
                localStorage.setItem("token", receivedToken);
                setToken(receivedToken);
                setUser(receivedUser);
                axios.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
                return { success: true, user: receivedUser };
            } else {
                throw new Error(response.data.message || "Login failed");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Failed to log in";
            throw new Error(msg);
        }
    }

    // Register Customer
    async function registerCustomer(customerData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/register/customer`,
                customerData
            );

            if (response.data.success) {
                const { token: receivedToken, user: receivedUser } = response.data;
                localStorage.setItem("token", receivedToken);
                setToken(receivedToken);
                setUser(receivedUser);
                axios.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
                return { success: true, user: receivedUser };
            } else {
                throw new Error(response.data.message || "Registration failed");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Customer registration failed";
            throw new Error(msg);
        }
    }

    // Register Provider
    async function registerProvider(providerData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/register/provider`,
                providerData
            );

            if (response.data.success) {
                const { token: receivedToken, user: receivedUser } = response.data;
                localStorage.setItem("token", receivedToken);
                setToken(receivedToken);
                setUser(receivedUser);
                axios.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
                return { success: true, user: receivedUser, message: response.data.message };
            } else {
                throw new Error(response.data.message || "Provider registration failed");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Provider registration failed";
            throw new Error(msg);
        }
    }

    // Logout
    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        toast.success("You have been signed out.");
    }

    // Update Profile
    async function updateProfile(profileData) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/users/profile`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Failed to update profile";
            throw new Error(msg);
        }
    }

    // Refresh user state
    async function refreshUser() {
        if (!token) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error("Refresh user failed", error);
        }
    }

    const value = {
        user,
        token,
        role: user?.role || null,
        accountStatus: user?.accountStatus || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        registerCustomer,
        registerProvider,
        logout,
        updateProfile,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

