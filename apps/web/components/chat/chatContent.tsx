"use client";

import { Suspense } from "react";
import { Conversations } from "./conversations";
import { Messages } from "./messages";
import { useRecoilValue } from "recoil";
import { selectedConversationState } from "@repo/store";

export function ChatContent() {
  const selectedConversationId = useRecoilValue(selectedConversationState);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-full">
        {/* This would be your conversation list component */}
        <div className="w-[540px] border-r">
          <Conversations />
        </div>

        {/* This is the dynamic part that changes based on the URL */}
        <div className="w-2/3">
          {selectedConversationId !== null
            ?
            <Messages conversationId={selectedConversationId} />
            :
            <div>No Conversation Selected</div>
          }
        </div>
      </div>
    </Suspense>
  );
}
