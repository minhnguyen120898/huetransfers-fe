import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { CarBookingDebtDetailResponse, TransportType } from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';
import { VndCurrencyPipe } from '@shared/pipes';

const TRANSPORT_LABELS: Record<TransportType, string> = {
  [TransportType.SEATS_4]: '4 Seats',
  [TransportType.SEATS_7]: '7 Seats',
  [TransportType.SEATS_16]: '16 Seats',
  [TransportType.SEATS_29]: '29 Seats',
  [TransportType.SEATS_45]: '45 Seats',
};

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'warn',
  [PaymentStatus.PARTIAL]: 'accent',
  [PaymentStatus.COMPLETED]: 'primary',
};

@Component({
  selector: 'app-car-booking-debt-detail',
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    VndCurrencyPipe,
  ],
  template: `
    @if (data; as detail) {
      <div class="p-4 space-y-4 text-sm">
        <!-- Agency info -->
        <div class="space-y-1">
          <p class="font-semibold text-gray-700 text-base">{{ detail.agency.agency.name }}</p>
          @if (detail.agency.agency.tel) {
            <p class="text-gray-500 flex items-center gap-1">
              <mat-icon class="text-base">phone</mat-icon>
              {{ detail.agency.agency.tel }}
            </p>
          }
          @if (detail.agency.agency.address) {
            <p class="text-gray-500 flex items-center gap-1">
              <mat-icon class="text-base">location_on</mat-icon>
              {{ detail.agency.agency.address }}
            </p>
          }
        </div>

        <mat-divider />

        <!-- Summary cards -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500">Total Bookings</p>
            <p class="text-lg font-bold">{{ detail.agency.summary.totalBookings }}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500">Total Guests</p>
            <p class="text-lg font-bold">{{ detail.agency.summary.totalGuests }}</p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <p class="text-xs text-gray-500">Selling Price</p>
            <p class="text-base font-semibold text-blue-700">
              {{ detail.agency.summary.totalSellingPrice | vndCurrency }}
            </p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <p class="text-xs text-gray-500">Receiving Price</p>
            <p class="text-base font-semibold text-green-700">
              {{ detail.agency.summary.totalReceivingPrice | vndCurrency }}
            </p>
          </div>
          <div
            class="p-3 col-span-2 rounded-lg"
            [class.bg-red-50]="!detail.agency.summary.allPaid"
            [class.bg-green-50]="detail.agency.summary.allPaid"
          >
            <p class="text-xs text-gray-500">Total Debt</p>
            <p
              class="text-xl font-bold"
              [class.text-red-600]="!detail.agency.summary.allPaid"
              [class.text-green-600]="detail.agency.summary.allPaid"
            >
              {{ detail.agency.summary.totalDebt | vndCurrency }}
            </p>
          </div>
        </div>

        <mat-divider />

        <!-- Booking line items -->
        <div class="space-y-2">
          <p class="font-semibold text-gray-700">
            Booking Details ({{ detail.month }}/{{ detail.year }})
          </p>
          @for (booking of detail.agency.bookings; track booking.id) {
            <div class="p-3 border border-gray-200 rounded-lg space-y-2 hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <span class="font-mono text-xs font-medium text-gray-700">
                  {{ booking.bookingCode }}
                </span>
                <mat-chip [color]="paymentStatusColor(booking.paymentStatus)" highlighted>
                  {{ booking.paymentStatus }}
                </mat-chip>
              </div>
              <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span class="text-gray-500">Service Date</span>
                <span>{{ booking.serviceDate | date: 'dd/MM/yyyy' }}</span>
                <span class="text-gray-500">Guest</span>
                <span>{{ booking.guestName }} ({{ booking.guestCount }} pax)</span>
                <span class="text-gray-500">Vehicle</span>
                <span>{{ vehicleLabel(booking.vehicleType) }}</span>
                @if (booking.pickupLocation) {
                  <span class="text-gray-500">Pickup</span>
                  <span class="truncate">{{ booking.pickupLocation }}</span>
                }
                <span class="text-gray-500">Selling</span>
                <span class="font-medium">{{ booking.sellingPrice | vndCurrency }}</span>
                <span class="text-gray-500">Receiving</span>
                <span>{{ booking.receivingPrice | vndCurrency }}</span>
                <span class="text-gray-500">Debt</span>
                <span class="font-semibold" [class.text-red-600]="booking.debtAmount > 0">
                  {{ booking.debtAmount | vndCurrency }}
                </span>
                @if (booking.paidAt) {
                  <span class="text-gray-500">Paid At</span>
                  <span>{{ booking.paidAt | date: 'dd/MM/yyyy' }}</span>
                }
              </div>
              @if (booking.note) {
                <p class="text-xs text-gray-500 italic">{{ booking.note }}</p>
              }
            </div>
          }
          @if (detail.agency.bookings.length === 0) {
            <p class="text-center text-gray-400 py-4">No bookings found for this period.</p>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarBookingDebtDetail {
  data: CarBookingDebtDetailResponse | null = null;

  vehicleLabel(type: TransportType): string {
    return TRANSPORT_LABELS[type] ?? type;
  }

  paymentStatusColor(status: PaymentStatus): string {
    return PAYMENT_STATUS_COLOR[status] ?? 'default';
  }
}
