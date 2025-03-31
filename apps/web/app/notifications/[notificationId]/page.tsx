import { NotificationContent, NotificationContentSkeleton } from "@/components/posts/notification/notificationContent";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const runtime = 'edge'

const Page = ({ params }: { params: { notificationId: string } }) => {
  if (!params.notificationId) return notFound();

  return (
    <Suspense fallback={<NotificationContentSkeleton />}>
      <NotificationContent notificationId={params.notificationId} />
    </Suspense>
  )
}

export default Page;
