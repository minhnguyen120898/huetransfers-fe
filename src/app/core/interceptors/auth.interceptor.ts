import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '@features/auth';

/**
 * Auth Interceptor - Adds JWT token to all outgoing requests
 * Skips public endpoints (login, register, refresh)
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Skip auth for public endpoints
  const isPublicEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  if (token && !isPublicEndpoint) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
