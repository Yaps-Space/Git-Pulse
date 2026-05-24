import { RepoDetailLayout } from "@/features/repository/detail/components/RepoDetailLayout"

export default async function RepoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RepoDetailLayout id={id} />
}