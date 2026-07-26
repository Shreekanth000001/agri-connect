export default function DashboardLoading() {
  return (
    <div className="grow min-h-[80vh] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-64 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-5 w-40 bg-gray-200 rounded-md"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Table Content Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
