'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { ChevronsDown, Send } from 'lucide-react'
import { BlueLoader } from '@repo/ui/components/ui/blueLoader'
import { DynamicInput } from '@repo/ui/components/ui/dynamic-input'
import { MessageBubble } from './messageBubble';
import { useChat } from '@/hooks/useChatAi';
import { Message } from '@prisma/client/edge';
import { LoadingSpinnerMore } from "@repo/ui/components/ui/loading-spinner-more";

export function ChatBotAi() {
  const {
    messages,
    messagePostsMap,
    input,
    isBotTyping,
    isLoadingMore,
    error,
    handleInputChange,
    handleSubmit,
    handleScroll,
    clearChat
  } = useChat();
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false);
  const toggleChat = () => setIsOpen(!isOpen)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const lastKnownScrollPosition = useRef<number | null>(null);
  const isLoadingRef = useRef(false);
  const hadNewMessagesRef = useRef(false);

  // Handle initial open scroll to bottom
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const viewportElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (viewportElement) {
        setTimeout(() => {
          viewportElement.scrollTop = viewportElement.scrollHeight;
        }, 100);
      }
    }
  }, [isOpen]);

  // Track loading state changes
  useEffect(() => {
    if (!isLoadingMore && isLoadingRef.current) {
      const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (scrollContainer && lastKnownScrollPosition.current !== null && hadNewMessagesRef.current) {
        requestAnimationFrame(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight;
            const heightDifference = newScrollHeight - scrollContainer.clientHeight;
            const newScrollPosition = Math.min(heightDifference, lastKnownScrollPosition.current as number);
            scrollContainer.scrollTop = newScrollPosition;
          }
        });
      }
      hadNewMessagesRef.current = false;
    }
    isLoadingRef.current = isLoadingMore;
  }, [isLoadingMore]);

  // Handle new messages at bottom
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      hadNewMessagesRef.current = true;
      if (!isLoadingMore) {
        const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoadingMore]);

  const handleScrollEvent = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    if (target.scrollTop === 0) {
      lastKnownScrollPosition.current = target.scrollHeight - target.clientHeight;
      handleScroll();
    }
  };

  return (
    <div className="fixed right-0 bottom-4 sm:right-4 z-50">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat"
            initial={{ y: 500, scale: 0.8 }}
            animate={{
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                duration: 0.5,
              },
            }}
            exit={{
              y: 900,
              scale: 0.8,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                duration: 0.7,
              },
            }}
          >
            <Card className="w-full h-[97vh] sm:w-[500px] sm:h-[90vh] flex flex-col rounded-3xl border border-gray-200">
              <CardHeader className="flex flex-row items-center p-4 rounded-t-3xl border-b border-gray-700 shadow-xl bg-gradient-to-b from-gray-900 to-gray-800">
                <div className="flex flex-row justify-start items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-violet-500 rounded-full blur-md opacity-50"></div>
                    <div className="bg-black rounded-full flex justify-center items-center p-1 shadow-xl">
                      <BlueLoader size={45} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-100">
                      <span className='text-yellow-400'>InstaFix </span>
                      AI Assistant
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto rounded-full text-gray-400 hover:text-gray-100 hover:bg-gray-700"
                  onClick={toggleChat}
                >
                  <ChevronsDown className="h-6 w-6 transition-transform duration-300 hover:translate-y-1" />
                </Button>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden ps-0 pe-0 py-2">
                <ScrollArea ref={scrollRef} className="h-full pr-4" onScrollCapture={handleScrollEvent}>
                  <motion.div layout className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {isLoadingMore && (
                        <div className="flex justify-center py-2">
                          <LoadingSpinnerMore />
                        </div>
                      )}
                      {messages.map((message: Message) => (
                        <MessageBubble key={message.id} message={message} messagePostsMap={messagePostsMap} />
                      ))}
                      {isBotTyping && (
                        <MessageBubble message={null} isTyping={true} />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t border-gray-700 shadow-xl bg-gradient-to-b from-gray-900 to-gray-800 rounded-b-3xl">
                <form onSubmit={handleSubmit} className="flex justify-between items-center w-full space-x-2">
                  <DynamicInput
                    value={input}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    placeholder="Describe your problem here..."
                    className="flex-grow p-3 rounded-xl bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              x: 400,
              scale: 0.8,
              transition: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
            transition={{ duration: 0.2 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              animate={{
                width: isHovered ? 450 : 80,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="bg-gradient-to-b from-gray-900 to-gray-800 hover:relative border border-gray-300 shadow-[0px_4px_15px_rgba(138,43,226,0.5)] rounded-full h-[80px] flex items-center justify-center cursor-pointer"
              onClick={toggleChat}
            >
              <div className="flex items-center text-primary-foreground">
                <div
                  className="bg-black hover:absolute rounded-full flex justify-center items-center p-1"
                  style={{
                    position: isHovered ? "absolute" : "static",
                    right: isHovered ? "auto" : "0",
                    left: isHovered ? "8px" : "auto",
                  }}
                >
                  <div className="absolute inset-0 bg-violet-500 rounded-full blur-md opacity-50"></div>
                  <BlueLoader size={60} />
                </div>
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    width: isHovered ? "auto" : 0,
                    marginLeft: isHovered ? 8 : 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                  }}
                  className="whitespace-nowrap text-sm text-gray-100 overflow-hidden flex"
                >
                  {isHovered &&
                    "How can we help you today?".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.15,
                          ease: "easeOut",
                        }}
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
