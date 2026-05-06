export interface Tour {
  id: string;
  name: string;
  tourType: TourType; // Changed from 'type' to match API
  duration: string; // Changed from number to string to match API format "X days Y nights"
  description?: string;
  basePrice: string; // Added to match API
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string; // Added to match API
  updatedById: string | null; // Added to match API
}

export enum TourType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export interface CreateTourDto {
  name: string;
  tourType: TourType; // Changed from 'type' to match API
  duration: string; // Changed from number to string
  description?: string;
  basePrice: string; // Added to match API
}

export interface UpdateTourDto {
  name?: string;
  tourType?: TourType; // Changed from 'type' to match API
  duration?: string; // Changed from number to string
  description?: string;
  basePrice?: string; // Added to match API
  isActive?: boolean;
}

export interface TourStatistics {
  totalTours: number;
  activeTours: number;
  publicTours: number;
  privateTours: number;
}
