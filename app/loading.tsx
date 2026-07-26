export default function Loading() {
  return (
    <div className="grow min-h-[80vh] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-6 w-36 bg-gray-200 rounded-md"></div>
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] w-full bg-gray-200"></div>
              <div className="p-5 flex flex-col flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-7 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-12 w-full bg-gray-100 rounded-xl mt-2"></div>
                <div className="mt-auto pt-4 h-10 w-full bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
