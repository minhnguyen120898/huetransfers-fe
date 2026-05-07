import {
  CarBookingDebtListResponse,
  CarBookingDebtDetailResponse,
  CarBookingDebtQueryParams,
} from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';

export namespace CarBookingDebtActions {
  export class LoadCarBookingDebtList {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt List';
    constructor(public readonly params: CarBookingDebtQueryParams) {}
  }

  export class LoadCarBookingDebtListSuccess {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt List Success';
    constructor(public readonly response: CarBookingDebtListResponse) {}
  }

  export class LoadCarBookingDebtListFailure {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt List Failure';
    constructor(public readonly error: string) {}
  }

  export class LoadCarBookingDebtDetail {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt Detail';
    constructor(
      public readonly agencyId: string,
      public readonly params: { year: number; month: number; paymentStatus?: PaymentStatus },
    ) {}
  }

  export class LoadCarBookingDebtDetailSuccess {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt Detail Success';
    constructor(public readonly response: CarBookingDebtDetailResponse) {}
  }

  export class LoadCarBookingDebtDetailFailure {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt Detail Failure';
    constructor(public readonly error: string) {}
  }

  export class ClearSelectedAgencyDetail {
    static readonly type = '[CarBookingDebt] Clear Selected Agency Detail';
  }

  export class LoadCarBookingDebtSummary {
    static readonly type = '[CarBookingDebt] Load Car Booking Debt Summary';
    constructor(
      public readonly year: number,
      public readonly month: number,
    ) {}
  }

  export class ExportCarBookingDebtExcel {
    static readonly type = '[CarBookingDebt] Export Car Booking Debt Excel';
    constructor(
      public readonly agencyId: string,
      public readonly params: { year: number; month: number; paymentStatus?: string },
    ) {}
  }
}
