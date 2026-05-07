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
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';
import { VndCurrencyFormatDirective } from '@shared/directives';
import {
  CreateExpenseDto,
  Expense,
  ExpenseCategory,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';

export interface ExpenseFormDialogData {
  expense?: Expense;
  defaultMonth?: number;
  defaultYear?: number;
}

interface ExpenseForm {
  title: FormControl<string>;
  amount: FormControl<number | null>;
  category: FormControl<ExpenseCategory | ''>;
  month: FormControl<number | null>;
  year: FormControl<number | null>;
  note: FormControl<string>;
}

@Component({
  selector: 'app-expense-form-dialog',
  imports: [
    CommonModule,
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
    VndCurrencyFormatDirective,
  ],
  template: `
    <app-dialog>
      <app-dialog-header [title]="isEditMode ? 'Edit Expense' : 'Add Expense'" />
      <app-dialog-content>
        <form [formGroup]="form" class="flex flex-col gap-4">
          <!-- Title -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g. Fuel refill" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <!-- Amount -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Amount (thousands VND)</mat-label>
            <input
              matInput
              type="text"
              formControlName="amount"
              placeholder="e.g. 500"
              vndCurrencyFormat
            />
            @if (form.controls.amount.hasError('required')) {
              <mat-error>Amount is required</mat-error>
            }
            @if (form.controls.amount.hasError('min')) {
              <mat-error>Amount must be greater than 0</mat-error>
            }
            <mat-hint>Enter in thousands. e.g. 500 = 500,000 VND</mat-hint>
          </mat-form-field>

          <!-- Category -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option [value]="ExpenseCategory.GASOLINE">Gasoline</mat-option>
              <mat-option [value]="ExpenseCategory.MAINTENANCE">Maintenance</mat-option>
              <mat-option [value]="ExpenseCategory.INSURANCE">Insurance</mat-option>
              <mat-option [value]="ExpenseCategory.BANK">Bank</mat-option>
              <mat-option [value]="ExpenseCategory.OTHER">Other</mat-option>
            </mat-select>
            @if (form.controls.category.hasError('required')) {
              <mat-error>Category is required</mat-error>
            }
          </mat-form-field>

          <!-- Month / Year row -->
          <div class="flex gap-3">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
              <mat-label>Month</mat-label>
              <mat-select formControlName="month">
                @for (m of months; track m.value) {
                  <mat-option [value]="m.value">{{ m.label }}</mat-option>
                }
              </mat-select>
              @if (form.controls.month.hasError('required')) {
                <mat-error>Month is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
              <mat-label>Year</mat-label>
              <input matInput type="number" formControlName="year" placeholder="e.g. 2025" />
              @if (form.controls.year.hasError('required')) {
                <mat-error>Year is required</mat-error>
              }
              @if (form.controls.year.hasError('min') || form.controls.year.hasError('max')) {
                <mat-error>Enter a valid year</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Note -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Note (optional)</mat-label>
            <textarea
              matInput
              formControlName="note"
              rows="3"
              placeholder="Additional notes..."
            ></textarea>
          </mat-form-field>
        </form>
      </app-dialog-content>
      <app-dialog-actions>
        <button matButton="text" (click)="onCancel()">Cancel</button>
        <button matButton="filled" (click)="onSubmit()">
          {{ isEditMode ? 'Save Changes' : 'Add Expense' }}
        </button>
      </app-dialog-actions>
    </app-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ExpenseFormDialog>);
  readonly data: ExpenseFormDialogData = inject(MAT_DIALOG_DATA) ?? {};

  readonly isEditMode = !!this.data.expense;
  readonly ExpenseCategory = ExpenseCategory;

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly form = this.fb.group<ExpenseForm>({
    title: this.fb.control(this.data.expense?.title ?? '', [Validators.required]),
    amount: this.fb.control<number | null>(
      this.data.expense ? this.data.expense.amount / 1000 : null,
      [Validators.required, Validators.min(0.001)],
    ),
    category: this.fb.control<ExpenseCategory | ''>(this.data.expense?.category ?? '', [
      Validators.required,
    ]),
    month: this.fb.control<number | null>(
      this.data.expense?.month ?? this.data.defaultMonth ?? null,
      [Validators.required],
    ),
    year: this.fb.control<number | null>(this.data.expense?.year ?? this.data.defaultYear ?? null, [
      Validators.required,
      Validators.min(2000),
      Validators.max(2100),
    ]),
    note: this.fb.control(this.data.expense?.note ?? ''),
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
    const amount = (raw.amount ?? 0) * 1000;

    if (this.isEditMode) {
      const dto: UpdateExpenseDto = {
        title: raw.title || undefined,
        amount,
        category: (raw.category as ExpenseCategory) || undefined,
        month: raw.month ?? undefined,
        year: raw.year ?? undefined,
        note: raw.note || null,
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateExpenseDto = {
        title: raw.title,
        amount,
        category: raw.category as ExpenseCategory,
        month: raw.month!,
        year: raw.year!,
        note: raw.note || undefined,
      };
      this.dialogRef.close(dto);
    }
  }
}
