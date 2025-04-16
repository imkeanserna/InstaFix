import { Suspense } from "react";
import { ContentLayout } from "@repo/ui/components/admin-panel/content-layout";
import { DashboardPage } from "@/components/dashboard/dashboard";
import { PostsLayoutSkeleton } from "@/components/dashboard/navbarSkeleton";

export const runtime = 'edge'

const Page = () => {
  return (
    <Suspense fallback={<PostsLayoutSkeleton />}>
      <ContentLayout
        title="Dashboard"
        description="Create a new service to start earning. You can use a template, reuse past posts, or upload a brief to get started."
      >
        <DashboardPage />
      </ContentLayout>
    </Suspense>
  )
}

export default Page;
