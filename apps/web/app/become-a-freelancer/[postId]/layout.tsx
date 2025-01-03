import { getPostById } from "@/app/api/_action/posts/getPosts";
import { currentUser } from "@/lib";
import { notFound } from "next/navigation";

export const runtime = "edge";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    postId: string;
  };
}

export default async function RootLayout({
  children,
  params
}: LayoutProps) {
  const user = await currentUser();
  const post = await getPostById(user?.id!, params.postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex-1 p-4">
      {children}
    </div>
  );
}
