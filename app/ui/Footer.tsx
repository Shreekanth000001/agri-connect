"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
    const pathname = usePathname();

    // Hide footer entirely on auth pages
    if (pathname === '/auth/login' || pathname === '/auth/signup') {
        return null; 
    }

    return (
        <footer className="bg-[#009C25] mt-auto">
            <div className="mx-auto w-full max-w-7xl p-4 py-8 lg:py-10">
                <div className="md:flex md:justify-between">
                    
                    {/* Brand & Logo Section */}
                    <div className="mb-8 md:mb-0">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            {/* Replaced Flowbite with your Agri-Connect logo */}
                            <img 
                                src="/agri-conn-logo.png" 
                                className="h-10 w-10 object-contain bg-white rounded-full p-1 shadow-sm" 
                                alt="Agri-Connect Logo" 
                                // Note: If your file is named agri-conn-logo.png like in the header, just update the src!
                            />
                            <span className="text-white self-center text-2xl font-extrabold tracking-tight whitespace-nowrap">
                                Agri-Connect
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-green-100">
                            Empowering farmers and buyers with a transparent, direct, and fair agricultural marketplace.
                        </p>
                    </div>

                    {/* Links Section */}
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Resources</h2>
                            <ul className="text-green-100 font-medium space-y-3">
                                <li>
                                    <Link href="/" className="hover:text-white transition-colors">Marketplace</Link>
                                </li>
                                <li>
                                    <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Follow us</h2>
                            <ul className="text-green-100 font-medium space-y-3">
                                <li>
                                    <a href="https://github.com/Shreekanth000001" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Github</a>
                                </li>
                                <li>
                                    <a href="https://discord.gg/4eeurUVvTy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Legal</h2>
                            <ul className="text-green-100 font-medium space-y-3">
                                <li>
                                    <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-green-500 sm:mx-auto lg:my-8" />
                
                {/* Copyright & Social Icons */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-green-100 sm:text-center">
                        © 2026 <Link href="/" className="hover:text-white font-semibold transition-colors">Agri-Connect™</Link>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0 space-x-5">
                        <a href="#" className="text-green-200 hover:text-white transition-colors">
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z" clipRule="evenodd" /></svg>
                            <span className="sr-only">Facebook page</span>
                        </a>
                        <a href="#" className="text-green-200 hover:text-white transition-colors">
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M18.942 5.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.586 11.586 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3 17.392 17.392 0 0 0-2.868 11.662 15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.638 10.638 0 0 1-1.706-.83c.143-.106.283-.217.418-.331a11.664 11.664 0 0 0 10.118 0c.137.114.277.225.418.331-.544.328-1.116.606-1.71.832a12.58 12.58 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM8.678 14.813a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.929 1.929 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" /></svg>
                            <span className="sr-only">Discord community</span>
                        </a>
                        <a href="https://github.com/Shreekanth000001" target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-white transition-colors">
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clipRule="evenodd" /></svg>
                            <span className="sr-only">GitHub account</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}