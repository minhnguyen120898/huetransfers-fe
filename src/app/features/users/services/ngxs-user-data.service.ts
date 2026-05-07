import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserDataService } from './user-data.service';
import { UserManagementState } from '../store/user-management.state';
import { UserManagementActions } from '../store/user-management.actions';
import { CreateUserDto, UpdateUserDto, UserQueryParams } from '../models/user-management.model';

@Injectable()
export class NgxsUserDataService implements UserDataService {
  private readonly store = inject(Store);

  readonly users$ = this.store.select(UserManagementState.users);
  readonly loading$ = this.store.select(UserManagementState.loading);
  readonly submitting$ = this.store.select(UserManagementState.submitting);
  readonly error$ = this.store.select(UserManagementState.error);
  readonly meta$ = this.store.select(UserManagementState.meta);

  loadUsers(params?: UserQueryParams): void {
    this.store.dispatch(new UserManagementActions.LoadUsers(params));
  }

  refresh(): void {
    const meta = this.store.selectSnapshot(UserManagementState.meta);
    this.loadUsers({ page: meta.page, limit: meta.limit });
  }

  createUser(payload: CreateUserDto): void {
    this.store.dispatch(new UserManagementActions.CreateUser(payload));
  }

  updateUser(id: string, payload: UpdateUserDto): void {
    this.store.dispatch(new UserManagementActions.UpdateUser(id, payload));
  }

  deactivateUser(id: string): void {
    this.store.dispatch(new UserManagementActions.DeactivateUser(id));
  }

  reactivateUser(id: string): void {
    this.store.dispatch(new UserManagementActions.ReactivateUser(id));
  }
}
