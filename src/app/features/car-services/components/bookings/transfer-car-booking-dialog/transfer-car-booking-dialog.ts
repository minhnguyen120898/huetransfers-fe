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
import { select } from '@ngxs/store';
import { AgencyState } from '@features/agencies/store/agency.state';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';
import { VndCurrencyPipe } from '@shared/pipes';
import { VndCurrencyFormatDirective } from '@shared/directives';
import { CarBooking, TransferCarBookingDto } from '@core/models/car-booking.model';

export interface TransferCarBookingDialogData {
  booking: CarBooking;
}

interface TransferForm {
  partnerAgencyId: FormControl<string>;
  compensationAmount: FormControl<number | null>;
  reason: FormControl<string>;
}

@Component({
  selector: 'app-transfer-car-booking-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
    VndCurrencyPipe,
    VndCurrencyFormatDirective,
  ],
  templateUrl: './transfer-car-booking-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferCarBookingDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<TransferCarBookingDialog>);
  readonly data = inject<TransferCarBookingDialogData>(MAT_DIALOG_DATA);

  readonly agencies = select(AgencyState.agencies);

  readonly compensationAmountSignal = signal<number>(this.data.booking.sellingPrice);

  readonly availablePartners = computed(() =>
    this.agencies().filter((a) => a.id !== this.data.booking.travelAgencyId),
  );

  readonly netCompensation = computed(() => {
    const comp = this.compensationAmountSignal();
    return comp - this.data.booking.receivingPrice;
  });

  readonly transferForm = this.fb.group<TransferForm>({
    partnerAgencyId: this.fb.control('', [Validators.required]),
    compensationAmount: this.fb.control<number | null>(this.data.booking.sellingPrice / 1000, [
      Validators.min(0),
    ]),
    reason: this.fb.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(500),
    ]),
  });

  constructor() {
    this.transferForm.controls.compensationAmount.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.compensationAmountSignal.set((v ?? 0) * 1000));
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const raw = this.transferForm.getRawValue();
    const dto: TransferCarBookingDto = {
      partnerAgencyId: raw.partnerAgencyId,
      reason: raw.reason,
      compensationAmount:
        raw.compensationAmount != null ? raw.compensationAmount * 1000 : undefined,
    };
    this.dialogRef.close(dto);
  }
}
