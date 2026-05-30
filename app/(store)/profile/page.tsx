"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <AuthGuard>
            <main className="min-h-screen bg-[#F5F9FF] px-4 py-16">
                <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-4xl">
                            👤
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-[#19398A]">
                                {user?.name}
                            </h1>

                            <p className="mt-2 text-gray-500">
                                {user?.phone}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10">
                        <button
                            onClick={logout}
                            className="rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}