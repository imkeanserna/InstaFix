import { DiaglogCamera } from "@/components/camera/diaglogCamera";
import { ChatBotAi } from "@/components/chatbot/chat";
import { PostsPageLoading } from "@/components/posts/find/postsCard";
import { PostsPage } from "@/components/posts/find/postsPage";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<PostsPageLoading />}>
      <PostsPage />
      <ChatBotAi />
      <DiaglogCamera />
    </Suspense>
  )
}

export default Page;
