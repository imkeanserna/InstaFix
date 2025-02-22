import { Notifications, NotificationsSkeleton } from "@/components/posts/notification/notifications";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <div className="bg-gray-100 px-[500px] min-h-screen">
        <Notifications />
      </div>
    </Suspense>
  )
}

export default Page;
