# Edit Original Booking Pricing After Transfer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable operators to edit `sellingPrice` and `receivingPrice` on a transferred car booking via a new dedicated dialog, using the existing Edit button.

**Architecture:** A new `EditOriginalPricingDialog` (inline-template, same pattern as `EditTransferPricingDialog`) is opened from `onEdit()` when `booking.status === TRANSFERRED`. The Edit button is re-enabled for transferred bookings. A new NGXS action trio (`UpdateOriginalPricing` / `Success` / `Failure`) calls `PATCH /car-bookings/:id/original-pricing` and patches only `originalBooking` in state.

**Tech Stack:** Angular 18, NGXS, Angular Material, RxJS, TypeScript

---

### Task 1: Add DTOs to the model

**Files:**
- Modify: `src/app/core/models/car-booking.model.ts`

- [ ] **Step 1: Add the two new interfaces**

Open `src/app/core/models/car-booking.model.ts`. After the `UpdateCarBookingTransferPricingDto` interface (line ~151), add:

```typescript
export interface UpdateCarOriginalPricingDto {
  sellingPrice: number;
  receivingPrice: number;
}

export interface UpdateCarOriginalPricingResponse {
  originalBooking: CarBooking;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/core/models/car-booking.model.ts
git commit -m "feat: add UpdateCarOriginalPricingDto and UpdateCarOriginalPricingResponse models"
```

---

### Task 2: Add HTTP method to service

**Files:**
- Modify: `src/app/features/car-services/services/bookings/car-booking.service.ts`

- [ ] **Step 1: Import new DTOs and add method**

Open `src/app/features/car-services/services/bookings/car-booking.service.ts`.

Update the import from `@core/models/car-booking.model` to include `UpdateCarOriginalPricingDto` and `UpdateCarOriginalPricingResponse`:

```typescript
import {
  BulkPaymentStatusDto,
  BulkPaymentStatusResponse,
  CarBooking,
  CarBookingCountByStatus,
  CarBookingCountParams,
  CarBookingQueryParams,
  CancelTransferResponse,
  CreateCarBookingDto,
  TransferCarBookingDto,
  TransferCarBookingResponse,
  UpdateCarBookingDto,
  UpdateCarBookingTransferPricingDto,
  UpdateCarOriginalPricingDto,
  UpdateCarOriginalPricingResponse,
} from '@core/models/car-booking.model';
```

After `updateTransferPricing()`, add:

```typescript
updateOriginalPricing(
  id: string,
  dto: UpdateCarOriginalPricingDto,
): Observable<UpdateCarOriginalPricingResponse> {
  return this.patch<UpdateCarOriginalPricingResponse>(
    `${this.endpoint}/${id}/original-pricing`,
    dto,
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/services/bookings/car-booking.service.ts
git commit -m "feat: add updateOriginalPricing HTTP method to CarBookingService"
```

---

### Task 3: Add NGXS action trio

**Files:**
- Modify: `src/app/features/car-services/store/bookings/car-booking.actions.ts`

- [ ] **Step 1: Import new DTOs**

Open `src/app/features/car-services/store/bookings/car-booking.actions.ts`.

Update the import from `@core/models/car-booking.model` to include `UpdateCarOriginalPricingDto` and `UpdateCarOriginalPricingResponse`:

```typescript
import {
  BulkPaymentStatusDto,
  BulkPaymentStatusResponse,
  CarBooking,
  CarBookingCountByStatus,
  CarBookingCountParams,
  CarBookingQueryParams,
  CancelTransferResponse,
  CreateCarBookingDto,
  TransferCarBookingDto,
  TransferCarBookingResponse,
  UpdateCarBookingDto,
  UpdateCarBookingTransferPricingDto,
  UpdateCarOriginalPricingDto,
  UpdateCarOriginalPricingResponse,
} from '@core/models/car-booking.model';
```

- [ ] **Step 2: Add action classes**

After the `UpdateTransferPricingFailure` class and before `SelectCarBooking`, add:

