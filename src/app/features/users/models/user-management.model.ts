import { UserRole } from '@core/models';

export interface CreateUserDto {
  email: string;
  fullName: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  tel?: string;
  isActive?: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserTableFilters {
  search?: string;
  role?: UserRole | 'all';
  isActive?: boolean | 'all';
}
