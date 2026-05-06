import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@core/services/loading.service';

/**
 * Loading Interceptor - Automatically shows/hides global loading indicator
 * Can be skipped with X-Skip-Loading header
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const loadingService = inject(LoadingService);

  // Skip loading for certain endpoints (optional)
  const skipLoading = req.headers.has('X-Skip-Loading');
  if (skipLoading) {
    return next(req.clone({ headers: req.headers.delete('X-Skip-Loading') }));
  }

  // Show loading
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Hide loading after request completes (success or error)
      loadingService.hide();
    }),
  );
};
