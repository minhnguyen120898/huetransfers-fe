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
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';

export namespace CarBookingActions {
  export class LoadCarBookings {
    static readonly type = '[CarBooking] Load Car Bookings';
    constructor(public params?: CarBookingQueryParams) {}
  }

  export class LoadCarBookingsSuccess {
    static readonly type = '[CarBooking] Load Car Bookings Success';
    constructor(
      public carBookings: CarBooking[],
      public meta: PaginationMeta,
    ) {}
  }

  export class LoadCarBookingsFailure {
    static readonly type = '[CarBooking] Load Car Bookings Failure';
    constructor(public error: string) {}
  }

  export class LoadCountByStatus {
    static readonly type = '[CarBooking] Load Count By Status';
    constructor(public params?: CarBookingCountParams) {}
  }

  export class LoadCountByStatusSuccess {
    static readonly type = '[CarBooking] Load Count By Status Success';
    constructor(public countByStatus: CarBookingCountByStatus) {}
  }

  export class LoadCountByStatusFailure {
    static readonly type = '[CarBooking] Load Count By Status Failure';
    constructor(public error: string) {}
  }

  export class CreateCarBooking {
    static readonly type = '[CarBooking] Create Car Booking';
    constructor(public dto: CreateCarBookingDto) {}
  }

  export class CreateCarBookingSuccess {
    static readonly type = '[CarBooking] Create Car Booking Success';
    constructor(public carBooking: CarBooking) {}
  }

  export class CreateCarBookingFailure {
    static readonly type = '[CarBooking] Create Car Booking Failure';
    constructor(public error: string) {}
  }

  export class UpdateCarBooking {
    static readonly type = '[CarBooking] Update Car Booking';
    constructor(
      public id: string,
      public dto: UpdateCarBookingDto,
    ) {}
  }

  export class UpdateCarBookingSuccess {
    static readonly type = '[CarBooking] Update Car Booking Success';
    constructor(public carBooking: CarBooking) {}
  }

  export class UpdateCarBookingFailure {
    static readonly type = '[CarBooking] Update Car Booking Failure';
    constructor(public error: string) {}
  }

  export class CancelCarBooking {
    static readonly type = '[CarBooking] Cancel Car Booking';
    constructor(public id: string) {}
  }

  export class CancelCarBookingSuccess {
    static readonly type = '[CarBooking] Cancel Car Booking Success';
    constructor(public carBooking: CarBooking) {}
  }

  export class CancelCarBookingFailure {
    static readonly type = '[CarBooking] Cancel Car Booking Failure';
    constructor(public error: string) {}
  }

  export class CancelTransfer {
    static readonly type = '[CarBooking] Cancel Transfer';
    constructor(public id: string) {}
  }

  export class CancelTransferSuccess {
    static readonly type = '[CarBooking] Cancel Transfer Success';
    constructor(public response: CancelTransferResponse) {}
  }

  export class CancelTransferFailure {
    static readonly type = '[CarBooking] Cancel Transfer Failure';
    constructor(public error: string) {}
  }

  export class BulkUpdatePaymentStatus {
    static readonly type = '[CarBooking] Bulk Update Payment Status';
    constructor(public dto: BulkPaymentStatusDto) {}
  }

  export class BulkUpdatePaymentStatusSuccess {
    static readonly type = '[CarBooking] Bulk Update Payment Status Success';
    constructor(public response: BulkPaymentStatusResponse) {}
  }

  export class BulkUpdatePaymentStatusFailure {
    static readonly type = '[CarBooking] Bulk Update Payment Status Failure';
    constructor(public error: string) {}
  }

  export class TransferCarBooking {
    static readonly type = '[CarBooking] Transfer Car Booking';
    constructor(
      public bookingId: string,
      public dto: TransferCarBookingDto,
    ) {}
  }

  export class TransferCarBookingSuccess {
    static readonly type = '[CarBooking] Transfer Car Booking Success';
    constructor(public response: TransferCarBookingResponse) {}
  }

  export class TransferCarBookingFailure {
    static readonly type = '[CarBooking] Transfer Car Booking Failure';
    constructor(public error: string) {}
  }

  export class UpdateTransferPricing {
    static readonly type = '[CarBooking] Update Transfer Pricing';
    constructor(
      public originalBookingId: string,
      public dto: UpdateCarBookingTransferPricingDto,
    ) {}
  }

  export class UpdateTransferPricingSuccess {
    static readonly type = '[CarBooking] Update Transfer Pricing Success';
    constructor(public response: TransferCarBookingResponse) {}
  }

  export class UpdateTransferPricingFailure {
    static readonly type = '[CarBooking] Update Transfer Pricing Failure';
    constructor(public error: string) {}
  }

  export class SelectCarBooking {
    static readonly type = '[CarBooking] Select Car Booking';
    constructor(public carBooking: CarBooking | null) {}
  }

  export class ClearError {
    static readonly type = '[CarBooking] Clear Error';
  }
}
