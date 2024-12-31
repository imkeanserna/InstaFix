"use client";

import { DotTypingLoading } from '@repo/ui/components/ui/dot-typing-loading';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Message, Role } from '@prisma/client/edge';
import { PostCard } from '../posts/postCard';
import { Button } from '@repo/ui/components/ui/button';
import { MessagePostWithPost } from '@repo/types';

export const MessageBubble = ({
  message,
  isTyping = false,
  messagePostsMap,
}: {
  message: Message | null;
  isTyping?: boolean;
  messagePostsMap?: Record<string, MessagePostWithPost[]>;
}) => {
  const isUser = message?.role === Role.USER;
  const POSTS_TO_SHOW = 3;
  const posts = message?.id && messagePostsMap ? messagePostsMap[message.id] || [] : [];
  const hasMorePosts = posts.length > POSTS_TO_SHOW;
  const limitedPosts = posts.slice(0, POSTS_TO_SHOW);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 relative group">
          {!isUser && (
            <div className="ps-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 to-violet-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200" />
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 flex items-center justify-center ring-1 ring-violet-500/50 shadow-sm">
                <div className="text-sm font-medium text-white/90 select-none">
                  AI
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Content */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={`
            relative rounded-2xl
            ${isTyping ? 'inline-block' : 'flex-1 max-w-[85%]'}
            ${isUser ?
              'bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg' :
              'bg-white border border-gray-200 text-gray-900 shadow-sm'
            }
            ${isTyping ? 'px-4 py-2' : 'px-6 py-4'}
          `}
        >
          {isTyping ? (
            <div className="flex gap-2 h-8 items-center">
              <DotTypingLoading />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[15px] leading-relaxed tracking-[-0.01em] whitespace-pre-wrap break-words font-normal">
                {message?.content}
              </p>
              <div className={`
                flex items-center gap-3 
                ${isUser ? 'text-gray-400' : 'text-gray-400'}
              `}>
                {message?.createdAt && (
                  <span className="text-xs font-medium">
                    {new Date(message.createdAt).getDate() === new Date().getDate()
                      ? format(new Date(message.createdAt), 'hh:mm a')
                      : formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
                    }
                  </span>
                )}
                {isTyping && <Clock className="w-3 h-3" />}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Linked Posts */}
      {posts.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.2
            }}
            className={`space-y-3 max-w-[85%] ${isUser ? 'ml-auto mr-12' : 'ml-12'}`}
          >
            {limitedPosts.map((messagePost, index) => (
              <motion.div
                key={messagePost.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1 + 0.3
                }}
              >
                <PostCard post={messagePost.post} />
              </motion.div>
            ))}

            {hasMorePosts && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.4 + (limitedPosts.length * 0.1)
                }}
                className="mt-2"
              >
                <Button
                  variant="ghost"
                  onClick={() => { }}
                  className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-3xl transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    View All {posts.length} Posts
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
