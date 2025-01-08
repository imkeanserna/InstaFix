"use client";

import { useRecoilState } from 'recoil';
import { validationStateAtom } from '@repo/store';
import { useCallback, useState } from 'react';
import { updatePost } from '@/lib/postUtils';
import { UPDATE_HANDLERS } from '@/app/api/_action/posts/getPosts';

export const useRouteValidation = (currentStep: string) => {
  const [validationState, setValidationState] = useRecoilState(validationStateAtom);

  const validateStep = useCallback((step: string, data: any): boolean => {
    switch (step) {
      case 'categories':
        return Boolean(data.tags?.subcategoryId);
      case 'privacy-type':
        return Boolean(data.serviceEngagement?.length > 0);
      case 'location':
        const { address, serviceLocation } = data?.location || {};
        return Boolean(address && address.length >= 5 && serviceLocation !== undefined);
      case 'service-description':
        const { skills, experience, targetAudience } = data?.basicInfo || {};
        return Boolean(
          skills?.length > 0 &&
          experience?.length > 10 &&
          targetAudience !== undefined
        );
      case 'special-features':
        const { servicesIncluded } = data?.basicInfo || [];
        return Boolean(servicesIncluded?.length > 0);
      case 'photos':
        const { media } = data || [];
        return Boolean(media?.length > 0);
      case 'title':
        const { title } = data.basicInfo || {};
        return Boolean(title && title.length >= 5 && title?.length <= 32);
      case 'description':
        const { description } = data.basicInfo || {};
        return Boolean(description && description.length >= 50 && description?.length <= 500);
      case 'instant-book':
        const { requestConfirmation } = data?.basicInfo || [];
        return Boolean(requestConfirmation !== undefined);
      case 'price':
        const { pricingType, hourlyRate, fixedPrice } = data?.pricing || {};
        return Boolean(pricingType !== undefined && (hourlyRate || fixedPrice));
      case 'payment-methods':
        return Array.isArray(data?.paymentMethods) && data.paymentMethods.length > 0;
      default:
        return true;
    }
  }, []);

  const setStepValidity = useCallback((data: any) => {
    const isValid = validateStep(currentStep, data);

    setValidationState(prev => {
      // Prevent unnecessary updates
      if (prev[currentStep] === isValid) {
        return prev;
      }
      return {
        ...prev,
        [currentStep]: isValid
      };
    });
  }, [currentStep, validateStep, setValidationState]);

  return {
    isValid: validationState[currentStep] ?? false,
    setStepValidity,
  };
};

export const usePostUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePostData = async (type: keyof typeof UPDATE_HANDLERS, data: any, postId: string) => {
    try {
      setIsUpdating(true);
      await updatePost({
        type,
        data,
        postId
      });
      return true;
    } catch (error) {
      console.error('Failed to update post:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updatePostData, isUpdating };
}
