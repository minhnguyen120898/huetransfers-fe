import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { select } from '@ngxs/store';
import { AgencyState } from '@features/agencies/store/agency.state';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  AgencyAutocomplete,
} from '@shared/components';
import { VndCurrencyPipe } from '@shared/pipes';
import { VndCurrencyFormatDirective } from '@shared/directives';
import {
  CarBooking,
  CarBookingStatus,
  CarPaymentCollection,
  CreateCarBookingDto,
  TransportType,
  UpdateCarBookingDto,
} from '@core/models/car-booking.model';
import { DateFormat, formatDate } from '@core/config';

export interface CarBookingFormDialogData {
  booking?: CarBooking;
}

interface CarBookingForm {
  travelAgencyId: FormControl<string>;
  vehicleType: FormControl<TransportType | ''>;
  serviceDate: FormControl<Date | null>;
  guestName: FormControl<string>;
  guestPhone: FormControl<string>;
  guestCount: FormControl<number>;
  pickupLocation: FormControl<string>;
  dropoffLocation: FormControl<string>;
  vat: FormControl<boolean>;
  sellingPrice: FormControl<number | null>;
  receivingPrice: FormControl<number | null>;
  paymentCollection: FormControl<CarPaymentCollection | ''>;
  paymentCollectionNote: FormControl<string>;
  note: FormControl<string>;
  routes: FormControl<string>;
}

