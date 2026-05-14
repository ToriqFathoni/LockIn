import { FreelanceHubShell } from "@/components/freelance-hub/site-shell";
import { ManageJobPage } from "@/components/freelance-hub/pages";

export default function Page() {
  return (
    <FreelanceHubShell>
      <ManageJobPage />
    </FreelanceHubShell>
  );
}