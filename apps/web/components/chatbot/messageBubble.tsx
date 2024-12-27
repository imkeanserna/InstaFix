"use client";

import { DotTypingLoading } from '@repo/ui/components/ui/dot-typing-loading';
import { motion } from 'framer-motion';

export type Message = {
  id: number;
  role: 'user' | 'bot';
  content: string;
};

export const MessageBubble = ({ message, isTyping = false }: { message: Message; isTyping?: boolean }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1]
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <motion.div
        layout
        className={`max-w-[80%] ${isTyping ? "py-3 px-6" : "p-3"} rounded-2xl border ${isUser
          ? 'bg-violet-800 text-white ml-auto rounded-br-sm border-violet-600'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm border-gray-200'
          }`}
      >
        {isTyping ? (
          <DotTypingLoading />
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
      </motion.div>
    </motion.div>
  );
};
