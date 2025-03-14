-- CreateTable
CREATE TABLE "MessagePost" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessagePost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessagePost_messageId_postId_key" ON "MessagePost"("messageId", "postId");

-- AddForeignKey
ALTER TABLE "MessagePost" ADD CONSTRAINT "MessagePost_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePost" ADD CONSTRAINT "MessagePost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
