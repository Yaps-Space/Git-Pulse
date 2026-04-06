export default function TeamSpaceLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="w-36 h-7 rounded-lg animate-pulse mb-2" style={{ background: "#F0F0F0" }}/>
          <div className="w-52 h-4 rounded animate-pulse"   style={{ background: "#F0F0F0" }}/>
        </div>
        <div className="flex gap-3">
          <div className="w-36 h-9 rounded-xl animate-pulse" style={{ background: "#F0F0F0" }}/>
          <div className="w-36 h-9 rounded-xl animate-pulse" style={{ background: "#F0F0F0" }}/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-48 h-6 rounded animate-pulse mb-2" style={{ background: "#F0F0F0" }}/>
            <div className="w-32 h-4 rounded animate-pulse mb-4" style={{ background: "#F0F0F0" }}/>
            <div className="flex gap-4">
              <div className="w-24 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
              <div className="w-32 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}