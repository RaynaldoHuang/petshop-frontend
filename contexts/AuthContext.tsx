/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL;

export type User = {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    role: "super_admin" | "admin" | null;
    is_active: boolean;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    isLoggedIn: boolean;

    login: (
        token: string,
        user: User
    ) => void;

    logout: () => Promise<void>;

    refreshUser: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextType | null>(
        null
    );

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    const [token, setToken] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    function getSavedToken() {
        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }

    function clearSavedToken() {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
    }

    async function getMe(
        savedToken: string
    ) {
        try {
            const res = await fetch(
                `${API}/me`,
                {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                        Accept:
                            "application/json",
                    },

                    cache: "no-store",
                }
            );

            if (!res.ok) {
                clearSavedToken();

                setUser(null);

                setToken(null);

                return;
            }

            const data = await res.json();

            setUser(data);

            setToken(savedToken);
        } catch {
            clearSavedToken();

            setUser(null);

            setToken(null);
        } finally {
            setLoading(false);
        }
    }

    async function refreshUser() {
        const savedToken =
            getSavedToken();

        if (!savedToken) return;

        await getMe(savedToken);
    }

    function login(
        newToken: string,
        newUser: User
    ) {
        localStorage.setItem(
            "token",
            newToken
        );

        setToken(newToken);

        setUser(newUser);

        window.dispatchEvent(
            new Event("auth-updated")
        );
    }

    async function logout() {
        try {
            const savedToken =
                getSavedToken();

            if (savedToken) {
                await fetch(
                    `${API}/logout`,
                    {
                        method: "POST",

                        headers: {
                            Authorization: `Bearer ${savedToken}`,

                            Accept:
                                "application/json",
                        },
                    }
                );
            }
        } catch { }

        clearSavedToken();

        setToken(null);

        setUser(null);

        window.dispatchEvent(
            new Event("auth-updated")
        );

        toast.success(
            "Berhasil logout dari akun"
        );
    }

    useEffect(() => {
        const savedToken =
            getSavedToken();

        if (!savedToken) {
            setLoading(false);
            return;
        }

        getMe(savedToken);
    }, []);

    useEffect(() => {
        function syncAuth() {
            const savedToken =
                getSavedToken();

            if (!savedToken) {
                setUser(null);

                setToken(null);

                return;
            }

            getMe(savedToken);
        }

        window.addEventListener(
            "auth-updated",
            syncAuth
        );

        window.addEventListener(
            "storage",
            syncAuth
        );

        return () => {
            window.removeEventListener(
                "auth-updated",
                syncAuth
            );

            window.removeEventListener(
                "storage",
                syncAuth
            );
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,

                isLoggedIn: !!user,

                login,

                logout,

                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
