export default function RepoDetailLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: "#F0F0F0" }}/>
        <div className="flex flex-col gap-2">
          <div className="w-64 h-7 rounded-lg animate-pulse" style={{ background: "#F0F0F0" }}/>
          <div className="w-48 h-4 rounded animate-pulse"   style={{ background: "#F0F0F0" }}/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[1,2].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-40 h-6 rounded animate-pulse mb-6" style={{ background: "#F0F0F0" }}/>
            {[1,2,3,4].map(j => (
              <div key={j} className="flex justify-between py-3 border-b" style={{ borderColor: "#F0F0F0" }}>
                <div className="w-32 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
                <div className="w-20 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}