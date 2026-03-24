'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditForm({ initialPhone, initialLoc }: { initialPhone: string, initialLoc: string }) {
    // State is initialized with the data we fetched from the Server Component
    const [phone, setPhone] = useState(initialPhone);
    const [loc, setLoc] = useState(initialLoc);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            // Talk to our custom API route
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uphone: phone, uloc: loc })
            });

            const data = await res.json();

            if (data.success) {
                alert("Profile updated successfully!");
                router.push('/profile'); // Send them back to their profile
                router.refresh(); // Force Next.js to fetch the new data
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Failed to connect to the server.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 sm:p-8">
            <div className="space-y-6">
                
                {/* Phone Input */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Phone Number</label>
                    <div className="mt-2">
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>

                {/* Location Input */}
                <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700">Registered Address / Location</label>
                    <div className="mt-2">
                        <textarea
                            id="location"
                            rows={3}
                            value={loc}
                            onChange={(e) => setLoc(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm resize-none"
                            placeholder="123 Farm Road, District..."
                        />
                    </div>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end gap-x-4">
                <Link 
                    href="/profile" 
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-[#009C25] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}