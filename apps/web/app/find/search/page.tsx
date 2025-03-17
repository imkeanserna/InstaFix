import { ChatBotAi } from "@/components/chatbot/chat";
import { SearchPage } from "@/components/posts/find/searchPage";

const Page = () => {
  return (
    <div>
      <SearchPage />
      <ChatBotAi />
    </div>
  )
}

export default Page;
