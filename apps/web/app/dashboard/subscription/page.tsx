import { Suspense } from "react";
import { ContentLayout } from "@repo/ui/components/admin-panel/content-layout";
import { Subscription } from "@/components/dashboard/subscription";
import { SubscriptionLayoutSkeleton } from "@/components/dashboard/navbarSkeleton";

export const runtime = 'edge'

const Page = () => {
  return (
    <Suspense fallback={<SubscriptionLayoutSkeleton />}>
      <ContentLayout
        title="Subscription"
        description="Manage your Subscription and Billing."
      >
        <Subscription />
      </ContentLayout>
    </Suspense>
  )
}

export default Page;
