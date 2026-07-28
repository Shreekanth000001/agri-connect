import { getUserSession, getAccessToken } from '@/lib/session';
import { logout } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/apiClient';

export default async function ProfilePage() {
  const session = await getUserSession();
  if (!session?.uid) {
    redirect('/auth/login');
  }

  const token = await getAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch actual user details from FastAPI backend
  const apiRes = await apiClient.get<Record<string, unknown>>('/users/me', headers);
  const dbUser = (apiRes.data?.user || apiRes.data) as Record<string, unknown> | undefined;

  const actualName = String(dbUser?.name || dbUser?.uname || dbUser?.full_name || session.uname || 'Agri User');
  const actualEmail = String(dbUser?.email || dbUser?.uemail || session.uemail || `user${session.uid}@agriconnect.com`);
  const actualPhone = String(dbUser?.phone || dbUser?.uphone || dbUser?.uphno || 'Not set');
  const actualLoc = String(dbUser?.location || dbUser?.uloc || session.uloc || 'India');
  const actualRole = String(dbUser?.role || session.role || (actualName.toLowerCase().includes('farmer') ? 'FARMER' : 'BUYER'));

  const user = {
    uid: session.uid,
    uname: actualName,
    uemail: actualEmail,
    uphno: actualPhone,
    uloc: actualLoc,
    role: actualRole,
    ujoinedAt: new Date(),
  };

  const joinedDate = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(user.ujoinedAt);

  async function handleLogout() {
    'use server';
    await logout();
  }

  return (
    <div className="bg-gray-50 min-h-[85vh] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Account Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your personal information and settings.</p>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#009C25] to-green-400"></div>
          <div className="px-6 sm:px-8 pb-8 flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12">
            <div className="relative h-24 w-24 rounded-full ring-4 ring-white bg-white overflow-hidden shrink-0">
              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-[#009C25]">
                {user.uname.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.uname}</h2>
              <p className="text-sm text-gray-500">{user.uemail}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-2xs text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </Link>

              <form action={handleLogout}>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-2xs text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 sm:px-8 py-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Role</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    {user.role}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location / GPS Coordinates</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.uloc}</dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.uphno}</dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">{joinedDate}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}