@Component({
  selector: 'app-car-booking-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDatepickerModule,
    AgencyAutocomplete,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
    VndCurrencyPipe,
    VndCurrencyFormatDirective,
  ],
  templateUrl: './car-booking-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarBookingFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<CarBookingFormDialog>);
  readonly data = inject<CarBookingFormDialogData | null>(MAT_DIALOG_DATA);

  readonly agencies = select(AgencyState.agencies);

  readonly TransportType = TransportType;
  readonly CarPaymentCollection = CarPaymentCollection;
  readonly CarBookingStatus = CarBookingStatus;

  get isEditMode(): boolean {
    return !!this.data?.booking;
  }

  get booking(): CarBooking | undefined {
    return this.data?.booking;
  }

  get isReadOnly(): boolean {
    const status = this.booking?.status;
    return status === CarBookingStatus.CANCELLED || status === CarBookingStatus.TRANSFERRED;
  }

  get isCompletedMode(): boolean {
    return this.booking?.status === CarBookingStatus.COMPLETED;
  }

  get dialogTitle(): string {
    if (!this.isEditMode) return 'Add Car Booking';
    if (this.isReadOnly) return `View Car Booking — ${this.booking?.bookingCode}`;
    if (this.isCompletedMode) return `Edit Note — ${this.booking?.bookingCode}`;
    return `Edit Car Booking — ${this.booking?.bookingCode}`;
  }

  // Signals for reactive computation
  readonly sellingPriceSignal = signal<number>(this.booking?.sellingPrice ?? 0);
  readonly receivingPriceSignal = signal<number>(this.booking?.receivingPrice ?? 0);

  readonly debtAmount = computed(
    () => (this.sellingPriceSignal() ?? 0) - (this.receivingPriceSignal() ?? 0),
  );

  readonly bookingForm = this.fb.group<CarBookingForm>({
    travelAgencyId: this.fb.control(
      {
        value: this.booking?.travelAgencyId ?? '',
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required],
    ),
    vehicleType: this.fb.control<TransportType | ''>(
      {
        value: (this.booking?.vehicleType as TransportType) ?? '',
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required],
    ),
    serviceDate: this.fb.control<Date | null>(
      {
        value: this.booking?.serviceDate ? new Date(this.booking.serviceDate) : null,
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required],
    ),
    guestName: this.fb.control(
      {
        value: this.booking?.guestName ?? '',
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required, Validators.minLength(2), Validators.maxLength(200)],
    ),
    guestPhone: this.fb.control({
      value: this.booking?.guestPhone ?? '',
      disabled: this.isReadOnly || this.isCompletedMode,
    }),
    guestCount: this.fb.control(
      {
        value: this.booking?.guestCount ?? 1,
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required, Validators.min(1), Validators.max(100)],
    ),
    pickupLocation: this.fb.control({
      value: this.booking?.pickupLocation ?? '',
      disabled: this.isReadOnly || this.isCompletedMode,
    }),
    dropoffLocation: this.fb.control({
      value: this.booking?.dropoffLocation ?? '',
      disabled: this.isReadOnly || this.isCompletedMode,
    }),
    vat: this.fb.control({
      value: this.booking?.vat ?? false,
      disabled: this.isReadOnly || this.isCompletedMode,
    }),
    sellingPrice: this.fb.control<number | null>(
      {
        value: this.booking?.sellingPrice != null ? this.booking.sellingPrice / 1000 : null,
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required, Validators.min(0)],
    ),
    receivingPrice: this.fb.control<number | null>(
      {
        value: this.booking?.receivingPrice != null ? this.booking.receivingPrice / 1000 : null,
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.min(0)],
    ),
    paymentCollection: this.fb.control<CarPaymentCollection | ''>(
      {
        value:
          (this.booking?.paymentCollection as CarPaymentCollection) ??
          CarPaymentCollection.NO_COLLECTION,
        disabled: this.isReadOnly || this.isCompletedMode,
      },
      [Validators.required],
    ),
    paymentCollectionNote: this.fb.control({
      value: this.booking?.paymentCollectionNote ?? '',
      disabled: this.isReadOnly || this.isCompletedMode,
    }),
    note: this.fb.control({ value: this.booking?.note ?? '', disabled: this.isReadOnly }),
    routes: this.fb.control({
      value: this.booking?.routes ?? '',
      disabled: this.isReadOnly || this.isCompletedMode,
    }),
  });

  constructor() {
    this.bookingForm.controls.sellingPrice.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.sellingPriceSignal.set((v ?? 0) * 1000));

    this.bookingForm.controls.receivingPrice.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.receivingPriceSignal.set((v ?? 0) * 1000));

    this.bookingForm.controls.paymentCollection.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.syncReceivingPrice(value));

    this.syncReceivingPrice(this.bookingForm.controls.paymentCollection.value);
  }

  private syncReceivingPrice(paymentCollection: CarPaymentCollection | ''): void {
    if (this.isReadOnly || this.isCompletedMode) return;
    const ctrl = this.bookingForm.controls.receivingPrice;
    if (paymentCollection === CarPaymentCollection.COLLECT_FROM_GUEST) {
      ctrl.enable();
      ctrl.addValidators(Validators.required);
    } else {
      ctrl.disable();
      ctrl.removeValidators(Validators.required);
    }
    ctrl.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const raw = this.bookingForm.getRawValue();

    if (this.isCompletedMode) {
      // Only note can be updated for completed bookings
      const dto: UpdateCarBookingDto = { note: raw.note || undefined };
      this.dialogRef.close(dto);
      return;
    }

    const serviceDate = raw.serviceDate ? formatDate(raw.serviceDate, DateFormat.ISO_DATE) : '';

    if (this.isEditMode) {
      const dto: UpdateCarBookingDto = {
        travelAgencyId: raw.travelAgencyId || undefined,
        vehicleType: raw.vehicleType as TransportType,
        serviceDate,
        guestName: raw.guestName,
        guestPhone: raw.guestPhone || undefined,
        guestCount: raw.guestCount,
        pickupLocation: raw.pickupLocation || undefined,
        dropoffLocation: raw.dropoffLocation || undefined,
        vat: raw.vat,
        sellingPrice: (raw.sellingPrice ?? 0) * 1000,
        receivingPrice: (raw.receivingPrice ?? 0) * 1000,
        paymentCollection: raw.paymentCollection as CarPaymentCollection,
        paymentCollectionNote: raw.paymentCollectionNote || undefined,
        note: raw.note || undefined,
        routes: raw.routes || undefined,
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateCarBookingDto = {
        travelAgencyId: raw.travelAgencyId || undefined,
        vehicleType: raw.vehicleType as TransportType,
        serviceDate,
        guestName: raw.guestName,
        guestPhone: raw.guestPhone || undefined,
        guestCount: raw.guestCount,
        pickupLocation: raw.pickupLocation || undefined,
        dropoffLocation: raw.dropoffLocation || undefined,
        vat: raw.vat,
        sellingPrice: (raw.sellingPrice ?? 0) * 1000,
        receivingPrice: (raw.receivingPrice ?? 0) * 1000,
        paymentCollection: raw.paymentCollection as CarPaymentCollection,
        paymentCollectionNote: raw.paymentCollectionNote || undefined,
        note: raw.note || undefined,
        routes: raw.routes || undefined,
      };
      this.dialogRef.close(dto);
    }
  }
}
