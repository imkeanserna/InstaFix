import { DiaglogCamera } from "@/components/camera/diaglogCamera";
import { ChatBotAi } from "@/components/chatbot/chat";
import { PostsPage } from "@/components/posts/find/postsPage";

const Page = () => {
  return (
    <div className="dark:bg-background">
      {/* <DiaglogCamera /> */}
      <PostsPage />
      <ChatBotAi />
    </div>
  )
}

export default Page;
