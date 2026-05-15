import { FreelanceHubShell } from "@/components/freelance-hub/site-shell";
import { ManageApplicantsPage } from "@/components/freelance-hub/pages";
import { Suspense } from "react";

export default function Page() {
  return (
    <FreelanceHubShell>
      <Suspense fallback={<div>Loading...</div>}>
        <ManageApplicantsPage />
      </Suspense>
    </FreelanceHubShell>
  );
}
