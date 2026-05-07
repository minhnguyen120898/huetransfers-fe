import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';
import { VndCurrencyFormatDirective } from '@shared/directives';
import { CarBooking, UpdateCarBookingTransferPricingDto } from '@core/models/car-booking.model';

export interface EditTransferPricingDialogData {
  booking: CarBooking;
}

interface EditTransferPricingForm {
  compensationAmount: FormControl<number | null>;
  reason: FormControl<string>;
}

@Component({
  selector: 'app-edit-transfer-pricing-dialog',
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
  ],
  template: `
    <app-dialog>
      <app-dialog-header title="Adjust Transfer Compensation" (closed)="onCancel()" />
      <app-dialog-content>
        <form [formGroup]="form" class="space-y-4">
          <mat-form-field
            class="w-full form-field-sm"
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Compensation Amount (×1000đ) *</mat-label>
            <input
              matInput
              type="number"
              formControlName="compensationAmount"
              vndCurrencyFormat
              min="1"
            />
            @if (form.controls.compensationAmount.hasError('required')) {
              <mat-error>Amount is required</mat-error>
            }
            @if (form.controls.compensationAmount.hasError('min')) {
              <mat-error>Must be > 0</mat-error>
            }
          </mat-form-field>

          <mat-form-field
            class="w-full form-field-sm"
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Reason</mat-label>
            <textarea
              matInput
              formControlName="reason"
              rows="3"
              placeholder="Optional reason..."
            ></textarea>
          </mat-form-field>
        </form>
      </app-dialog-content>
      <app-dialog-actions>
        <button matButton="text" (click)="onCancel()">Cancel</button>
        <button matButton="filled" (click)="onSubmit()">
          <mat-icon>price_change</mat-icon>
          Update Pricing
        </button>
      </app-dialog-actions>
    </app-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTransferPricingDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditTransferPricingDialog>);
  readonly data = inject<EditTransferPricingDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group<EditTransferPricingForm>({
    compensationAmount: this.fb.control<number | null>(
      this.data.booking.sellingPrice > 0 ? this.data.booking.sellingPrice / 1000 : null,
      [Validators.required, Validators.min(1)],
    ),
    reason: this.fb.control(''),
  });

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const dto: UpdateCarBookingTransferPricingDto = {
      compensationAmount: (raw.compensationAmount ?? 0) * 1000,
      reason: raw.reason || undefined,
    };
    this.dialogRef.close(dto);
  }
}
