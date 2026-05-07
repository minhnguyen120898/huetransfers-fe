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
import { MatSelectModule } from '@angular/material/select';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';
import { PaymentStatus } from '@core/models/booking.model';

export interface BulkPaymentDialogData {
  count: number;
}

interface BulkPaymentForm {
  paymentStatus: FormControl<PaymentStatus>;
}

@Component({
  selector: 'app-bulk-payment-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
  ],
  template: `
    <app-dialog>
      <app-dialog-header title="Bulk Update Payment Status" (closed)="onCancel()" />
      <app-dialog-content>
        <p class="text-sm text-gray-600 mb-4">
          Updating payment status for
          <span class="font-semibold">{{ data.count }}</span> booking(s).
        </p>
        <form [formGroup]="form">
          <mat-form-field
            class="w-full form-field-sm"
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Payment Status *</mat-label>
            <mat-select formControlName="paymentStatus">
              <mat-option [value]="PaymentStatus.PENDING">Pending</mat-option>
              <mat-option [value]="PaymentStatus.PARTIAL">Partial</mat-option>
              <mat-option [value]="PaymentStatus.COMPLETED">Completed (Paid)</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </app-dialog-content>
      <app-dialog-actions>
        <button matButton="text" class="btn-rounded-xl" (click)="onCancel()">Cancel</button>
        <button matButton="filled" class="btn-rounded-xl" (click)="onSubmit()">Update</button>
      </app-dialog-actions>
    </app-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkPaymentDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<BulkPaymentDialog>);
  readonly data = inject<BulkPaymentDialogData>(MAT_DIALOG_DATA);

  readonly PaymentStatus = PaymentStatus;

  readonly form = this.fb.group<BulkPaymentForm>({
    paymentStatus: this.fb.control(PaymentStatus.PENDING, [Validators.required]),
  });

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue().paymentStatus);
  }
}
