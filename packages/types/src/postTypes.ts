import { EngagementType, MediaType, PricingType, RequestConfirmationType, ServiceLocationType, ServicesIncluded, TargetAudience } from "@prisma/client/edge";

export type PostBasicInfo = {
  title?: string;
  description?: string;
  skills?: string[];
  experience?: string;
  targetAudience?: TargetAudience;
  customDetails?: string;
  packageDetails?: string;
  servicesIncluded?: ServicesIncluded[];
  requestConfirmation?: RequestConfirmationType;
}

export type PostPricing = {
  pricingType?: PricingType;
  hourlyRate?: number;
  fixedPrice?: number;
}

export type PostLocation = {
  address: string;
  lat: number;
  lng: number;
  serviceLocation?: ServiceLocationType;
}

export type PostServiceEngagement = {
  id?: string;
  engagementType: EngagementType;
  customDetails?: string;
}

export type PostWithTag = {
  subcategoryId: string;
}

export type PostMedia = {
  url: string;
  type: MediaType;
}

export type UpdatePostData = {
  tags: { tags: PostWithTag[] };
  serviceEngagement: { serviceEngagement: PostServiceEngagement[] };
  basicInfo: PostBasicInfo;
  media: { media: File[] };
  location: PostLocation;
  pricing: PostPricing;
}
