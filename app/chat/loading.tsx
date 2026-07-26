export default function ChatLoading() {
  return (
    <div className="grow min-h-[85vh] bg-gray-100 flex flex-col">
      <div className="max-w-7xl w-full mx-auto my-0 md:my-6 flex-1 flex bg-white border border-gray-200 shadow-xl rounded-none md:rounded-2xl overflow-hidden min-h-[75vh] animate-pulse">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 p-4 space-y-4 shrink-0 hidden md:block">
          <div className="h-8 w-40 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
          <div className="space-y-3 pt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2">
                <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Chat Skeleton */}
        <div className="flex-1 flex flex-col bg-gray-50/60 min-w-0">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-xl hidden sm:block"></div>
          </div>

          <div className="flex-1 p-6 space-y-4">
            <div className="h-14 w-2/3 bg-gray-200 rounded-2xl"></div>
            <div className="h-14 w-1/2 bg-[#009C25]/20 rounded-2xl ml-auto"></div>
            <div className="h-20 w-3/4 bg-gray-200 rounded-2xl"></div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200 flex space-x-2">
            <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
            <div className="h-10 w-10 bg-[#009C25] rounded-xl shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
