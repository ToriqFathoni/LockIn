import { FreelanceHubShell } from "@/components/freelance-hub/site-shell";
import { ProfilePage } from "@/components/freelance-hub/pages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FreelanceHubShell>
      <ProfilePage freelancerId={id} />
    </FreelanceHubShell>
  );
}