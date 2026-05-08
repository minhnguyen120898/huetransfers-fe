import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth.state';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 * Uses NGXS AuthState for authentication check
 */
export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login page with return URL
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * Guest Guard - Redirects authenticated users away from auth pages
 * Used for login/register pages
 * Uses NGXS AuthState for authentication check
 */
export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

  if (!isAuthenticated) {
    return true;
  }

  // Redirect to car-services if already authenticated
  router.navigate(['/car-services']);
  return false;
};

/**
 * Role Guard Factory - Protects routes based on user role
 * Usage: canActivate: [authGuard, roleGuard(['admin'])]
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    const user = store.selectSnapshot(AuthState.user);

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirect to travel-agencies (non-admin fallback)
    router.navigate(['/travel-agencies']);
    return false;
  };
};

/**
 * Admin Guard - Protects routes that require admin role
 * Convenience wrapper for roleGuard(['admin'])
 * Usage: canActivate: [authGuard, adminGuard]
 */
export const adminGuard: CanActivateFn = roleGuard(['admin']);
