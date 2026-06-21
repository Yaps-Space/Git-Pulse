export function ConnectRepoSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3.5 bg-gray-100 rounded animate-pulse w-48" />
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-72" />
              <div className="flex gap-3">
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-12" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-12" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-20" />
              </div>
            </div>
          </div>
          <div className="w-28 h-9 bg-gray-100 rounded-md animate-pulse ml-4 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}