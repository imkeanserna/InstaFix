import { EngagementType, Location, Media, MediaType, Post, PricingType, RequestConfirmationType, ServiceLocationType, ServicesIncluded, TargetAudience } from "@prisma/client/edge";

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
  media: {
    files: File[],
    coverPhotoIndex: number
  };
  location: PostLocation;
  pricing: PostPricing;
}

export type PostWithUserInfo = Post & {
  location: Location | null;
  media: Media[];
  reviews: {
    rating: number;
    createdAt: Date;
  }[];
  user: {
    name: string | null;
    image: string | null;
  }
}

export type ResponseDataWithLocation = {
  posts: (PostWithUserInfo & {
    distance: number
  })[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  },
  searchRadius: number;
  density: number;
};

export type ResponseDataWithoutLocation = {
  posts: PostWithUserInfo[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  },
};

export type FilterOptions = {
  page?: number;
  limit?: number;
  location?: TypeLocation | null;
  price?: {
    min?: number;
    max?: number;
    type?: PricingType;
  };
  engagementType?: EngagementType;
  minRating?: number;
  targetAudience?: TargetAudience;
  servicesIncluded?: ServicesIncluded[];
  categoryName?: string;
  subcategoryName?: string;
  searchQuery?: string;
};

type TypeLocation = {
  latitude: number;
  longitude: number;
  radiusInKm: number;
};
