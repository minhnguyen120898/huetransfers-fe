/**
 * Guide entity (matches API response)
 */
export interface Guide {
  id: string;
  name: string;
  tel: string;
  language: string;
  address: string;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Guide DTO
 */
export interface CreateGuideDto {
  name: string;
  tel: string;
  language: string;
  address: string;
  note?: string;
  isActive?: boolean;
}

/**
 * Update Guide DTO
 */
export interface UpdateGuideDto {
  name?: string;
  tel?: string;
  language?: string;
  address?: string;
  note?: string;
  isActive?: boolean;
}

/**
 * Guide query parameters
 */
export interface GuideQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  isActive?: boolean;
}
