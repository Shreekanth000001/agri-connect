'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Unavailable</h2>
        <p className="text-sm text-gray-600 mb-6">
          {error.message || 'Failed to load dashboard data. Please check your connection or session.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#009C25] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Retry Dashboard
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
