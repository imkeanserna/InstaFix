"use client";

import { draftPost } from "@/lib/postUtils";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from 'next/navigation';

export default function DraftButton() {
  const router = useRouter();
  const handleDraftPost = async () => {
    try {
      const post = await draftPost();
      console.log("CLIIIIIIIIIIIIIIIENTTTTT POST")
      console.log(post);
      if (!post || !post.id) {
        console.error('Error creating post:', post);
        return;
      }
      router.push(`cm5ffyz7q0003gw0vwtr1mhef/about-your-service`);
    } catch (error) {
      console.error('Error in handleDraftPost:', error);
    }
  }
  return (
    <Button onClick={() => handleDraftPost()}>Get Started</Button>
  )
}
