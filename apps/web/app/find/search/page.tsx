import { DiaglogCamera } from "@/components/camera/diaglogCamera";
import { ChatBotAi } from "@/components/chatbot/chat";
import { SearchLoading, SearchPage } from "@/components/posts/find/searchPage";
import { Suspense } from "react";

export const runtime = 'edge'

const Page = () => {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPage />
      <ChatBotAi />
      <DiaglogCamera />
    </Suspense>
  )
}

export default Page;
