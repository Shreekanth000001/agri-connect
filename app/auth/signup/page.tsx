"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/app/auth/signup/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-100 w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">Loading Map...</div>
});

export default function RegisterPage() {
    const router = useRouter();
    const [loc, setLoc] = useState(''); // GPS Coordinates
    const [role, setRole] = useState<'FARMER' | 'BUYER'>('FARMER'); // Account Type State
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLocationSelect = (formattedLocation: string) => {
        setLoc(formattedLocation);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        
        // Combine the address fields for 'ugeo'
        const address = formData.get("address");
        const state = formData.get("state");
        const pincode = formData.get("pincode");
        const fullAddress = `${address}, ${state} - ${pincode}`;

        // Combine phone code and number for 'uphone'
        const cnum = formData.get("cnum");
        const ph = formData.get("ph");
        const fullPhone = `+${cnum} ${ph}`;

        try {
            const response = await fetch('/auth/signupauth', { // Make sure this path matches your route!
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uname: formData.get("name"),
                    uemail: formData.get("email"),
                    password: formData.get("password"),
                    uphone: fullPhone,
                    ugeo: fullAddress,
                    uloc: loc, // Map coordinates
                    role: role // From state
                })
            });
            console.log("hiii");
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Registration failed. Please try again.");
            } else {
                // Success! Send them straight into the app
                router.push('/');
                router.refresh(); // This forces the Header to re-render so it shows the Log Out button!
            }

        } catch (err) {
            console.error(err);
            setError("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='px-6 md:px-[20%] mt-6 pb-20'>
            
            {/* Error Message Box */}
            {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="text-3xl font-bold text-gray-900">Create Account</div>
                        <p className="mt-2 text-sm text-gray-600">
                            Join Agri-Connect to start trading directly.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            
                            {/* --- ROLE SELECTOR --- */}
                            <div className="col-span-full">
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-4">
                                    I want to register as a:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Farmer Option */}
                                    <div 
                                        onClick={() => setRole('FARMER')}
                                        className={`cursor-pointer rounded-xl border-2 p-5 flex flex-col items-center transition-all ${
                                            role === 'FARMER' ? 'border-[#009C25] bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${role === 'FARMER' ? 'bg-[#009C25] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <span className="font-bold text-gray-900 text-lg">Farmer</span>
                                        <span className="text-xs text-center text-gray-500 mt-1">I want to sell my crops.</span>
                                    </div>

                                    {/* Buyer Option */}
                                    <div 
                                        onClick={() => setRole('BUYER')}
                                        className={`cursor-pointer rounded-xl border-2 p-5 flex flex-col items-center transition-all ${
                                            role === 'BUYER' ? 'border-[#009C25] bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${role === 'BUYER' ? 'bg-[#009C25] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        </div>
                                        <span className="font-bold text-gray-900 text-lg">Consumer / Buyer</span>
                                        <span className="text-xs text-center text-gray-500 mt-1">I want to bid on fresh produce.</span>
                                    </div>
                                </div>
                            </div>

                            {/* --- BASIC DETAILS --- */}
                            <div className="col-span-full border-t border-gray-200 pt-8 mt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Details</h3>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">Your Name</label>
                                <div className="mt-2">
                                    <input id="name" name="name" type="text" required placeholder="Shubham Kumar" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Your Email</label>
                                <div className="mt-2">
                                    <input id="email" name="email" type="email" required placeholder="shubham@example.com" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
                                <div className="mt-2">
                                    <input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            {/* --- CONTACT & LOCATION --- */}
                            <div className="col-span-full border-t border-gray-200 pt-8 mt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact & Address</h3>
                            </div>

                            <div className="sm:col-span-1">
                                <label htmlFor="cnum" className="block text-sm/6 font-medium text-gray-900">Code</label>
                                <div className="mt-2">
                                    <input id="cnum" name="cnum" type="number" required placeholder="91" defaultValue="91" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="ph" className="block text-sm/6 font-medium text-gray-900">Phone Number</label>
                                <div className="mt-2">
                                    <input id="ph" name="ph" type="tel" required placeholder="9876543210" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="address" className="block text-sm/6 font-medium text-gray-900">Street Address</label>
                                <div className="mt-2">
                                    <textarea id="address" name="address" required rows={2} placeholder="123 Farm Road, District Village" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6 resize-none" />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="state" className="block text-sm/6 font-medium text-gray-900">State / Province</label>
                                <div className="mt-2">
                                    <input id="state" name="state" type="text" required placeholder="Karnataka" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="pincode" className="block text-sm/6 font-medium text-gray-900">Pincode</label>
                                <div className="mt-2">
                                    <input id="pincode" name="pincode" type="text" required placeholder="560001" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm/6" />
                                </div>
                            </div>

                            {/* --- MAP --- */}
                            <div className="flex flex-col col-span-full mt-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Pinpoint your Location
                                </label>
                                <p className="text-sm text-gray-500 mb-4">Click anywhere on the map to set your exact GPS coordinates.</p>

                                <div className="rounded-lg overflow-hidden border border-gray-300">
                                    <LocationPicker onLocationSelect={handleLocationSelect} />
                                </div>
                                {loc && <p className="mt-2 text-sm font-semibold text-[#009C25]">✓ Location captured successfully</p>}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex items-center justify-end gap-x-4">
                    <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-md bg-[#009C25] px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#009C25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Creating Account...' : 'Register Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}