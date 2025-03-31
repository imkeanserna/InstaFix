import { PostContent, PostContentSkeleton } from "@/components/posts/post/postContent";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const runtime = 'edge'

const Page = ({ params }: { params: { postId: string, username: string, title: string } }) => {
  if (!params.postId) return notFound();
  if (!params.username) return notFound();
  if (!params.title) return notFound();

  return (
    <Suspense fallback={<PostContentSkeleton />}>
      <div className="pt-4 md:pt-8">
        <PostContent postId={params.postId} username={params.username} />
      </div>
    </Suspense>
  )
}

export default Page;
