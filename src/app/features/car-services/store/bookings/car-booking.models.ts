import {
  CarBooking,
  CarBookingCountByStatus,
  CarBookingQueryParams,
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';

export interface CarBookingStateModel {
  carBookings: CarBooking[];
  selectedCarBooking: CarBooking | null;
  loading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
  lastQueryParams: CarBookingQueryParams | null;

  // Count by status
  countByStatus: CarBookingCountByStatus | null;
  countLoading: boolean;
  countError: string | null;
}

export const carBookingStateDefaults: CarBookingStateModel = {
  carBookings: [],
  selectedCarBooking: null,
  loading: false,
  error: null,
  meta: null,
  lastQueryParams: null,
  countByStatus: null,
  countLoading: false,
  countError: null,
};
