import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { CarBooking, CarBookingStatus, TransportType } from '@core/models/car-booking.model';
import { VndCurrencyPipe } from '@shared/pipes';

const TRANSPORT_LABELS: Record<TransportType, string> = {
  [TransportType.SEATS_4]: '4 Seats',
  [TransportType.SEATS_7]: '7 Seats',
  [TransportType.SEATS_16]: '16 Seats',
  [TransportType.SEATS_29]: '29 Seats',
  [TransportType.SEATS_45]: '45 Seats',
};

const STATUS_CLASS: Record<CarBookingStatus, string> = {
  [CarBookingStatus.CONFIRMED]: 'blue-chip',
  [CarBookingStatus.COMPLETED]: 'green-chip',
  [CarBookingStatus.CANCELLED]: 'error-chip',
  [CarBookingStatus.TRANSFERRED]: 'orange-chip',
};

@Component({
  selector: 'app-car-booking-detail-view',
  imports: [
    CommonModule,
    DatePipe,
    UpperCasePipe,
    MatChipsModule,
    MatDividerModule,
    VndCurrencyPipe,
  ],
  template: `
    @if (data; as booking) {
      <div class="p-4 space-y-4">
        <!-- Booking Code + Status -->
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Booking Code
            </h4>
            <p class="text-base font-semibold text-gray-900">{{ booking.bookingCode }}</p>
          </div>
          <mat-chip-set>
            <mat-chip [class]="statusClass(booking.status)">
              {{ booking.status | uppercase }}
            </mat-chip>
            @if (booking.isTransfer) {
              <mat-chip class="orange-chip">Transfer Record</mat-chip>
            }
          </mat-chip-set>
        </div>

        <mat-divider />

        <!-- Trip Details -->
        <div class="pt-4">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Trip Details</h4>
          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Service Date:</span>
              <span class="text-sm font-semibold text-gray-900">{{
                booking.serviceDate | date: 'dd/MM/yyyy'
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Vehicle:</span>
              <span class="text-sm font-semibold text-gray-900">{{
                vehicleLabel(booking.vehicleType)
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Agency:</span>
              <span class="text-sm font-semibold text-gray-900">{{
                booking.travelAgency?.name || '—'
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">VAT:</span>
              <span class="text-sm font-semibold text-gray-900">{{
                booking.vat ? 'Yes' : 'No'
              }}</span>
            </div>
          </div>
        </div>

        <mat-divider />

        <!-- Guest Information -->
        <div class="pt-4">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
            Guest Information
          </h4>
          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Name:</span>
              <span class="text-sm font-semibold text-gray-900">{{ booking.guestName }}</span>
            </div>
            @if (booking.guestPhone) {
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Phone:</span>
                <span class="text-sm font-semibold text-gray-900">{{ booking.guestPhone }}</span>
              </div>
            }
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Guest Count:</span>
              <span class="text-sm font-semibold text-gray-900">{{ booking.guestCount }} pax</span>
            </div>
          </div>
        </div>

        @if (booking.pickupLocation || booking.dropoffLocation) {
          <mat-divider />
          <div class="pt-4">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Locations</h4>
            <div class="space-y-1.5">
              @if (booking.pickupLocation) {
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Pickup:</span>
                  <span class="text-sm font-semibold text-gray-900">{{
                    booking.pickupLocation
                  }}</span>
                </div>
              }
              @if (booking.dropoffLocation) {
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Dropoff:</span>
                  <span class="text-sm font-semibold text-gray-900">{{
                    booking.dropoffLocation
                  }}</span>
                </div>
              }
            </div>
          </div>
        }

        <mat-divider />

        <!-- Financial Details -->
        <div class="pt-4">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
            Financial Details
          </h4>
          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Selling Price:</span>
              <span class="text-sm font-bold text-blue-600">{{
                booking.sellingPrice | vndCurrency
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Receiving Price:</span>
              <span class="text-sm font-bold text-emerald-600">{{
                booking.receivingPrice | vndCurrency
              }}</span>
            </div>
            <div class="flex justify-between items-center pt-1.5 mt-1.5 border-t border-gray-200">
              <span class="text-sm text-gray-700 font-semibold">Debt Amount:</span>
              <span class="text-sm font-bold text-rose-600">{{
                booking.debtAmount | vndCurrency
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Payment Status:</span>
              <span class="text-sm font-semibold text-gray-900 capitalize">{{
                booking.paymentStatus
              }}</span>
            </div>
            @if (booking.paidAt) {
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Paid At:</span>
                <span class="text-sm font-semibold text-gray-900">{{
                  booking.paidAt | date: 'dd/MM/yyyy HH:mm'
                }}</span>
              </div>
            }
            @if (booking.paymentCollectionNote) {
              <div class="pt-1.5">
                <span class="text-xs font-semibold text-gray-700 uppercase">Collection Note:</span>
                <p class="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  {{ booking.paymentCollectionNote }}
                </p>
              </div>
            }
          </div>
        </div>

        @if (booking.transferBookings.length > 0) {
          <mat-divider />
          <div class="pt-4">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
              Transfer Information
            </h4>
            @for (transfer of booking.transferBookings; track transfer.id) {
              <div class="space-y-1.5 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Partner Agency:</span>
                  <span class="text-sm font-semibold text-gray-900">{{
                    transfer.transferToAgency?.name || '—'
                  }}</span>
                </div>
                <div class="pt-1.5 mt-1.5 border-t border-amber-300 space-y-1.5">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Compensation:</span>
                    <span class="text-sm font-bold text-blue-600">{{
                      transfer.sellingPrice | vndCurrency
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between items-center pt-1.5 mt-1.5 border-t border-amber-300"
                  >
                    <span class="text-sm text-gray-700 font-semibold">Net Debt:</span>
                    <span
                      class="text-sm font-bold"
                      [class.text-rose-600]="transfer.debtAmount < 0"
                      [class.text-emerald-600]="transfer.debtAmount >= 0"
                    >
                      {{ transfer.debtAmount | vndCurrency }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @if (booking.note) {
          <mat-divider />
          <div class="mb-4 pt-4">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
              Booking Notes
            </h4>
            <p
              class="text-xs text-gray-700 bg-amber-50 border-l-3 border-amber-400 p-2.5 rounded leading-relaxed"
            >
              {{ booking.note }}
            </p>
          </div>
        }

        <mat-divider />

        <!-- Audit Trail -->
        <div class="mb-2 pt-4">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Audit Trail</h4>
          <div class="text-xs text-gray-600 space-y-1 bg-slate-50 p-2.5 rounded">
            <div class="flex justify-between items-center">
              <span>Created:</span>
              <span class="font-medium text-gray-900">{{
                booking.createdAt | date: 'dd/MM/yyyy HH:mm'
              }}</span>
            </div>
            <div class="flex justify-between items-center pt-1 mt-1 border-t border-gray-200">
              <span>Updated:</span>
              <span class="font-medium text-gray-900">{{
                booking.updatedAt | date: 'dd/MM/yyyy HH:mm'
              }}</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarBookingDetailView {
  // Plain property — assigned directly by RightSideSheetContainer
  data: CarBooking | null = null;

  vehicleLabel(type: TransportType): string {
    return TRANSPORT_LABELS[type] ?? type;
  }

  statusClass(status: CarBookingStatus): string {
    return STATUS_CLASS[status] ?? '';
  }
}
