import { UserQueryParams, CreateUserDto, UpdateUserDto } from '../models/user-management.model';
import { User } from '@core/models';
import { PaginatedResponse } from '@core/models/api.model';

export namespace UserManagementActions {
  export class LoadUsers {
    static readonly type = '[UserManagement] Load Users';
    constructor(public params?: UserQueryParams) {}
  }

  export class LoadUsersSuccess {
    static readonly type = '[UserManagement] Load Users Success';
    constructor(public response: PaginatedResponse<User>) {}
  }

  export class LoadUsersFailure {
    static readonly type = '[UserManagement] Load Users Failure';
    constructor(public error: string) {}
  }

  export class CreateUser {
    static readonly type = '[UserManagement] Create User';
    constructor(public payload: CreateUserDto) {}
  }

  export class CreateUserSuccess {
    static readonly type = '[UserManagement] Create User Success';
  }

  export class CreateUserFailure {
    static readonly type = '[UserManagement] Create User Failure';
    constructor(public error: string) {}
  }

  export class UpdateUser {
    static readonly type = '[UserManagement] Update User';
    constructor(
      public id: string,
      public payload: UpdateUserDto,
    ) {}
  }

  export class UpdateUserSuccess {
    static readonly type = '[UserManagement] Update User Success';
    constructor(public user: User) {}
  }

  export class UpdateUserFailure {
    static readonly type = '[UserManagement] Update User Failure';
    constructor(public error: string) {}
  }

  export class DeactivateUser {
    static readonly type = '[UserManagement] Deactivate User';
    constructor(public id: string) {}
  }

  export class DeactivateUserSuccess {
    static readonly type = '[UserManagement] Deactivate User Success';
    constructor(public id: string) {}
  }

  export class ReactivateUser {
    static readonly type = '[UserManagement] Reactivate User';
    constructor(public id: string) {}
  }

  export class ReactivateUserSuccess {
    static readonly type = '[UserManagement] Reactivate User Success';
    constructor(public user: User) {}
  }

  export class SetFilters {
    static readonly type = '[UserManagement] Set Filters';
    constructor(public params: UserQueryParams) {}
  }
}
