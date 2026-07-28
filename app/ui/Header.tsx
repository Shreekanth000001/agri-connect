'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/SessionProvider'; // Pulling in your existing session state!

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const router = useRouter();
    const pathname = usePathname();
    
    // Grab the logged-in user (will be null if they are completely logged out)
    const user = useUser(); 

    // Hide header entirely on auth pages
    if (pathname === '/auth/login' || pathname === '/auth/signup') {
        return null; 
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); 
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Hit our new logout route to destroy the cookie
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
            router.refresh(); // Force the app to clear the cached session state
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <header className="relative top-0 w-full bg-white border-b border-gray-100 p-2.5 px-4 flex items-center justify-between gap-4 shadow-sm z-50">
            
            {/* LEFT SIDE: Menu + Branding */}
            <div className="flex items-center gap-4">
                
                <div className="relative">
                    {/* Hamburger Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="HAMBURGER-ICON space-y-1.5 focus:outline-none p-1 rounded hover:bg-gray-50 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <span className={`block h-0.5 w-7 bg-gray-600 transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block h-0.5 w-7 bg-gray-600 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block h-0.5 w-7 bg-gray-600 transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute left-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
                            {/* ALWAYS VISIBLE */}
                            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                Home
                            </Link>

                            {/* LOGGED IN VIEW */}
                            {user?.uid ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link href="/productAuc" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-[#009C25] hover:bg-green-50 transition-colors">
                                        + New Auction
                                    </Link>
                                    <Link href="/chat" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        💬 Negotiations
                                    </Link>
                                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        Profile
                                    </Link>
                                    <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        About
                                    </Link>
                                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        Contact Us
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                /* LOGGED OUT VIEW */
                                <>
                                    <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        About
                                    </Link>
                                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#009C25] transition-colors">
                                        Contact Us
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-[#009C25] hover:bg-green-50 transition-colors">
                                        Log In
                                    </Link>
                                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Logo & Brand Name */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <img src="/agri-conn-logo.png" alt="Agri-Connect Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain"/>
                    <span className="font-bold text-xl text-[#009C25] hidden sm:block tracking-tight">Agri-Connect</span>
                </Link>
            </div>

            {/* RIGHT SIDE: Search Bar */}
            <div className="ml-auto w-full max-w-sm sm:max-w-md">
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute w-5 h-5 top-2.5 left-2.5 text-slate-400">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>

                    <input 
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-[#009C25] hover:border-slate-300 shadow-sm focus:shadow"
                        placeholder="Search for Tomatoes, Apples..."
                    />

                    <button
                        type="submit"
                        disabled={!searchQuery.trim()} 
                        className="rounded-md bg-[#009C25] py-2 px-4 border border-transparent text-center text-sm font-medium text-white transition-all shadow-md hover:shadow-lg hover:bg-green-700 focus:bg-green-700 active:bg-green-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                    >
                        Search
                    </button>
                </form>
            </div>
        </header>
    );
}