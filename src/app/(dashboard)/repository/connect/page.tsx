import { PageShell } from "@/shared/components/commons/PageShell"
import { ConnectRepoPage } from "@/features/repository/connect/components/ConnectRepoPage"

export default function ConnectPage() {
  return (
    <PageShell title="Repository" detail="Connect Repository">
      <ConnectRepoPage />
    </PageShell>
  )
}