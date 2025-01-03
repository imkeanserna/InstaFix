"use client";

import { usePathname } from 'next/navigation';
import { draftPost } from "@/lib/postUtils";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const steps = [
  'become-a-freelancer',
  'about-your-service',
  'categories',
  'sub-categories',
  'privacy-type',
  'location',
  'service-description',
  'special-features',
  'photos',
  'title',
  'description',
  'finish-setup',
  'instant-book',
  'price',
  'payment-methods',
  'publish-celebration',
];

export default function Footer() {
  const pathname = usePathname();
  const isOverviewPage = pathname?.includes('overview');
  const postId = pathname?.split('/')[2];

  if (isOverviewPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="flex justify-end p-4 max-w-7xl mx-auto">
          <DraftButton />
        </div>
      </div>
    );
  }

  const currentStep = pathname?.split('/').pop();
  const currentStepIndex = steps.indexOf(currentStep || '');
  // Skip 'become-a-freelancer' in navigation when we have a postId
  const prevStep = currentStepIndex > 1
    ? steps[currentStepIndex - 1]
    : currentStepIndex === 1
      ? 'become-a-freelancer'
      : null;
  const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="flex justify-between p-4 max-w-7xl mx-auto">
        {prevStep && (
          <Link
            href={prevStep === 'become-a-freelancer'
              ? '/become-a-freelancer'
              : `/become-a-freelancer/${postId}/${prevStep}`
            }
          >
            <Button variant="ghost">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        )}
        {nextStep && (
          <Link href={`/become-a-freelancer/${postId}/${nextStep}`}>
            <Button>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function DraftButton() {
  const router = useRouter();
  const handleDraftPost = async () => {
    try {
      const post = await draftPost();
      if (!post || !post.id) {
        console.error('Error creating post:', post);
        return;
      }
      router.push(`${post.id}/about-your-service`);
    } catch (error) {
      console.error('Error in handleDraftPost:', error);
    }
  }
  return (
    <Button onClick={handleDraftPost}>Get Started</Button>
  )
}
