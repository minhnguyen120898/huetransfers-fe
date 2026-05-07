import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth.state';

/**
 * Force Change Password Guard
 * Redirects authenticated users who must change their password to the force-change-password page
 * Allows access to the force-change-password page itself
 * Should be applied to protected routes to prevent access before password is changed
 */
export const forceChangePasswordGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
  const mustChangePassword = store.selectSnapshot(AuthState.mustChangePassword);

  // If not authenticated, let authGuard handle it
  if (!isAuthenticated) {
    return true;
  }

  // If user must change password and is not on force-change-password page
  if (mustChangePassword && state.url !== '/auth/force-change-password') {
    router.navigate(['/auth/force-change-password']);
    return false;
  }

  return true;
};
