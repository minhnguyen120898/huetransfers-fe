import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { SettingsStateModel } from './settings.models';
import { SettingsActions } from './settings.actions';
import { SettingsService } from '../services/settings.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthActions } from '@features/auth/store/auth.actions';

/**
 * Settings State
 * Manages settings-related state using NGXS
 */
@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    changePasswordLoading: false,
    createUserLoading: false,
    updateUserLoading: false,
    updateUserError: null,
    error: null,
  },
})
@Injectable()
export class SettingsState {
  private readonly settingsService = inject(SettingsService);
  private readonly notification = inject(NotificationService);

  // ===== Selectors =====

  @Selector()
  static changePasswordLoading(state: SettingsStateModel): boolean {
    return state.changePasswordLoading;
  }

  @Selector()
  static createUserLoading(state: SettingsStateModel): boolean {
    return state.createUserLoading;
  }

  @Selector()
  static error(state: SettingsStateModel): string | null {
    return state.error;
  }

  @Selector()
  static updateUserLoading(state: SettingsStateModel): boolean {
    return state.updateUserLoading;
  }

  @Selector()
  static updateUserError(state: SettingsStateModel): string | null {
    return state.updateUserError;
  }

  // ===== Actions =====

  /**
   * Change Password
   */
  @Action(SettingsActions.ChangePassword)
  changePassword(ctx: StateContext<SettingsStateModel>, action: SettingsActions.ChangePassword) {
    ctx.patchState({ changePasswordLoading: true, error: null });

    return this.settingsService.changePassword(action.payload).pipe(
      tap((response) => {
        ctx.patchState({
          changePasswordLoading: false,
          error: null,
        });

        // Show success notification
        this.notification.showSuccess('Password changed successfully!');

        // Dispatch success action
        ctx.dispatch(new SettingsActions.ChangePasswordSuccess());
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to change password. Please try again.';

        ctx.patchState({
          changePasswordLoading: false,
          error: errorMessage,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }

  /**
   * Create User
   */
  @Action(SettingsActions.CreateUser)
  createUser(ctx: StateContext<SettingsStateModel>, action: SettingsActions.CreateUser) {
    ctx.patchState({ createUserLoading: true, error: null });

    return this.settingsService.createUser(action.payload).pipe(
      tap((user) => {
        ctx.patchState({
          createUserLoading: false,
          error: null,
        });

        // Show success notification
        this.notification.showSuccess(`User ${user.email} created successfully!`);

        // Dispatch success action
        ctx.dispatch(new SettingsActions.CreateUserSuccess());
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to create user. Please try again.';

        ctx.patchState({
          createUserLoading: false,
          error: errorMessage,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }

  /**
   * Update User Information
   */
  @Action(SettingsActions.UpdateInformation)
  updateInformation(
    ctx: StateContext<SettingsStateModel>,
    action: SettingsActions.UpdateInformation,
  ) {
    ctx.patchState({ updateUserLoading: true, updateUserError: null });

    return this.settingsService.updateUser(action.id, action.payload).pipe(
      tap(() => {
        ctx.patchState({
          updateUserLoading: false,
          updateUserError: null,
        });

        // Show success notification
        this.notification.showSuccess('User information updated successfully!');

        // Refresh user data in auth state and dispatch success action
        ctx.dispatch([
          new AuthActions.GetCurrentUser(),
          new SettingsActions.UpdateInformationSuccess(),
        ]);
      }),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Failed to update user information. Please try again.';

        ctx.patchState({
          updateUserLoading: false,
          updateUserError: errorMessage,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }

  /**
   * Clear Error
   */
  @Action(SettingsActions.ClearError)
  clearError(ctx: StateContext<SettingsStateModel>) {
    ctx.patchState({ error: null });
  }
}
