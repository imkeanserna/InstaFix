import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { DashboardSkeleton } from "./dashboard";
import { SubscriptionPageSkeleton } from "./subscription";

export function NavbarSkeleton() {
  return (
    <header className="w-full">
      <div className="mx-4 sm:mx-8 flex h-14 items-center py-16 border-b border-b-gray-300">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <div className="w-8 h-8">
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-60" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function PostsLayoutSkeleton() {
  return (
    <div>
      <NavbarSkeleton />
      <div className="min-h-screen py-6">
        <DashboardSkeleton />
      </div>
    </div>
  );
}

export function SubscriptionLayoutSkeleton() {
  return (
    <div>
      <NavbarSkeleton />
      <div className="min-h-screen py-6">
        <SubscriptionPageSkeleton />
      </div>
    </div>
  )
}
