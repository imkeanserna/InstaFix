import { BookPage, BookPageSkeleton } from "@/components/book/bookPage";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const Page = async ({ params }: { params: { postId: string, username: string } }) => {
  if (!params.postId) return notFound();
  if (!params.username) return notFound();

  return (
    <Suspense fallback={<BookPageSkeleton />}>
      <BookPage postId={params.postId} />
    </Suspense>
  )
}

export default Page;
