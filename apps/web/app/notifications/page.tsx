import { Notifications, NotificationsSkeleton } from "@/components/posts/notification/notifications";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <div className="bg-gray-100 p-0 md:px-8 lg:px-[500px] min-h-screen pb-20">
        <Notifications />
      </div>
    </Suspense>
  )
}

export default Page;
