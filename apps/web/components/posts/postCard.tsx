"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { motion } from 'framer-motion';
import { PostWithRelations } from "@/app/api/_action/posts/getPosts";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export const PostCard = ({ post }: { post: PostWithRelations }) => {
  const router = useRouter();
  const handleClick = useCallback(() => {
    router.push(`/find/${post.user.name}/${post.title}/${post.id}`);
  }, [post, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={handleClick}
        className="w-auto overflow-hidden bg-white/95 backdrop-blur 
        hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/90 transition-all duration-300 rounded-r-2xl
        cursor-pointer active:scale-[0.98] border-l-4 border-l-gray-900 hover:border-l-gray-950"
      >
        <CardContent className="rounded-2xl flex gap-4 px-3 py-2 relative">
          <Image
            src={post.coverPhoto!}
            alt={`Message attachment from ${post.user.name}`}
            width={150}
            height={150}
            className="rounded-2xl h-24 w-24 object-cover"
          />
          <div>
            <p className="font-bold">{post.title}</p>
            <p className="text-xs text-gray-500">{post.tags[0].subcategory.category.name}</p>
            <div className="flex items-start gap-2 mt-2">
              <Avatar className={`h-10 w-10 border-transparent border border-gray-500 transition-all`}>
                <AvatarImage
                  src={post.user.image || "https://github.com/shadcn.png"}
                  alt={post.user.name || "User Profile"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-neutral-700 text-neutral-300 group-hover:bg-amber-900/30 transition-all">
                  {post.user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500 font-medium">{post.user.name}</p>
                <p className="text-xs text-gray-400 font-medium">Joined {formatDistanceToNow(new Date(post.user.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
