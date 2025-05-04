import { ServicePost, ServicePostSkeleton } from "@/components/dashboard/service/post";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const runtime = 'edge';

const Page = ({ params }: { params: { postId: string } }) => {
  if (!params.postId) return redirect('/dashboard/all-posts');

  return (
    <Suspense fallback={<ServicePostSkeleton />}>
      <ServicePost postId={params.postId} />
    </Suspense>
  )
}

export default Page;
