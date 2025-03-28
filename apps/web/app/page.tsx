import { ChatBotAi } from "@/components/chatbot/chat";
import HomeContent from "@/components/home/homeContent";

const Home = () => {
  return (
    <div className="bg-background">
      <HomeContent />
      <ChatBotAi />
    </div>
  );
}

export default Home;
