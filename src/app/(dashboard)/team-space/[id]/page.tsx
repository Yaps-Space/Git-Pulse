import { TeamSpaceDetailLayout } from "@/features/team-space/components/TeamSpaceDetailLayout";

export default async function TeamSpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamSpaceDetailLayout id={id} />;
}