```typescript
  export class UpdateOriginalPricing {
    static readonly type = '[CarBooking] Update Original Pricing';
    constructor(
      public originalBookingId: string,
      public dto: UpdateCarOriginalPricingDto,
    ) {}
  }

  export class UpdateOriginalPricingSuccess {
    static readonly type = '[CarBooking] Update Original Pricing Success';
    constructor(public response: UpdateCarOriginalPricingResponse) {}
  }

  export class UpdateOriginalPricingFailure {
    static readonly type = '[CarBooking] Update Original Pricing Failure';
    constructor(public error: string) {}
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/store/bookings/car-booking.actions.ts
git commit -m "feat: add UpdateOriginalPricing NGXS action trio"
```

---

### Task 4: Add NGXS state handlers

**Files:**
- Modify: `src/app/features/car-services/store/bookings/car-booking.state.ts`

- [ ] **Step 1: Import new DTOs (already available via actions, but add to state imports if needed)**

Open `src/app/features/car-services/store/bookings/car-booking.state.ts`.

Update the import from `@core/models/car-booking.model` to include `UpdateCarOriginalPricingResponse`:

```typescript
import { CarBooking, CarBookingCountByStatus, UpdateCarOriginalPricingResponse } from '@core/models/car-booking.model';
```

- [ ] **Step 2: Add the three action handlers**

After the `updateTransferPricingFailure` handler (end of the `// ─── Update Transfer Pricing` section), add:

```typescript
  // ─── Update Original Pricing ─────────────────────────────────────────────────

  @Action(CarBookingActions.UpdateOriginalPricing)
  updateOriginalPricing(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateOriginalPricing,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService
      .updateOriginalPricing(action.originalBookingId, action.dto)
      .pipe(
        tap((response) =>
          ctx.dispatch(new CarBookingActions.UpdateOriginalPricingSuccess(response)),
        ),
        catchError((error) => {
          ctx.dispatch(
            new CarBookingActions.UpdateOriginalPricingFailure(
              error.message || 'Failed to update original pricing',
            ),
          );
          return of(error);
        }),
      );
  }

  @Action(CarBookingActions.UpdateOriginalPricingSuccess)
  updateOriginalPricingSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateOriginalPricingSuccess,
  ) {
    const state = ctx.getState();
    const carBookings = state.carBookings.map((b) =>
      b.id === action.response.originalBooking.id ? action.response.originalBooking : b,
    );
    ctx.patchState({
      carBookings,
      selectedCarBooking:
        state.selectedCarBooking?.id === action.response.originalBooking.id
          ? action.response.originalBooking
          : state.selectedCarBooking,
      loading: false,
      error: null,
    });
    this.notification.showSuccess('Original pricing updated successfully');
  }

  @Action(CarBookingActions.UpdateOriginalPricingFailure)
  updateOriginalPricingFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateOriginalPricingFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError(action.error || 'Failed to update original pricing');
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/store/bookings/car-booking.state.ts
git commit -m "feat: add UpdateOriginalPricing NGXS state handlers"
```

---

### Task 5: Create EditOriginalPricingDialog

**Files:**
- Create: `src/app/features/car-services/components/bookings/edit-original-pricing-dialog/edit-original-pricing-dialog.ts`

- [ ] **Step 1: Create the file**

Create `src/app/features/car-services/components/bookings/edit-original-pricing-dialog/edit-original-pricing-dialog.ts` with the following content:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/components/bookings/edit-original-pricing-dialog/edit-original-pricing-dialog.ts
git commit -m "feat: add EditOriginalPricingDialog for transferred booking pricing edit"
```

---

### Task 6: Re-enable Edit button for transferred bookings

**Files:**
- Modify: `src/app/features/car-services/configs/car-booking-table-actions.config.ts`

- [ ] **Step 1: Update isEditDisabled**

Open `src/app/features/car-services/configs/car-booking-table-actions.config.ts`.

Change `isEditDisabled` from:

```typescript
const isEditDisabled = (booking: CarBooking): boolean =>
  booking.status === CarBookingStatus.CANCELLED || booking.status === CarBookingStatus.TRANSFERRED;
