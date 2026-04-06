import { StatCardSkeleton, RepoTableSkeleton } from "@/components/dashboard/LoadingSkeleton"

export default function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="w-48 h-7 rounded-lg animate-pulse mb-2" style={{ background: "#F0F0F0" }}/>
        <div className="w-64 h-4 rounded animate-pulse" style={{ background: "#F0F0F0" }}/>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCardSkeleton/>
        <StatCardSkeleton/>
        <StatCardSkeleton/>
      </div>
      <RepoTableSkeleton/>
    </div>
  )
}