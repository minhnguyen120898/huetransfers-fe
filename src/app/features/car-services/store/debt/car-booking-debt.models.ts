import {
  CarBookingDebtListResponse,
  CarBookingDebtDetailResponse,
  CarBookingDebtQueryParams,
  CarBookingSummaryResponse,
} from '@core/models/car-booking.model';

export interface CarBookingDebtStateModel {
  debtList: CarBookingDebtListResponse | null;
  selectedAgencyDetail: CarBookingDebtDetailResponse | null;
  loading: boolean;
  detailLoading: boolean;
  exportLoading: boolean;
  error: string | null;
  detailError: string | null;
  lastQueryParams: CarBookingDebtQueryParams | null;
  summary: CarBookingSummaryResponse | null;
  summaryLoading: boolean;
}

export const carBookingDebtStateDefaults: CarBookingDebtStateModel = {
  debtList: null,
  selectedAgencyDetail: null,
  loading: false,
  detailLoading: false,
  exportLoading: false,
  error: null,
  detailError: null,
  lastQueryParams: null,
  summary: null,
  summaryLoading: false,
};
