import { Like, Prisma, Review, ServiceEngagement } from "@prisma/client/edge";
import {
  EngagementType,
  Location,
  Media,
  MediaType,
  Post,
  PricingType,
  RequestConfirmationType,
  ServiceLocationType,
  ServicesIncluded,
  TargetAudience
} from "@prisma/client/edge";

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

export type UpdatePostByUserData = UpdatePostData & {
  deleteImages: {
    imageIds: string[]
  }
}

export type PostWithUserInfo = Post & {
  location: Location | null;
  media: Media[];
  tags?: PostWithTag[];
  serviceEngagement?: ServiceEngagement[];
  reviews: {
    rating: number;
    createdAt: Date;
  }[];
  user: {
    name: string | null;
    image: string | null;
  };
  likes: Like[];
}

export type CursorPagination = {
  cursor?: string;
  hasNextPage: boolean;
  endCursor?: string;
};

export type ResponseDataWithCursor = {
  posts: (PostWithUserInfo & {
    distance: number | null
  })[];
  pagination: CursorPagination;
};

export type ResponseDataWithLocationCursor = {
  posts: (PostWithUserInfo & {
    distance: number
  })[];
  pagination: CursorPagination;
};

export type ResponseDataWithLocationAndCursor = ResponseDataWithLocationCursor & {
  searchRadius: number;
  density: number;
};

export type SearchWithPaginationOptions = CursorPaginationOptions & {
  complete?: string
}

export type CursorPaginationOptions = Omit<FilterOptions, 'page' | 'limit'> & {
  cursor?: string;
  take?: number;
};

export type GetPostsResponse = {
  data: ResponseDataWithLocationAndCursor | ResponseDataWithCursor | [];
  nextCursor?: string;
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
  categoryIds?: string[];
  subcategoryIds?: string[];
  searchQuery?: string;
};

type TypeLocation = {
  latitude: number;
  longitude: number;
  radiusInKm: number;
};

type DynamicPostInclude = {
  payments: true;
  reviews: true;
  likes: true;
  user: {
    select: {
      credits: true
    }
  };
};

export type DynamicPostWithIncludes = Prisma.PostGetPayload<{
  include: DynamicPostInclude;
}>;

type StaticPostInclude = {
  media: true;
  user: {
    select: {
      id: true;
      name: true;
      image: true;
      createdAt: true;
    }
  };
  tags: {
    include: {
      subcategory: {
        select: {
          name: true
        }
      }
    }
  };
  serviceEngagement: true;
  location: true;
};

export type StaticPostWithIncludes = Prisma.PostGetPayload<{
  include: StaticPostInclude;
}>;

export type StaticPostWithIncludesWithHighlights = {
  post: Prisma.PostGetPayload<{
    include: StaticPostInclude;
  }>;
  highlightsPosts: PostWithUserInfo[];
};

export type TypedReview = Review & {
  user: {
    name: string | null;
    image: string | null;
    createdAt: Date;
    location: {
      fullAddress: string;
    } | null;
  }
}

export type ReviewsResponseWithCursor = {
  reviews: TypedReview[];
  pagination: CursorPagination;
};
