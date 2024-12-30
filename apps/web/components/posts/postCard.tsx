"use client";

import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Calendar, ThumbsUp, MessageSquare, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { PostWithRelations } from "@/app/api/_action/posts/getPosts";
import { formatDistanceToNow } from "date-fns";

export const PostCard = ({ post }: { post: PostWithRelations }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full overflow-hidden bg-white/95 backdrop-blur border border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300">
        <div className="flex">
          {true && (
            <div className="w-28 h-28 flex-shrink-0">
              <img
                src={"https://ideogram.ai/assets/progressive-image/balanced/response/6gTAhKo9SfqEIahkNWmciA"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-[15px] text-gray-900 line-clamp-1 tracking-tight">
                  {post.title}
                </h3>
                <ExternalLink className="w-4 h-4 text-gray-400 hover:text-violet-500 transition-colors" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 font-medium">
                  by {post.freelancer?.name || "Anonymous"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(), { addSuffix: true })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {22}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {22}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                  {22}
                </button>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
