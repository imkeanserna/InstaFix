import { ServiceEngagement, ServicesIncluded, TargetAudience } from "@prisma/client/edge";
import { PostBasicInfo, PostLocation, PostPricing, PostServiceEngagement, PostWithTag, PostWithUserInfo, UpdatePostData } from "@repo/types";

export function hasBasicInfoChanges(newBasicInfo: PostBasicInfo, existingPost: PostWithUserInfo): boolean {
  return (
    (newBasicInfo.title !== undefined && newBasicInfo.title !== existingPost.title) ||
    (newBasicInfo.description !== undefined && newBasicInfo.description !== existingPost.description) ||
    (newBasicInfo.experience !== undefined && newBasicInfo.experience !== existingPost.experience) ||
    (newBasicInfo.customDetails !== undefined && newBasicInfo.customDetails !== existingPost.customDetails) ||
    (newBasicInfo.packageDetails !== undefined && newBasicInfo.packageDetails !== existingPost.packageDetails) ||
    (newBasicInfo.requestConfirmation !== undefined && newBasicInfo.requestConfirmation !== existingPost.requestConfirmation) ||
    hasArrayChanges(newBasicInfo.skills, existingPost.skills) ||
    hasArrayChanges(newBasicInfo.servicesIncluded, existingPost.servicesIncluded) ||
    hasTargetAudienceChanges(newBasicInfo.targetAudience, existingPost.targetAudience!)
  );
}

export function hasTagsChanged(newTags: PostWithTag[], existingTags: PostWithTag[]): boolean {
  if (!existingTags) return true;
  if (newTags.length !== existingTags.length) return true;

  const newTagIds = new Set(newTags.map(tag => tag.subcategoryId));
  const existingTagIds = new Set(existingTags.map(tag => tag.subcategoryId));

  if (newTagIds.size !== existingTagIds.size) return true;

  // Check if all newTagIds exist in existingTagIds
  return Array.from(newTagIds).some(id => !existingTagIds.has(id));
}

export function hasServiceEngagementChanged(newEngagements: PostServiceEngagement[], existingEngagements: ServiceEngagement[]): boolean {
  if (!existingEngagements) return true;
  if (newEngagements.length !== existingEngagements.length) return true;

  const existingEngagementMap = new Map();
  for (const engagement of existingEngagements) {
    existingEngagementMap.set(engagement.engagementType, engagement.customDetails || null);
  }

  for (const newEngagement of newEngagements) {
    if (!existingEngagementMap.has(newEngagement.engagementType) ||
      existingEngagementMap.get(newEngagement.engagementType) !== (newEngagement.customDetails || null)) {
      return true;
    }
  }

  return false;
}

export function hasLocationChanges(newLocation: PostLocation, existingPost: PostWithUserInfo): boolean {
  if (!existingPost.location) return true;

  return (
    (newLocation.lat !== undefined && newLocation.lat !== existingPost.location.latitude) ||
    (newLocation.lng !== undefined && newLocation.lng !== existingPost.location.longitude) ||
    (newLocation.serviceLocation !== undefined && newLocation.serviceLocation !== existingPost.serviceLocation)
  );
}

export function hasPricingChanges(newPricing: PostPricing, existingPost: PostWithUserInfo): boolean {
  return (
    (newPricing.pricingType !== undefined && newPricing.pricingType !== existingPost.pricingType) ||
    (newPricing.hourlyRate !== undefined && newPricing.hourlyRate !== existingPost.hourlyRate) ||
    (newPricing.fixedPrice !== undefined && newPricing.fixedPrice !== existingPost.fixedPrice)
  );
}

export function hasMediaChanges(media: UpdatePostData['media'], existingPost: PostWithUserInfo): boolean {
  if (media.files && media.files.length > 0) {
    return true;
  }

  if (media.coverPhotoIndex !== undefined) {
    const currentCoverPhoto = existingPost.coverPhoto;
    if (!existingPost.media || existingPost.media.length === 0) {
      return media.coverPhotoIndex !== -1;
    }

    if (media.coverPhotoIndex >= existingPost.media.length) {
      return true;
    }

    if (media.coverPhotoIndex === -1) {
      return currentCoverPhoto !== null && currentCoverPhoto !== undefined;
    }

    const selectedMedia = existingPost.media[media.coverPhotoIndex];
    return !selectedMedia || selectedMedia.url !== currentCoverPhoto;
  }

  return false;
}

function hasArrayChanges(newArray?: ServicesIncluded[] | string[], existingArray?: ServicesIncluded[] | string[]): boolean {
  if (!newArray) return false;
  if (!existingArray) return newArray.length > 0;
  if (newArray.length !== existingArray.length) return true;

  for (let i = 0; i < newArray.length; i++) {
    if (newArray[i] !== existingArray[i]) return true;
  }

  return false;
}

function hasTargetAudienceChanges(newTarget?: TargetAudience, existingTarget?: TargetAudience): boolean {
  if (!newTarget) return false;
  if (!existingTarget) return true;

  return JSON.stringify(newTarget) !== JSON.stringify(existingTarget);
}
