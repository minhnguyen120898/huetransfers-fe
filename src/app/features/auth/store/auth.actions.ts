import { LoginRequest, AuthResponse } from '@core/models/user.model';

/**
 * Authentication Actions
 * All actions related to user authentication and session management
 */
export namespace AuthActions {
  /**
   * Login user with credentials
   */
  export class Login {
    static readonly type = '[Auth] Login';
    constructor(public request: LoginRequest) {}
  }

  /**
   * Login success - internal action
   */
  export class LoginSuccess {
    static readonly type = '[Auth] Login Success';
    constructor(public response: AuthResponse) {}
  }

  /**
   * Login failure - internal action
   */
  export class LoginFailure {
    static readonly type = '[Auth] Login Failure';
    constructor(public error: string) {}
  }

  /**
   * Logout user and clear session
   */
  export class Logout {
    static readonly type = '[Auth] Logout';
    constructor(public refreshToken?: string) {}
  }

  /**
   * Refresh access token using refresh token
   */
  export class RefreshToken {
    static readonly type = '[Auth] Refresh Token';
  }

  /**
   * Check authentication status on app init
   */
  export class CheckAuth {
    static readonly type = '[Auth] Check Auth';
  }

  /**
   * Get current user profile from backend
   */
  export class GetCurrentUser {
    static readonly type = '[Auth] Get Current User';
  }

  /**
   * Clear authentication error
   */
  export class ClearError {
    static readonly type = '[Auth] Clear Error';
  }

  /**
   * Force change password (first login with temporary password)
   */
  export class ForceChangePassword {
    static readonly type = '[Auth] Force Change Password';
    constructor(
      public request: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      },
    ) {}
  }

  /**
   * Request password reset email
   */
  export class ForgotPassword {
    static readonly type = '[Auth] Forgot Password';
    constructor(public request: { email: string }) {}
  }

  /**
   * Reset password with token from email
   */
  export class ResetPassword {
    static readonly type = '[Auth] Reset Password';
    constructor(
      public request: {
        token: string;
        newPassword: string;
        confirmPassword: string;
      },
    ) {}
  }
}
