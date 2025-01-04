"use client";

import { usePathname } from 'next/navigation';
import { draftPost } from "@/lib/postUtils";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { usePostUpdate, useRouteValidation } from '@/hooks/posts/useRouteValidation';
import { FormDataType, useFormData } from '@/context/FormDataProvider';
import { UPDATE_HANDLERS, UpdatePostData } from '@/app/api/_action/posts/getPosts';

const steps = [
  'become-a-freelancer',
  'about-your-service',
  'categories',
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
  const router = useRouter();
  const pathname = usePathname();
  const { updatePostData, isUpdating } = usePostUpdate();
  const { formData } = useFormData();
  const isOverviewPage = pathname?.includes('overview');
  const postId = pathname?.split('/')[2];
  const currentStep = pathname.split('/').pop() || '';
  const { isValid } = useRouteValidation(currentStep);
  const isButtonEnabled = currentStep === 'about-your-service' ? true : isValid;

  const handleNext = async () => {
    if ((!isButtonEnabled || !postId)) return;

    const currentStepIndex = steps.indexOf(currentStep);
    const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

    const updateMapping: Record<string, {
      type: keyof typeof UPDATE_HANDLERS;
      getData: (formData: Partial<FormDataType>) => UpdatePostData[keyof UpdatePostData];
    }> = {
      'categories': {
        type: 'tags',
        getData: (formData) => ({
          tags: [{ subcategoryId: formData.tags?.subcategoryId! }]
        })
      },
      'title': {
        type: 'basicInfo',
        getData: (formData) => formData.basicInfo!
      },
      'location': {
        type: 'location',
        getData: (formData) => formData.location!
      },
      'price': {
        type: 'pricing',
        getData: (formData) => formData.pricing!
      },
      'photos': {
        type: 'media',
        getData: (formData) => ({
          media: formData.media || []
        })
      },
      'service-engagement': {
        type: 'serviceEngagement',
        getData: (formData) => ({
          serviceEngagement: formData.serviceEngagement || []
        })
      }
    };

    const updateConfig = updateMapping[currentStep];
    if (updateConfig) {
      const success = await updatePostData(
        updateConfig.type,
        updateConfig.getData(formData),
        postId
      );

      if (success && nextStep) {
        router.push(`/become-a-freelancer/${postId}/${nextStep}`);
      }
    } else if (nextStep) {
      // If no update is needed for this step, just navigate
      router.push(`/become-a-freelancer/${postId}/${nextStep}`);
    }
  };

  if (isOverviewPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="flex justify-end p-4 max-w-7xl mx-auto">
          <DraftButton />
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.indexOf(currentStep || '');
  // Skip 'become-a-freelancer' in navigation when we have a postId
  const prevStep = currentStepIndex > 1
    ? steps[currentStepIndex - 1]
    : currentStepIndex === 1
      ? 'become-a-freelancer'
      : null;

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
        <Button
          onClick={handleNext}
          disabled={!isButtonEnabled || isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
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
