export interface EventReviewCreate {
  eventId: number;
  rating: number;
  review?: string;
  contentRating?: number;
  speakerRating?: number;
  organizationRating?: number;
  anonymous?: boolean;
}

export interface EventReviewResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface EventReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  averageContentRating?: number;
  averageSpeakerRating?: number;
  averageOrganizationRating?: number;
}


