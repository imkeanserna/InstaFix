import { Conversations } from "@/components/chat/conversations";
import { Messages } from "@/components/chat/messages";
import { Suspense } from "react";

const Page = ({ params }: { params: { conversationId?: string[] } }) => {
  const selectedConversationId = params.conversationId?.[0];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-full">
        {/* This would be your conversation list component */}
        <div className="w-[540px] border-r">
          <Conversations />
        </div>

        {/* This is the dynamic part that changes based on the URL */}
        <div className="w-2/3">
          {selectedConversationId ? (
            <Messages conversationId={selectedConversationId} />
          ) : (
            <div>Select a conversation to start chatting</div>
          )}
        </div>
      </div>
    </Suspense>
  );
}

export default Page;
