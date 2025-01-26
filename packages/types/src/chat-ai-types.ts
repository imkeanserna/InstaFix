import { Message, Post, MessagePost, User, PostTag, Category } from "@prisma/client/edge"

export type MessagePostWithPost = MessagePost & {
  post: Post & {
    user: User;
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