```

To:

```typescript
const isEditDisabled = (booking: CarBooking): boolean =>
  booking.status === CarBookingStatus.CANCELLED;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/configs/car-booking-table-actions.config.ts
git commit -m "feat: re-enable Edit button for transferred bookings"
```

---

### Task 7: Wire up onEdit() in CarBookingList

**Files:**
- Modify: `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts`

- [ ] **Step 1: Add imports**

Open `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts`.

Add to the existing `@core/models/car-booking.model` import:

```typescript
import {
  CarBooking,
  CarBookingStatus,
  CarBookingQueryParams,
  CreateCarBookingDto,
  UpdateCarBookingDto,
  TransferCarBookingDto,
  UpdateCarBookingTransferPricingDto,
  UpdateCarOriginalPricingDto,
} from '@core/models/car-booking.model';
```

Add `EditOriginalPricingDialog` to the component-level imports at the top of the file:

```typescript
import { EditOriginalPricingDialog } from '../edit-original-pricing-dialog/edit-original-pricing-dialog';
```

Also add `EditOriginalPricingDialog` to the `imports` array inside `@Component`:

```typescript
imports: [
  // ...existing imports...
  EditOriginalPricingDialog,
],
```

- [ ] **Step 2: Replace onEdit() with the branching version**

Replace the current `onEdit()` method:

```typescript
onEdit(booking: CarBooking): void {
  if (booking.status === CarBookingStatus.TRANSFERRED) {
    const dialogRef = this.dialog.open(EditOriginalPricingDialog, {
      width: '450px',
      disableClose: true,
      data: { booking },
    });
    dialogRef.afterClosed().subscribe((dto: UpdateCarOriginalPricingDto | null) => {
      if (dto) {
        this.store
          .dispatch(new CarBookingActions.UpdateOriginalPricing(booking.id, dto))
          .subscribe(() => this.dataSource.refresh());
      }
    });
    return;
  }

  const dialogRef = this.dialog.open(CarBookingFormDialog, {
    ...LARGE_DIALOG,
    disableClose: true,
    data: { booking },
  });
  dialogRef.afterClosed().subscribe((result: UpdateCarBookingDto | null) => {
    if (result) {
      this.dataSource.updateCarBooking(booking.id, result);
    }
  });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts
git commit -m "feat: branch onEdit() for transferred bookings to open EditOriginalPricingDialog"
```

---

### Task 8: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
npm start
```

- [ ] **Step 2: Test transferred booking Edit button**

1. Navigate to the Car Bookings list
2. Find (or create and transfer) a booking with status `transferred`
3. Confirm the Edit button (pencil icon) is **enabled** for that row
4. Click Edit — verify `EditOriginalPricingDialog` opens (title: "Edit Pricing — {bookingCode}", amber banner, two price fields, debt display)
5. Modify Selling Price, click "Update Pricing"
6. Verify success snackbar appears and the row updates in the table

- [ ] **Step 3: Test non-transferred Edit button still works**

1. Click Edit on a `confirmed` booking — verify `CarBookingFormDialog` opens with the full form
2. Click Edit on a `completed` booking — verify `CarBookingFormDialog` opens in note-only mode

- [ ] **Step 4: Test cancelled booking Edit button is still disabled**

1. Find a `cancelled` booking — verify the Edit button is disabled

- [ ] **Step 5: Test receivingPrice disabled when paymentCollection = NO_COLLECTION**

1. Open Edit on a transferred booking with `paymentCollection = no_collection`
2. Verify the Receiving Price field is disabled (greyed out)

- [ ] **Step 6: Test API error shown as snackbar**

1. If the BE is running locally, try editing a transferred booking from a previous month — verify the 400 error message appears in the snackbar
