"use client"
import { FormEvent, useState } from 'react';
import { loginUser } from '@/lib/api/authService';

export default function LoginPage() {
    // 1. New states for handling errors and loading
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        setError(null);
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || '');
        const password = String(formData.get("password") || '');

        try {
            const apiRes = await loginUser({ email, password });

            if (apiRes.error || !apiRes.data) {
                setError(apiRes.error || "Invalid email or password.");
            } else {
                // Success! Force hard navigation to refresh all session cookies and state
                window.location.href = '/';
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Agri Connect"
                    src="/agri-conn-logo.png"
                    className="mx-auto h-12 w-auto object-contain"
                />
                <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight">Sign in to your account</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                
                {/* 🔴 ERROR MESSAGE BOX 🔴 */}
                {error && (
                    <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:border-[#009C25] focus:ring-1 focus:ring-[#009C25] sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium ">
                                Password
                            </label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-[#009C25] hover:text-green-700">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:border-[#009C25] focus:ring-1 focus:ring-[#009C25] sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-[#009C25] px-3 py-2 text-sm/6 font-bold text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#009C25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-gray-500">
                    Not a user?{' '}
                    <a href="/auth/signup" className="font-bold text-[#009C25] hover:text-green-700">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}