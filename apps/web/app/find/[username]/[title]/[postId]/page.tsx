import { PostContent, PostContentSkeleton } from "@/components/posts/post/postContent";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const Page = ({ params }: { params: { postId: string, username: string, title: string } }) => {
  if (!params.postId) return notFound();
  if (!params.username) return notFound();
  if (!params.title) return notFound();

  return (
    <Suspense fallback={<PostContentSkeleton />}>
      <PostContent postId={params.postId} username={params.username} />
    </Suspense>
  )
}

export default Page;
