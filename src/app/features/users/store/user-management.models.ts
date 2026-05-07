import { PaginationMeta } from '@core/models/api.model';
import { User } from '@core/models';

export interface UserManagementStateModel {
  users: User[];
  meta: PaginationMeta;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

export const userManagementStateDefaults: UserManagementStateModel = {
  users: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};
