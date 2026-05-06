import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthActions, AuthService } from '@features/auth';

/**
 * Token Refresh Interceptor - Automatically refreshes expired access tokens
 * On 401 error, attempts to refresh token via NGXS and retry the request
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const store = inject(Store);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and not already on refresh, login, or logout endpoints
      if (
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/logout')
      ) {
        const refreshToken = authService.getRefreshToken();

        // No refresh token available, logout
        if (!refreshToken) {
          store.dispatch(new AuthActions.Logout());
          return throwError(() => error);
        }

        // Dispatch refresh token action
        return store.dispatch(new AuthActions.RefreshToken()).pipe(
          switchMap(() => {
            // Get new token from storage after refresh
            const newToken = authService.getAccessToken();

            if (!newToken) {
              return throwError(() => error);
            }

            // Retry original request with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout user
            store.dispatch(new AuthActions.Logout());
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
