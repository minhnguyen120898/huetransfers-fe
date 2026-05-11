# Edit Original Booking Pricing After Transfer — FE Design

**Date:** 2026-05-11
**BE plan:** `huetransfers-be/docs/superpowers/plans/2026-05-11-edit-original-booking-pricing-after-transfer.md`
**Endpoint:** `PATCH /car-bookings/:id/original-pricing`

---

## Context

The BE added a new endpoint that allows operators to edit `sellingPrice` and `receivingPrice` on a **transferred** car booking. `debtAmount` is recalculated server-side (`sellingPrice - receivingPrice`). The transfer (compensation) booking is never touched.

BE guards (enforced server-side only, no client-side pre-validation):
1. Booking must exist
2. Status must be `transferred`
3. `serviceDate` must be in the current calendar month
4. `paymentStatus` must not be `completed`

On guard failure the API returns 400 with a message — shown in a snackbar.

---

## Approach

Reuse `CarBookingFormDialog` with a new `isTransferredMode` branch, mirroring the existing `isCompletedMode` pattern. All other sections are locked; only `sellingPrice` and `receivingPrice` are editable. The submit path calls the new endpoint via a new NGXS action.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/app/core/models/car-booking.model.ts` | Add `UpdateCarOriginalPricingDto` and `UpdateCarOriginalPricingResponse` |
| Modify | `src/app/features/car-services/services/bookings/car-booking.service.ts` | Add `updateOriginalPricing()` HTTP method |
| Modify | `src/app/features/car-services/store/bookings/car-booking.actions.ts` | Add 3 new action classes |
| Modify | `src/app/features/car-services/store/bookings/car-booking.state.ts` | Add `@Action` handler for the new action |
| Modify | `src/app/features/car-services/components/bookings/car-booking-form-dialog/car-booking-form-dialog.ts` | Add `isTransferredMode`, update form init, update `onSubmit()` |
| Modify | `src/app/features/car-services/components/bookings/car-booking-form-dialog/car-booking-form-dialog.html` | Add info banner, update field disabled logic |
| Modify | `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts` | Branch `onEdit()` to dispatch correct action |

---

## 1. Model (`car-booking.model.ts`)

Add after `UpdateCarBookingTransferPricingDto`:

```typescript
export interface UpdateCarOriginalPricingDto {
  sellingPrice: number;
  receivingPrice: number;
  reason?: string;
}

export interface UpdateCarOriginalPricingResponse {
  originalBooking: CarBooking;
}
```

---

## 2. HTTP Service (`car-booking.service.ts`)

Add after `updateTransferPricing()`:

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

Import `UpdateCarOriginalPricingDto` and `UpdateCarOriginalPricingResponse` from `@core/models/car-booking.model`.

---

## 3. NGXS Actions (`car-booking.actions.ts`)

Add after the `UpdateTransferPricing*` trio:

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

Also import `UpdateCarOriginalPricingDto` and `UpdateCarOriginalPricingResponse` at the top.

---

## 4. NGXS State (`car-booking.state.ts`)

Add after the `updateTransferPricingFailure` handler:

```typescript
// ─── Update Original Pricing ─────────────────────────────────────────────────

@Action(CarBookingActions.UpdateOriginalPricing)
updateOriginalPricing(ctx, action) {
  ctx.patchState({ loading: true, error: null });
  return this.carBookingService.updateOriginalPricing(action.originalBookingId, action.dto).pipe(
    tap((response) => ctx.dispatch(new CarBookingActions.UpdateOriginalPricingSuccess(response))),
    catchError((error) => {
      ctx.dispatch(new CarBookingActions.UpdateOriginalPricingFailure(
        error.message || 'Failed to update original pricing',
      ));
      return of(error);
    }),
  );
}

