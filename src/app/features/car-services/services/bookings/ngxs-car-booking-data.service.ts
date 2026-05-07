import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { CarBookingDataService } from './car-booking-data.service';
import {
  CarBooking,
  CarBookingQueryParams,
  CreateCarBookingDto,
  UpdateCarBookingDto,
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';
import { CarBookingState } from '../../store/bookings/car-booking.state';
import { CarBookingActions } from '../../store/bookings/car-booking.actions';

@Injectable()
export class NgxsCarBookingDataService extends CarBookingDataService {
  private readonly store = inject(Store);

  readonly carBookings$: Observable<CarBooking[]> = this.store.select(CarBookingState.carBookings);
  readonly loading$: Observable<boolean> = this.store.select(CarBookingState.loading);
  readonly error$: Observable<string | null> = this.store.select(CarBookingState.error);
  readonly meta$: Observable<PaginationMeta | null> = this.store.select(CarBookingState.meta);

  loadCarBookings(params?: CarBookingQueryParams): void {
    this.store.dispatch(new CarBookingActions.LoadCarBookings(params));
  }

  refresh(): void {
    const lastParams = this.store.selectSnapshot(CarBookingState.lastQueryParams);
    this.store.dispatch(new CarBookingActions.LoadCarBookings({ ...lastParams, page: 1 }));
  }

  createCarBooking(dto: CreateCarBookingDto): void {
    this.store.dispatch(new CarBookingActions.CreateCarBooking(dto));
  }

  updateCarBooking(id: string, dto: UpdateCarBookingDto): void {
    this.store.dispatch(new CarBookingActions.UpdateCarBooking(id, dto));
  }

  cancelCarBooking(id: string): void {
    this.store.dispatch(new CarBookingActions.CancelCarBooking(id));
  }
}
