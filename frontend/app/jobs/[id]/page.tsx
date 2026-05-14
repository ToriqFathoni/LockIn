import { FreelanceHubShell } from "@/components/freelance-hub/site-shell";
import { JobDetailPage } from "@/components/freelance-hub/pages";
import { mockJobs } from "@/components/freelance-hub/data";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = mockJobs.find((item) => item.id === Number(id)) ?? null;

  return (
    <FreelanceHubShell>
      <JobDetailPage job={job} />
    </FreelanceHubShell>
  );
}