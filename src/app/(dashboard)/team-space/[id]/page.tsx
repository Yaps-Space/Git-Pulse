import TeamSpaceDetailView from "@/features/team-space/components/TeamSpaceDetailView"

export default async function TeamSpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TeamSpaceDetailView id={id} />
}