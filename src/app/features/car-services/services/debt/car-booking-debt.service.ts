import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import {
  CarBookingDebtListResponse,
  CarBookingDebtDetailResponse,
  CarBookingDebtQueryParams,
  CarBookingSummaryResponse,
} from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';

@Injectable({ providedIn: 'root' })
export class CarBookingDebtService extends BaseHttpService {
  private readonly endpoint = 'debts/car-bookings';

  getDebtList(params: CarBookingDebtQueryParams): Observable<CarBookingDebtListResponse> {
    const queryParams: Record<string, unknown> = {
      year: params.year,
      month: params.month,
    };
    if (params.search) queryParams['search'] = params.search;
    if (params.paymentStatus) {
      if (Array.isArray(params.paymentStatus)) {
        queryParams['paymentStatus'] = params.paymentStatus.join(',');
      } else {
        queryParams['paymentStatus'] = params.paymentStatus;
      }
    }
    const httpParams = this.buildParams(queryParams);
    return this.get<CarBookingDebtListResponse>(this.endpoint, { params: httpParams });
  }

  getDebtDetail(
    agencyId: string,
    params: { year: number; month: number; paymentStatus?: PaymentStatus },
  ): Observable<CarBookingDebtDetailResponse> {
    const queryParams: Record<string, unknown> = {
      year: params.year,
      month: params.month,
    };
    if (params.paymentStatus) queryParams['paymentStatus'] = params.paymentStatus;
    const httpParams = this.buildParams(queryParams);
    return this.get<CarBookingDebtDetailResponse>(`${this.endpoint}/${agencyId}`, {
      params: httpParams,
    });
  }

  getSummary(year: number, month: number): Observable<CarBookingSummaryResponse> {
    const params = this.buildParams({ year, month });
    return this.get<CarBookingSummaryResponse>('car-bookings/summary', { params });
  }

  exportDebtExcel(
    agencyId: string,
    params: { year: number; month: number; paymentStatus?: string },
  ): Observable<Blob> {
    const queryParams: Record<string, unknown> = { year: params.year, month: params.month };
    if (params.paymentStatus) queryParams['paymentStatus'] = params.paymentStatus;
    const httpParams = this.buildParams(queryParams);
    return this.getBlob(`${this.endpoint}/${agencyId}/excel`, {
      params: httpParams,
      headers: { 'X-Skip-Loading': 'true' },
    });
  }
}
