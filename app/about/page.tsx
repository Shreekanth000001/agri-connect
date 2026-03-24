import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-gray-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Empowering Farmers, <br className="hidden sm:block" />
                        <span className="text-[#009C25]">Nourishing Communities.</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Agri-Connect is bridging the gap between the field and the dinner table. We eliminate the middlemen so farmers earn what they deserve, and consumers get the freshest produce possible.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                            Our Mission
                        </h2>
                        <p className="mt-4 text-lg text-gray-500">
                            For decades, the agricultural supply chain has been dominated by intermediaries who cut into farmers' profits and increase prices for buyers. We built Agri-Connect to change that.
                        </p>
                        <p className="mt-4 text-lg text-gray-500">
                            By leveraging an open auction system, we create a transparent, fair, and highly efficient marketplace. Whether you are a small-scale farmer looking for a wider audience, or a family looking for farm-fresh tomatoes, Agri-Connect is built for you.
                        </p>
                    </div>
                    <div className="mt-10 lg:mt-0 rounded-2xl overflow-hidden shadow-xl border border-gray-100 h-80 bg-green-50 relative">
                        {/* You can replace this placeholder with an actual image of a farm later */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-32 h-32 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.56c-.59-.52-1.36-.87-2.2-.87H15v-2c0-.55-.45-1-1-1h-2V9c0-.55-.45-1-1-1H9V5.48C9.96 5.17 10.96 5 12 5c3.87 0 7 3.13 7 7 0 2.02-.85 3.84-2.1 5.37z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Value Proposition Grid */}
            <div className="bg-gray-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base font-semibold text-[#009C25] tracking-wide uppercase">Why Choose Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A Better Way to Trade
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-green-100 text-[#009C25] mb-6">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Fair Pricing</h3>
                            <p className="text-gray-500">Our open bidding system ensures true market value. Farmers get better margins, and consumers pay less than retail.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-green-100 text-[#009C25] mb-6">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hyper-Local</h3>
                            <p className="text-gray-500">Find fresh produce right in your district. We use distance tracking to connect you with farms in your own backyard.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-green-100 text-[#009C25] mb-6">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent</h3>
                            <p className="text-gray-500">No hidden fees, no shady practices. You see exactly who you are buying from and exactly what the current bid is.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-[#009C25]">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to get started?</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-green-100">
                        Join thousands of farmers and buyers already trading on Agri-Connect.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link 
                            href="/auth/signup" 
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-[#009C25] bg-white hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Create an Account
                        </Link>
                        <Link 
                            href="/" 
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-white bg-green-800 hover:bg-green-900 transition-colors shadow-sm"
                        >
                            Browse Auctions
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}