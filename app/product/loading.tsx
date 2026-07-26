export default function ProductLoading() {
  return (
    <div className="bg-white min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          {/* Left Column: Image Skeleton */}
          <div className="w-full">
            <div className="aspect-square w-full rounded-2xl bg-gray-200"></div>
            <div className="grid grid-cols-5 gap-3 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Right Column: Detail Skeleton */}
          <div className="mt-10 lg:mt-0 space-y-6">
            <div className="space-y-3 border-b border-gray-200 pb-6">
              <div className="h-10 w-3/4 bg-gray-300 rounded-lg"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>

            <div className="space-y-4 border-b border-gray-200 pb-6">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-36 bg-gray-300 rounded-lg"></div>
              <div className="h-16 w-full bg-gray-100 rounded-xl mt-4"></div>
            </div>

            <div className="space-y-3">
              <div className="h-6 w-36 bg-gray-200 rounded"></div>
              <div className="h-64 w-full bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
