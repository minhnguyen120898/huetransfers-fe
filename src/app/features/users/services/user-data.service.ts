import { Observable } from 'rxjs';
import { User } from '@core/models';
import { PaginationMeta } from '@core/models/api.model';
import { CreateUserDto, UpdateUserDto, UserQueryParams } from '../models/user-management.model';

export abstract class UserDataService {
  abstract users$: Observable<User[]>;
  abstract loading$: Observable<boolean>;
  abstract submitting$: Observable<boolean>;
  abstract error$: Observable<string | null>;
  abstract meta$: Observable<PaginationMeta>;

  abstract loadUsers(params?: UserQueryParams): void;
  abstract refresh(): void;
  abstract createUser(payload: CreateUserDto): void;
  abstract updateUser(id: string, payload: UpdateUserDto): void;
  abstract deactivateUser(id: string): void;
  abstract reactivateUser(id: string): void;
}
