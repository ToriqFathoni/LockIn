import { FreelanceHubShell } from "@/components/freelance-hub/site-shell";
import { MyJobsPage } from "@/components/freelance-hub/pages";

export default function Page() {
  return (
    <FreelanceHubShell>
      <MyJobsPage />
    </FreelanceHubShell>
  );
}