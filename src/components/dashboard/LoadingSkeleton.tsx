export function RepoTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#F0F0F0" }}>
        <div className="w-32 h-6 rounded-lg animate-pulse" style={{ background: "#F0F0F0" }}/>
        <div className="w-36 h-9 rounded-xl animate-pulse" style={{ background: "#F0F0F0" }}/>
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-t" style={{ borderColor: "#F0F0F0" }}>
          <div className="w-48 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
          <div className="w-20 h-4 rounded animate-pulse ml-8" style={{ background: "#F0F0F0" }}/>
          <div className="w-16 h-4 rounded animate-pulse ml-8" style={{ background: "#F0F0F0" }}/>
          <div className="w-8  h-8 rounded-lg animate-pulse ml-8" style={{ background: "#F0F0F0" }}/>
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: "#F0F0F0" }}/>
      <div className="flex flex-col gap-2">
        <div className="w-16 h-6 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
        <div className="w-28 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
      </div>
    </div>
  )
}