@Action(CarBookingActions.UpdateOriginalPricingSuccess)
updateOriginalPricingSuccess(ctx, action) {
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
updateOriginalPricingFailure(ctx, action) {
  ctx.patchState({ loading: false, error: action.error });
  this.notification.showError(action.error || 'Failed to update original pricing');
}
```

Key difference from `UpdateTransferPricingSuccess`: only `originalBooking` is patched (no transfer booking).

---

## 5. Dialog TypeScript (`car-booking-form-dialog.ts`)

### New getter

```typescript
get isTransferredMode(): boolean {
  return this.booking?.status === CarBookingStatus.TRANSFERRED;
}
```

### Updated `dialogTitle`

```typescript
get dialogTitle(): string {
  if (!this.isEditMode) return 'Add Car Booking';
  if (this.isTransferredMode) return `Edit Pricing — ${this.booking?.bookingCode}`;
  if (this.isCompletedMode) return `Edit Note — ${this.booking?.bookingCode}`;
  return `Edit Car Booking — ${this.booking?.bookingCode}`;
}
```

### Remove `isTransferredMode` from `isReadOnly`

Current `isReadOnly` returns `true` for TRANSFERRED — this must change so the dialog is no longer fully locked:

```typescript
get isReadOnly(): boolean {
  return this.booking?.status === CarBookingStatus.CANCELLED;
}
```

### Form field disabled logic

All fields other than `sellingPrice` / `receivingPrice` add `|| this.isTransferredMode` to their disabled condition:

```typescript
// Example: travelAgencyId, vehicleType, serviceDate, guestName, etc.
disabled: this.isReadOnly || this.isCompletedMode || this.isTransferredMode,
```

`sellingPrice` and `receivingPrice` remain disabled only on `isReadOnly`:

```typescript
sellingPrice: this.fb.control({ value: ..., disabled: this.isReadOnly }),
receivingPrice: this.fb.control({ value: ..., disabled: this.isReadOnly }),
```

### `syncReceivingPrice` — unchanged, runs on init with booking's paymentCollection

The existing `syncReceivingPrice` logic is kept exactly as-is. In transferred mode, `paymentCollection` is disabled (the operator cannot change it), but `syncReceivingPrice` is still called during `constructor()` with the current form value — which reflects `booking.paymentCollection`. This means:

- If the booking has `paymentCollection = COLLECT_FROM_GUEST` → `receivingPrice` is enabled and required
- If the booking has `paymentCollection = NO_COLLECTION` → `receivingPrice` stays disabled

No change needed to `syncReceivingPrice`.

### `onSubmit()` — new branch

```typescript
onSubmit(): void {
  if (this.bookingForm.invalid) {
    this.bookingForm.markAllAsTouched();
    return;
  }
  const raw = this.bookingForm.getRawValue();

  if (this.isTransferredMode) {
    const dto: UpdateCarOriginalPricingDto = {
      sellingPrice: (raw.sellingPrice ?? 0) * 1000,
      receivingPrice: (raw.receivingPrice ?? 0) * 1000,
    };
    this.dialogRef.close(dto);
    return;
  }

  if (this.isCompletedMode) { ... }  // unchanged
  if (this.isEditMode) { ... }        // unchanged
  // create branch unchanged
}
```

Import `UpdateCarOriginalPricingDto` from `@core/models/car-booking.model`.

---

## 6. Dialog Template (`car-booking-form-dialog.html`)

### Add info banner for transferred mode

Insert after the `isCompletedMode` banner block:

```html
@if (isTransferredMode) {
  <div class="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
    <mat-icon class="text-amber-600 text-lg">price_change</mat-icon>
    Only Selling Price and Receiving Price can be updated for transferred bookings.
  </div>
}
```

### Remove the old TRANSFERRED read-only banner reference

The existing banner reads: _"This booking cannot be edited (transferred status)."_ — this will no longer show because `isReadOnly` no longer returns `true` for TRANSFERRED.

### Financial section fields

`sellingPrice` and `receivingPrice` inputs: no change needed — they inherit disabled state from the form control.

All other fields remain disabled via their form control disabled state — no template changes needed for them.

### Submit button

```html
@if (!isReadOnly) {
  <button matButton="filled" class="btn-rounded-xl" (click)="onSubmit()">
    {{ isTransferredMode ? 'Update Pricing' : isEditMode ? 'Save Changes' : 'Create Booking' }}
  </button>
}
```

---

## 7. Booking List (`car-booking-list.ts`)

The `onEdit()` handler opens the dialog and checks the result. After `afterClosed()`:

```typescript
onEdit(booking: CarBooking): void {
  const dialogRef = this.dialog.open(CarBookingFormDialog, {
    width: '600px',
    disableClose: true,
    data: { booking },
  });

  dialogRef.afterClosed().subscribe((dto) => {
    if (!dto) return;

    if (booking.status === CarBookingStatus.TRANSFERRED) {
      this.store
        .dispatch(new CarBookingActions.UpdateOriginalPricing(booking.id, dto))
        .subscribe(() => this.dataSource.refresh());
    } else {
      this.store
        .dispatch(new CarBookingActions.UpdateCarBooking(booking.id, dto))
        .subscribe(() => this.dataSource.refresh());
    }
  });
}
```

Import `UpdateCarOriginalPricingDto` is not needed here — the type is inferred from the dialog close value. The branch on `booking.status` is the discriminator.

---

## Behaviour Summary

| Booking status | Edit button | Dialog mode | Submit action |
|---|---|---|---|
| `confirmed` | enabled | full edit | `UpdateCarBooking` |
| `completed` | enabled | note-only | `UpdateCarBooking` (note field) |
| `transferred` | enabled | pricing-only | `UpdateOriginalPricing` → `PATCH /:id/original-pricing` |
| `cancelled` | disabled | view-only | n/a |

---

## Out of Scope

- No client-side same-month guard (API returns 400, shown as snackbar)
- No client-side payment-completed guard
- Transfer booking is never updated by this flow
- `reason` field is omitted from the FE form (BE accepts it optionally, but the product decision is to keep the dialog minimal — just two fields)
