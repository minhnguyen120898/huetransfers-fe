import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import {
  CarBooking,
  CarBookingQueryParams,
  CreateCarBookingDto,
  UpdateCarBookingDto,
} from '@core/models/car-booking.model';
import { CarBookingDataService } from './car-booking-data.service';
import { CarBookingStatusFilter } from '../../models/bookings/car-booking.enums';
import { TransportType, CarBookingStatus } from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';

export interface CarBookingTableFilters {
  search?: string;
  status?: CarBookingStatusFilter;
  travelAgencyId?: string;
  vehicleType?: TransportType;
  serviceDateFrom?: string;
  serviceDateTo?: string;
  paymentStatus?: PaymentStatus;
}

@Injectable()
export class CarBookingTableDataSource extends AbstractTableDataSource<CarBooking> {
  private readonly dataService = inject(CarBookingDataService);

  constructor() {
    super();
    this.connectToDataService();
  }

  private connectToDataService(): void {
    this.dataService.carBookings$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((carBookings) => this._data.set(carBookings));

    this.dataService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this._loading.set(loading));

    this.dataService.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this._error.set(error));

    this.dataService.meta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => this._meta.set(meta));
  }

  override loadData(page = 1, pageSize = 20): void {
    const filters = this.filters() as CarBookingTableFilters;

    const params: CarBookingQueryParams = { page, limit: pageSize };

    if (filters.search) params.search = filters.search;
    if (filters.status) {
      params.status = filters.status as unknown as CarBookingStatus;
    }
    if (filters.travelAgencyId) params.travelAgencyId = filters.travelAgencyId;
    if (filters.vehicleType) params.vehicleType = filters.vehicleType;
    if (filters.serviceDateFrom) params.serviceDateFrom = filters.serviceDateFrom;
    if (filters.serviceDateTo) params.serviceDateTo = filters.serviceDateTo;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;

    this.dataService.loadCarBookings(params);
  }

  override refresh(): void {
    this.dataService.refresh();
  }

  createCarBooking(dto: CreateCarBookingDto): void {
    this.dataService.createCarBooking(dto);
  }

  updateCarBooking(id: string, dto: UpdateCarBookingDto): void {
    this.dataService.updateCarBooking(id, dto);
  }

  cancelCarBooking(id: string): void {
    this.dataService.cancelCarBooking(id);
  }

  protected override areRowsEqual(row1: CarBooking, row2: CarBooking): boolean {
    return row1.id === row2.id;
  }
}
