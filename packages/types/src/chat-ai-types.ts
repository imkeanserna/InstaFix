import { Message, Post, MessagePost, Freelancer, PostTag, Category } from "@prisma/client/edge"

export type MessagePostWithPost = MessagePost & {
  post: Post & {
    freelancer: Freelancer;
    tags: (PostTag & {
      subcategory: {
        category: Category;
      };
    })[];
  };
};

export type MessagesWithPosts = Message & {
  messagePosts: MessagePostWithPost[];
};
