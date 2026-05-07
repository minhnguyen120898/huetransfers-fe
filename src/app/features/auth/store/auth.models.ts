import { User } from '@core/models/user.model';

/**
 * Authentication State Model
 * Represents the complete authentication state in NGXS store
 */
export interface AuthStateModel {
  /** Current authenticated user */
  user: User | null;

  /** JWT access token */
  accessToken: string | null;

  /** JWT refresh token */
  refreshToken: string | null;

  /** Whether user is authenticated */
  authenticated: boolean;

  /** Whether user must change password (first login with temporary password) */
  mustChangePassword: boolean;

  /** Loading state for async operations */
  loading: boolean;

  /** Error message from failed operations */
  error: string | null;

  /** Whether password reset email was sent successfully */
  resetEmailSent: boolean;
}
