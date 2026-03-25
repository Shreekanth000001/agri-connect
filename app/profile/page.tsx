import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/session';
import { logout } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
    // 1. Secure the route
    const session = await getUserSession();
    if (!session?.uid) {
        redirect('/auth/login');
    }

    // 2. Fetch the complete user profile from the database
    const user = await prisma.user.findUnique({
        where: { uid: session.uid }
    });

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Profile not found. Please contact support.</p>
            </div>
        );
    }

    // Format the join date nicely (e.g., "March 2026")
    const joinedDate = new Intl.DateTimeFormat('en-IN', { 
        month: 'long', 
        year: 'numeric' 
    }).format(user.ujoinedAt);

    async function handleLogout() {
        "use server";
        await logout();
    }

    return (
        <div className="bg-gray-50 min-h-[85vh] py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Account Profile</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your personal information and settings.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    
                    {/* Top Banner & Avatar Section */}
                    <div className="h-32 bg-gradient-to-r from-[#009C25] to-green-400"></div>
                    <div className="px-6 sm:px-8 pb-8 flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12">
                        <div className="relative h-24 w-24 rounded-full ring-4 ring-white bg-white overflow-hidden flex-shrink-0">
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-[#009C25]">
                                {/* Show the first letter of their name as an avatar */}
                                {user.uname.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 truncate">{user.uname}</h2>
                            <p className="text-sm text-gray-500 font-medium">Joined {joinedDate}</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            {/* Role Badge */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase ${
                                user.role === 'FARMER' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {user.role} Account
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="border-t border-gray-100 px-6 py-8 sm:px-8">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-semibold text-gray-500">Email Address</dt>
                                <dd className="mt-1 text-base text-gray-900">{user.uemail}</dd>
                            </div>

                            <div className="sm:col-span-1">
                                <dt className="text-sm font-semibold text-gray-500">Phone Number</dt>
                                <dd className="mt-1 text-base text-gray-900">
                                    {user.uphone || <span className="text-gray-400 italic">Not provided</span>}
                                </dd>
                            </div>

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-semibold text-gray-500">Registered Address / Location</dt>
                                <dd className="mt-1 text-base text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                                    {user.ugeo || <span className="text-gray-400 italic">No address on file</span>}
                                </dd>
                            </div>

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-semibold text-gray-500">GPS Coordinates</dt>
                                <dd className="mt-1 text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                                    {user.uloc || <span className="text-gray-400 italic">N/A</span>}
                                </dd>
                            </div>

                        </dl>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between sm:px-8">
                        <form action={handleLogout}>
                        <button className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
                            Log Out
                        </button>
                        </form>
                        <Link 
                            href="/profile/edit" 
                            className="inline-flex items-center justify-center rounded-lg bg-[#009C25] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2"
                        >
                            Edit Profile
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}