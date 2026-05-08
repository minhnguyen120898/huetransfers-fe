import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStateModel } from './auth.models';
import { AuthActions } from './auth.actions';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { User } from '@core/models/user.model';

/**
 * Authentication State
 * Manages user authentication state using NGXS
 */
@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    accessToken: null,
    refreshToken: null,
    authenticated: false,
    mustChangePassword: false,
    loading: false,
    error: null,
    resetEmailSent: false,
  },
})
@Injectable()
export class AuthState {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // ===== Selectors =====

  @Selector()
  static user(state: AuthStateModel): User | null {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.authenticated;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Selector()
  static accessToken(state: AuthStateModel): string | null {
    return state.accessToken;
  }

  @Selector()
  static mustChangePassword(state: AuthStateModel): boolean {
    return state.mustChangePassword;
  }

  @Selector()
  static resetEmailSent(state: AuthStateModel): boolean {
    return state.resetEmailSent;
  }

  // ===== Actions =====

  /**
   * Login user with credentials
   */
  @Action(AuthActions.Login)
  login(ctx: StateContext<AuthStateModel>, action: AuthActions.Login) {
    ctx.patchState({ loading: true, error: null });

    return this.authService.login(action.request).pipe(
      tap((response) => {
        // Store tokens in localStorage
        this.authService.setAccessToken(response.accessToken);
        this.authService.setRefreshToken(response.refreshToken);
        this.authService.setUser(response.user);

        // Check if user must change password
        const mustChangePassword = response.mustChangePassword || false;

        // Update state
        ctx.patchState({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          authenticated: true,
          mustChangePassword,
          loading: false,
          error: null,
        });

        // If user must change password, navigate to force change password page
        if (mustChangePassword) {
          this.notification.showWarning(
            'You must change your password before accessing the system',
          );
          this.router.navigate(['/auth/force-change-password']);
        } else {
          // Show success notification
          this.notification.showSuccess('Login successful!');

          // Navigate to car-services (default landing page)
          this.router.navigate(['/car-services']);
        }
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Login failed. Please try again.';

        ctx.patchState({
          loading: false,
          error: errorMessage,
          authenticated: false,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }

  /**
   * Logout user and clear session
   */
  @Action(AuthActions.Logout)
  logout(ctx: StateContext<AuthStateModel>, action: AuthActions.Logout) {
    const refreshToken = action.refreshToken || this.authService.getRefreshToken();

    return this.authService.logout(refreshToken || undefined).pipe(
      tap(() => {
        // Clear tokens from localStorage
        this.authService.clearTokens();

        // Reset state
        ctx.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          authenticated: false,
          mustChangePassword: false,
          loading: false,
          error: null,
          resetEmailSent: false,
        });

        // Show success notification
        this.notification.showSuccess('Logged out successfully');

        // Navigate to login
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        // Even if logout fails on backend, clear local state
        this.authService.clearTokens();

        ctx.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          authenticated: false,
          mustChangePassword: false,
          loading: false,
          error: null,
          resetEmailSent: false,
        });

        // Navigate to login anyway
        this.router.navigate(['/auth/login']);

        return of(error);
      }),
    );
  }

  /**
   * Refresh access token using refresh token
   */
  @Action(AuthActions.RefreshToken)
  refreshToken(ctx: StateContext<AuthStateModel>) {
    const refreshToken = this.authService.getRefreshToken();

    if (!refreshToken) {
      // No refresh token available, logout
      ctx.dispatch(new AuthActions.Logout());
      return of(null);
    }

    return this.authService.refreshToken({ refreshToken }).pipe(
      tap((response) => {
        // Store new tokens (token rotation)
        this.authService.setAccessToken(response.accessToken);
        this.authService.setRefreshToken(response.refreshToken);

        // Update state
        ctx.patchState({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
          authenticated: true,
          error: null,
        });

        // Update user in localStorage if provided
        if (response.user) {
          this.authService.setUser(response.user);
        }
      }),
      catchError((error) => {
        // Refresh failed, logout user
        this.notification.showError('Session expired. Please login again.');
        ctx.dispatch(new AuthActions.Logout());
        return of(error);
      }),
    );
  }

  /**
   * Check authentication status on app initialization
   */
  @Action(AuthActions.CheckAuth)
  checkAuth(ctx: StateContext<AuthStateModel>) {
    const token = this.authService.getAccessToken();
    const user = this.authService.getUserFromStorage();

    // No token or user in storage, not authenticated
    if (!token || !user) {
      ctx.patchState({
        authenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      return of(null);
    }

    // Check if token is expired
    if (this.authService.isTokenExpired()) {
      // Try to refresh token
      return ctx.dispatch(new AuthActions.RefreshToken());
    }

    // Token is valid, restore state from storage
    ctx.patchState({
      user,
      accessToken: token,
      refreshToken: this.authService.getRefreshToken(),
      authenticated: true,
      loading: false,
    });

    // Optionally fetch fresh user data from backend
    return ctx.dispatch(new AuthActions.GetCurrentUser());
  }

  /**
   * Get current user profile from backend
   */
  @Action(AuthActions.GetCurrentUser)
  getCurrentUser(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });

    return this.authService.getCurrentUser().pipe(
      tap((user) => {
        // Update user in localStorage
        this.authService.setUser(user);

        // Update state
        ctx.patchState({
          user,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: 'Failed to fetch user profile',
        });

        // If 401, logout user
        if (error.status === 401) {
          ctx.dispatch(new AuthActions.Logout());
        }

        return of(error);
      }),
    );
  }

  /**
   * Clear authentication error
   */
  @Action(AuthActions.ClearError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }

  /**
   * Force change password (first login with temporary password)
   */
  @Action(AuthActions.ForceChangePassword)
  forceChangePassword(ctx: StateContext<AuthStateModel>, action: AuthActions.ForceChangePassword) {
    ctx.patchState({ loading: true, error: null });

    return this.authService.forceChangePassword(action.request).pipe(
      tap((response) => {
        // Clear mustChangePassword flag
        ctx.patchState({
          mustChangePassword: false,
          loading: false,
          error: null,
        });

        // Show success notification
        this.notification.showSuccess(response.message || 'Password changed successfully!');

        // Navigate to car-services (default landing page)
        this.router.navigate(['/car-services']);
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to change password. Please try again.';

        ctx.patchState({
          loading: false,
          error: errorMessage,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }

  /**
   * Request password reset email
   */
  @Action(AuthActions.ForgotPassword)
  forgotPassword(ctx: StateContext<AuthStateModel>, action: AuthActions.ForgotPassword) {
    ctx.patchState({ loading: true, error: null, resetEmailSent: false });

    return this.authService.forgotPassword(action.request).pipe(
      tap(() => {
        ctx.patchState({
          loading: false,
          resetEmailSent: true,
          error: null,
        });

        // Show success notification (generic message to prevent email enumeration)
        this.notification.showSuccess(
          'If an account exists with this email, you will receive password reset instructions.',
        );
      }),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Failed to send reset email. Please try again.';

        ctx.patchState({
          loading: false,
          error: errorMessage,
          resetEmailSent: false,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }

  /**
   * Reset password with token from email
   */
  @Action(AuthActions.ResetPassword)
  resetPassword(ctx: StateContext<AuthStateModel>, action: AuthActions.ResetPassword) {
    ctx.patchState({ loading: true, error: null });

    return this.authService.resetPassword(action.request).pipe(
      tap((response) => {
        ctx.patchState({
          loading: false,
          error: null,
        });

        // Show success notification
        this.notification.showSuccess(
          response.message || 'Password reset successful! Please login with your new password.',
        );

        // Navigate to login page
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to reset password. Please try again.';

        ctx.patchState({
          loading: false,
          error: errorMessage,
        });

        // Show error notification
        this.notification.showError(errorMessage);

        return of(error);
      }),
    );
  }
}
