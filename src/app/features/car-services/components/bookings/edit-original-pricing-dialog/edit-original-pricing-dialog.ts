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
import { MatIconModule } from '@angular/material/icon';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';
import { VndCurrencyFormatDirective } from '@shared/directives';
import { VndCurrencyPipe } from '@shared/pipes';
import {
  CarBooking,
  CarPaymentCollection,
  UpdateCarOriginalPricingDto,
} from '@core/models/car-booking.model';

export interface EditOriginalPricingDialogData {
  booking: CarBooking;
}

interface EditOriginalPricingForm {
  sellingPrice: FormControl<number | null>;
  receivingPrice: FormControl<number | null>;
}

@Component({
  selector: 'app-edit-original-pricing-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
    VndCurrencyFormatDirective,
    VndCurrencyPipe,
  ],
  template: `
    <app-dialog>
      <app-dialog-header
        [title]="'Edit Pricing — ' + data.booking.bookingCode"
        (closed)="onCancel()"
      />
      <app-dialog-content>
        <div
          class="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2"
        >
          <mat-icon class="text-amber-600 text-lg">price_change</mat-icon>
          Only Selling Price and Receiving Price can be updated for transferred bookings.
        </div>

        <form [formGroup]="form" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <mat-form-field subscriptSizing="dynamic" appearance="outline">
              <mat-label>Selling Price (×1000đ)</mat-label>
              <input matInput type="text" formControlName="sellingPrice" vndCurrencyFormat />
              @if (form.controls.sellingPrice.touched && form.controls.sellingPrice.hasError('required')) {
                <mat-error>Selling price is required</mat-error>
              }
              @if (form.controls.sellingPrice.touched && form.controls.sellingPrice.hasError('min')) {
                <mat-error>Must be ≥ 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field subscriptSizing="dynamic" appearance="outline">
              <mat-label>Receiving Price (×1000đ)</mat-label>
              <input matInput type="text" formControlName="receivingPrice" vndCurrencyFormat />
              @if (form.controls.receivingPrice.touched && form.controls.receivingPrice.hasError('required')) {
                <mat-error>Receiving price is required</mat-error>
              }
              @if (form.controls.receivingPrice.touched && form.controls.receivingPrice.hasError('min')) {
                <mat-error>Must be ≥ 0</mat-error>
              }
            </mat-form-field>
          </div>

          <div
            class="bg-white border-2 rounded-lg p-4"
            [class.border-green-500]="debtAmount() <= 0"
            [class.border-red-500]="debtAmount() > 0"
          >
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Agency Owes (Debt):</span>
              <span
                class="text-xl font-bold"
                [class.text-green-600]="debtAmount() <= 0"
                [class.text-red-600]="debtAmount() > 0"
              >
                {{ debtAmount() | vndCurrency }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">Formula: Selling Price - Receiving Price</div>
          </div>
        </form>
      </app-dialog-content>

      <app-dialog-actions>
        <button matButton="text" class="btn-rounded-xl btn-neutral" (click)="onCancel()">
          Cancel
        </button>
        <button matButton="filled" class="btn-rounded-xl" (click)="onSubmit()">
          <mat-icon>price_change</mat-icon>
          Update Pricing
        </button>
      </app-dialog-actions>
    </app-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOriginalPricingDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditOriginalPricingDialog>);
  readonly data = inject<EditOriginalPricingDialogData>(MAT_DIALOG_DATA);

  readonly sellingPriceSignal = signal<number>(this.data.booking.sellingPrice ?? 0);
  readonly receivingPriceSignal = signal<number>(this.data.booking.receivingPrice ?? 0);

  readonly debtAmount = computed(
    () => (this.sellingPriceSignal() ?? 0) - (this.receivingPriceSignal() ?? 0),
  );

  readonly form = this.fb.group<EditOriginalPricingForm>({
    sellingPrice: this.fb.control<number | null>(
      this.data.booking.sellingPrice != null ? this.data.booking.sellingPrice / 1000 : null,
      [Validators.required, Validators.min(0)],
    ),
    receivingPrice: this.fb.control<number | null>(
      {
        value:
          this.data.booking.receivingPrice != null
            ? this.data.booking.receivingPrice / 1000
            : null,
        disabled:
          this.data.booking.paymentCollection !== CarPaymentCollection.COLLECT_FROM_GUEST,
      },
      [Validators.min(0)],
    ),
  });

  constructor() {
    this.form.controls.sellingPrice.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.sellingPriceSignal.set((v ?? 0) * 1000));

    this.form.controls.receivingPrice.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.receivingPriceSignal.set((v ?? 0) * 1000));

    if (this.data.booking.paymentCollection === CarPaymentCollection.COLLECT_FROM_GUEST) {
      this.form.controls.receivingPrice.addValidators(Validators.required);
      this.form.controls.receivingPrice.updateValueAndValidity();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const dto: UpdateCarOriginalPricingDto = {
      sellingPrice: (raw.sellingPrice ?? 0) * 1000,
      receivingPrice: (raw.receivingPrice ?? 0) * 1000,
    };
    this.dialogRef.close(dto);
  }
}
