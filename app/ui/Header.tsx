'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the page from refreshing
        
        if (searchQuery.trim()) {
            // Redirects to a search results page with the query in the URL
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="relative top-0 w-full bg-white border-b border-gray-100 p-2.5 px-4 flex items-center justify-between gap-4 shadow-sm z-50">
            
            {/* LEFT SIDE: Menu + Branding */}
            <div className="flex items-center gap-4">
                {/* Hamburger Menu */}
                <button className="HAMBURGER-ICON space-y-2 focus:outline-none">
                    <span className="block h-0.5 w-8 bg-gray-600"></span>
                    <span className="block h-0.5 w-8 bg-gray-600"></span>
                    <span className="block h-0.5 w-8 bg-gray-600"></span>
                </button>

                {/* Logo & Brand Name */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    {/* Using standard img tag for simplicity, you can swap to next/image if preferred */}
                    <img 
                        src="/agri-conn-logo.png" 
                        alt="Agri-Connect Logo" 
                        className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                    />
                    <span className="font-bold text-xl text-[#009C25] hidden sm:block tracking-tight">
                        Agri-Connect
                    </span>
                </Link>
            </div>

            {/* RIGHT SIDE: Search Bar */}
            <div className="ml-auto w-full max-w-sm sm:max-w-md">
                {/* Wrapping in a form enables the "Enter" key to submit */}
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                    
                    {/* Search Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute w-5 h-5 top-2.5 left-2.5 text-slate-400">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>

                    {/* Input Field */}
                    <input 
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-[#009C25] hover:border-slate-300 shadow-sm focus:shadow"
                        placeholder="Search for Tomatoes, Apples..."
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!searchQuery.trim()} // Disable if empty
                        className="rounded-md bg-[#009C25] py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                    >
                        Search
                    </button>
                </form>
            </div>
        </header>
    );
}