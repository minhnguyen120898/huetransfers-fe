import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { User } from '@core/models';
import { PaginationMeta } from '@core/models/api.model';
import { NotificationService } from '@core/services/notification.service';
import { UserManagementService } from '../services/user-management.service';
import { UserManagementActions } from './user-management.actions';
import { UserManagementStateModel, userManagementStateDefaults } from './user-management.models';

@State<UserManagementStateModel>({
  name: 'userManagement',
  defaults: userManagementStateDefaults,
})
@Injectable()
export class UserManagementState {
  private readonly service = inject(UserManagementService);
  private readonly notification = inject(NotificationService);

  @Selector()
  static users(state: UserManagementStateModel): User[] {
    return state.users;
  }

  @Selector()
  static meta(state: UserManagementStateModel): PaginationMeta {
    return state.meta;
  }

  @Selector()
  static loading(state: UserManagementStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static submitting(state: UserManagementStateModel): boolean {
    return state.submitting;
  }

  @Selector()
  static error(state: UserManagementStateModel): string | null {
    return state.error;
  }

  @Action(UserManagementActions.LoadUsers)
  loadUsers(ctx: StateContext<UserManagementStateModel>, action: UserManagementActions.LoadUsers) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getUsers(action.params).pipe(
      tap((response) => {
        ctx.patchState({ users: response.data, meta: response.meta, loading: false });
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to load users.';
        ctx.patchState({ loading: false, error: message });
        this.notification.showError(message);
        return of(null);
      }),
    );
  }

  @Action(UserManagementActions.SetFilters)
  setFilters(
    ctx: StateContext<UserManagementStateModel>,
    action: UserManagementActions.SetFilters,
  ) {
    ctx.dispatch(new UserManagementActions.LoadUsers({ ...action.params, page: 1 }));
  }

  @Action(UserManagementActions.CreateUser)
  createUser(
    ctx: StateContext<UserManagementStateModel>,
    action: UserManagementActions.CreateUser,
  ) {
    ctx.patchState({ submitting: true, error: null });
    return this.service.createUser(action.payload).pipe(
      tap(() => {
        ctx.patchState({ submitting: false });
        this.notification.showSuccess(
          'User created successfully. A temporary password has been emailed to them.',
        );
        ctx.dispatch(new UserManagementActions.CreateUserSuccess());
        const meta = ctx.getState().meta;
        ctx.dispatch(new UserManagementActions.LoadUsers({ page: meta.page, limit: meta.limit }));
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to create user.';
        ctx.patchState({ submitting: false, error: message });
        this.notification.showError(message);
        ctx.dispatch(new UserManagementActions.CreateUserFailure(message));
        return of(null);
      }),
    );
  }

  @Action(UserManagementActions.UpdateUser)
  updateUser(
    ctx: StateContext<UserManagementStateModel>,
    action: UserManagementActions.UpdateUser,
  ) {
    ctx.patchState({ submitting: true, error: null });
    return this.service.updateUser(action.id, action.payload).pipe(
      tap((updatedUser) => {
        ctx.patchState({
          submitting: false,
          users: ctx.getState().users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        });
        this.notification.showSuccess('User updated successfully.');
        ctx.dispatch(new UserManagementActions.UpdateUserSuccess(updatedUser));
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to update user.';
        ctx.patchState({ submitting: false, error: message });
        this.notification.showError(message);
        ctx.dispatch(new UserManagementActions.UpdateUserFailure(message));
        return of(null);
      }),
    );
  }

  @Action(UserManagementActions.DeactivateUser)
  deactivateUser(
    ctx: StateContext<UserManagementStateModel>,
    action: UserManagementActions.DeactivateUser,
  ) {
    ctx.patchState({ submitting: true, error: null });
    return this.service.deactivateUser(action.id).pipe(
      tap(() => {
        ctx.patchState({
          submitting: false,
          users: ctx
            .getState()
            .users.map((u) => (u.id === action.id ? { ...u, isActive: false } : u)),
        });
        this.notification.showSuccess('User deactivated.');
        ctx.dispatch(new UserManagementActions.DeactivateUserSuccess(action.id));
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to deactivate user.';
        ctx.patchState({ submitting: false, error: message });
        this.notification.showError(message);
        return of(null);
      }),
    );
  }

  @Action(UserManagementActions.ReactivateUser)
  reactivateUser(
    ctx: StateContext<UserManagementStateModel>,
    action: UserManagementActions.ReactivateUser,
  ) {
    ctx.patchState({ submitting: true, error: null });
    return this.service.updateUser(action.id, { isActive: true }).pipe(
      tap((updatedUser) => {
        ctx.patchState({
          submitting: false,
          users: ctx.getState().users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        });
        this.notification.showSuccess('User reactivated.');
        ctx.dispatch(new UserManagementActions.ReactivateUserSuccess(updatedUser));
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to reactivate user.';
        ctx.patchState({ submitting: false, error: message });
        this.notification.showError(message);
        return of(null);
      }),
    );
  }
}
