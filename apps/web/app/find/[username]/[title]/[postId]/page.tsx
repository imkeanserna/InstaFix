import { PostContent, PostContentSkeleton } from "@/components/posts/post/postContent";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const Page = ({ params }: { params: { postId: string } }) => {
  if (!params.postId) return notFound();

  return (
    <Suspense fallback={<PostContentSkeleton />}>
      <PostContent postId={params.postId} />
    </Suspense>
  )
}

export default Page;
