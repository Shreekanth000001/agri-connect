'use client';
import { useState } from 'react';

export default function ContactPage() {
    const [isPending, setIsPending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            // Talk to our new backend route
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Something went wrong.");
            } else {
                // Success!
                alert("Thanks for reaching out! We'll get back to you soon.");
                setFormData({ name: '', email: '', message: '' }); // Clear the form
            }
        } catch (error) {
            console.error(error);
            alert("Network error. Please check your connection.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-[85vh] py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Get in Touch
                    </h1>
                    <p className="mt-4 text-lg text-gray-500">
                        Have a question about the platform? Need help with an auction? We&apos;d love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Left Side: Contact Information */}
                    <div className="bg-[#009C25] px-8 py-12 text-white sm:px-12">
                        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                        <p className="text-green-100 mb-8 max-w-sm">
                            Fill out the form and our team will get back to you within 24 hours.
                        </p>

                        <div className="space-y-6">
                            {/* Phone */}
                            <div className="flex items-center gap-4">
                                <svg className="h-6 w-6 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-lg font-medium">+91 1800-AGRI-CONN</span>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4">
                                <svg className="h-6 w-6 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-lg font-medium">support@agri-connect.com</span>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-4">
                                <svg className="h-6 w-6 text-green-200 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-lg font-medium leading-relaxed">
                                    Agri-Connect HQ<br />
                                    Bengaluru, Karnataka<br />
                                    India
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="px-8 py-12 sm:px-12 flex items-center">
                        <form onSubmit={handleSubmit} className="w-full space-y-6">
                            
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700">Message</label>
                                <textarea
                                    id="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#009C25] focus:outline-none focus:ring-1 focus:ring-[#009C25] sm:text-sm resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full rounded-md bg-[#009C25] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}