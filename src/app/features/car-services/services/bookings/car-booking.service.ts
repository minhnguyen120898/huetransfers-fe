import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { PaginatedResponse } from '@core/models/api.model';
import {
  BulkPaymentStatusDto,
  BulkPaymentStatusResponse,
  CarBooking,
  CarBookingCountByStatus,
  CarBookingCountParams,
  CarBookingQueryParams,
  CancelTransferResponse,
  CreateCarBookingDto,
  TransferCarBookingDto,
  TransferCarBookingResponse,
  UpdateCarBookingDto,
  UpdateCarBookingTransferPricingDto,
  UpdateCarOriginalPricingDto,
  UpdateCarOriginalPricingResponse,
} from '@core/models/car-booking.model';

@Injectable({ providedIn: 'root' })
export class CarBookingService extends BaseHttpService {
  private readonly endpoint = 'car-bookings';

  getCarBookings(params?: CarBookingQueryParams): Observable<PaginatedResponse<CarBooking>> {
    const httpParams = this.buildParams((params || {}) as Record<string, unknown>);
    return this.get<PaginatedResponse<CarBooking>>(this.endpoint, { params: httpParams });
  }

  getCarBookingById(id: string): Observable<CarBooking> {
    return this.get<CarBooking>(`${this.endpoint}/${id}`);
  }

  getCarBookingByCode(bookingCode: string): Observable<CarBooking> {
    return this.get<CarBooking>(`${this.endpoint}/code/${bookingCode}`);
  }

  getCountByStatus(params?: CarBookingCountParams): Observable<CarBookingCountByStatus> {
    const httpParams = this.buildParams((params || {}) as Record<string, unknown>);
    return this.get<CarBookingCountByStatus>(`${this.endpoint}/count-by-status`, {
      params: httpParams,
    });
  }

  createCarBooking(dto: CreateCarBookingDto): Observable<CarBooking> {
    return this.post<CarBooking>(this.endpoint, dto);
  }

  updateCarBooking(id: string, dto: UpdateCarBookingDto): Observable<CarBooking> {
    return this.patch<CarBooking>(`${this.endpoint}/${id}`, dto);
  }

  cancelCarBooking(id: string): Observable<CarBooking> {
    return this.delete<CarBooking>(`${this.endpoint}/${id}`);
  }

  cancelTransfer(id: string): Observable<CancelTransferResponse> {
    return this.delete<CancelTransferResponse>(`${this.endpoint}/${id}/transfer`);
  }

  bulkUpdatePaymentStatus(dto: BulkPaymentStatusDto): Observable<BulkPaymentStatusResponse> {
    return this.patch<BulkPaymentStatusResponse>(`${this.endpoint}/bulk-payment-status`, dto);
  }

  transferToPartner(
    bookingId: string,
    dto: TransferCarBookingDto,
  ): Observable<TransferCarBookingResponse> {
    return this.post<TransferCarBookingResponse>(`${this.endpoint}/${bookingId}/transfer`, dto);
  }

  updateTransferPricing(
    originalBookingId: string,
    dto: UpdateCarBookingTransferPricingDto,
  ): Observable<TransferCarBookingResponse> {
    return this.patch<TransferCarBookingResponse>(
      `${this.endpoint}/${originalBookingId}/transfer-pricing`,
      dto,
    );
  }

  updateOriginalPricing(
    id: string,
    dto: UpdateCarOriginalPricingDto,
  ): Observable<UpdateCarOriginalPricingResponse> {
    return this.patch<UpdateCarOriginalPricingResponse>(
      `${this.endpoint}/${id}/original-pricing`,
      dto,
    );
  }
}
