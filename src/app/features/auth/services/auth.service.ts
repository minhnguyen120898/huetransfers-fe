import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { BaseHttpService } from '@core/services/base-http.service';
import {
  User,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  TokenPayload,
  ForceChangePasswordRequest,
  ForceChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@core/models';

/**
 * Authentication Service - Low-level API service for authentication
 *
 * This service handles:
 * - HTTP requests for auth endpoints
 * - Token storage in localStorage
 * - Token utilities (decode, expiry check)
 *
 * NOTE: This is a "dumb" service - it only makes HTTP calls and manages storage.
 * All state management, navigation, and notifications are handled by AuthState (NGXS).
 *
 * Components should NOT call this service directly.
 * Use NGXS actions instead: store.dispatch(new AuthActions.Login(...))
 */
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseHttpService {
  // Storage keys
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  // ===== HTTP Methods =====

  /**
   * Login user with credentials
   * @internal Used by AuthState - components should dispatch AuthActions.Login
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/login', request);
  }

  /**
   * Logout user and revoke tokens
   * @internal Used by AuthState - components should dispatch AuthActions.Logout
   */
  logout(refreshToken?: string): Observable<{ message: string; revokedCount: number }> {
    const body = refreshToken ? { refreshToken } : {};
    return this.post<{ message: string; revokedCount: number }>('auth/logout', body);
  }

  /**
   * Refresh access token using refresh token
   * @internal Used by AuthState - components should dispatch AuthActions.RefreshToken
   */
  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/refresh', request);
  }

  /**
   * Get current user profile from backend
   * @internal Used by AuthState - components should dispatch AuthActions.GetCurrentUser
   */
  getCurrentUser(): Observable<User> {
    return this.get<User>('user/me');
  }

  /**
   * Force change password (first login with temporary password)
   * @internal Used by AuthState - components should dispatch AuthActions.ForceChangePassword
   */
  forceChangePassword(
    request: ForceChangePasswordRequest,
  ): Observable<ForceChangePasswordResponse> {
    return this.post<ForceChangePasswordResponse>('auth/force-change-password', request);
  }

  /**
   * Request password reset email
   * @internal Used by AuthState - components should dispatch AuthActions.ForgotPassword
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.post<ForgotPasswordResponse>('auth/forgot-password', request);
  }

  /**
   * Reset password with token from email
   * @internal Used by AuthState - components should dispatch AuthActions.ResetPassword
   */
  resetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>('auth/reset-password', request);
  }

  // ===== Token Storage Methods =====
  // These are public because interceptors need them

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Set user in localStorage
   */
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user from localStorage
   */
  getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Clear all auth data from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // ===== Token Utilities =====

  /**
   * Check if access token is expired or about to expire
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Check if token expires within threshold (default 60 seconds)
      const threshold = environment.tokenRefreshThreshold || 60000;
      return now >= expiryTime - threshold;
    } catch (error) {
      return true;
    }
  }

  /**
   * Decode JWT token payload
   */
  decodeToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
}
