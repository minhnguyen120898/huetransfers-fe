import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  observe?: 'body';
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

/**
 * Base HTTP Service - Foundation for all feature services
 *
 * IMPORTANT: All feature services must extend this class.
 * Never inject HttpClient directly in feature services.
 *
 * This pattern provides:
 * - Centralized API base URL configuration
 * - Consistent HTTP method signatures
 * - Type-safe HTTP requests
 * - Utility methods for params and headers
 *
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class BookingService extends BaseHttpService {
 *   getBookings(): Observable<Booking[]> {
 *     return this.get<Booking[]>('bookings');
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class BaseHttpService {
  protected readonly baseUrl = environment.apiBaseUrl;
  protected readonly http = inject(HttpClient);

  /**
   * HTTP GET request
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param options - HTTP options (headers, params, etc.)
   * @returns Observable of response
   */
  protected get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  /**
   * HTTP GET request for Blob (file downloads)
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param options - HTTP options (headers, params, etc.)
   * @returns Observable of Blob
   */
  protected getBlob(
    endpoint: string,
    options?: Omit<HttpOptions, 'responseType'>,
  ): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      ...options,
      responseType: 'blob',
    });
  }

  /**
   * HTTP POST request
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param data - Request body data
   * @param options - HTTP options (headers, params, etc.)
   * @returns Observable of response
   */
  protected post<T>(endpoint: string, data: unknown, options?: HttpOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, options);
  }

  /**
   * HTTP PUT request (full update)
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param data - Request body data
   * @param options - HTTP options (headers, params, etc.)
   * @returns Observable of response
   */
  protected put<T>(endpoint: string, data: unknown, options?: HttpOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, options);
  }

  /**
   * HTTP PATCH request (partial update)
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param data - Request body data
   * @param options - HTTP options (headers, params, etc.)
   * @returns Observable of response
   */
  protected patch<T>(endpoint: string, data: unknown, options?: HttpOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, options);
  }

  /**
   * HTTP DELETE request
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param options - HTTP options (headers, params, etc.)
   * @returns Observable of response
   */
  protected delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  /**
   * Build HTTP params from object
   * Filters out null and undefined values automatically
   * @param params - Object with key-value pairs
   * @returns HttpParams instance
   */
  protected buildParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  /**
   * Build HTTP headers from object
   * @param headers - Object with header key-value pairs
   * @returns HttpHeaders instance
   */
  protected buildHeaders(headers: Record<string, string>): HttpHeaders {
    let httpHeaders = new HttpHeaders();

    Object.keys(headers).forEach((key) => {
      httpHeaders = httpHeaders.set(key, headers[key]);
    });

    return httpHeaders;
  }
}
