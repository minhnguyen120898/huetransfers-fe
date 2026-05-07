import { Observable } from 'rxjs';
import {
  CarBooking,
  CarBookingQueryParams,
  CreateCarBookingDto,
  UpdateCarBookingDto,
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';

export abstract class CarBookingDataService {
  abstract readonly carBookings$: Observable<CarBooking[]>;
  abstract readonly loading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;
  abstract readonly meta$: Observable<PaginationMeta | null>;

  abstract loadCarBookings(params?: CarBookingQueryParams): void;
  abstract refresh(): void;
  abstract createCarBooking(dto: CreateCarBookingDto): void;
  abstract updateCarBooking(id: string, dto: UpdateCarBookingDto): void;
  abstract cancelCarBooking(id: string): void;
}
