# Edit Original Booking Pricing After Transfer — FE Design

**Date:** 2026-05-11  
**Endpoint:** `PATCH /car-bookings/:id/original-pricing`

---

## Context

The BE added a new endpoint that allows operators to edit `sellingPrice` and `receivingPrice` on a **transferred** car booking. `debtAmount` is recalculated server-side (`sellingPrice - receivingPrice`). The transfer (compensation) booking is never touched.

BE guards (enforced server-side only — no client-side pre-validation):
1. Booking must exist
2. Status must be `transferred`
3. `serviceDate` must be in the current calendar month
4. `paymentStatus` must not be `completed`

On guard failure the API returns 400 with a message — shown via the existing snackbar error flow.

---

## Approach

Create a new dedicated small dialog `EditOriginalPricingDialog` (same pattern as the existing `EditTransferPricingDialog`) that shows only Selling Price and Receiving Price. The Edit button in the table is re-enabled for `transferred` bookings. `onEdit()` in `CarBookingList` branches on status to open the correct dialog.

---

## Behaviour

| Status | Edit button | Dialog opened | Submit action |
|---|---|---|---|
| `confirmed` | enabled | `CarBookingFormDialog` (full edit) | `UpdateCarBooking` |
| `completed` | enabled | `CarBookingFormDialog` (note-only) | `UpdateCarBooking` |
| `transferred` | **enabled** | `EditOriginalPricingDialog` | `UpdateOriginalPricing` → `PATCH /:id/original-pricing` |
| `cancelled` | disabled | — | — |

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/app/core/models/car-booking.model.ts` | Add `UpdateCarOriginalPricingDto` and `UpdateCarOriginalPricingResponse` |
| Modify | `src/app/features/car-services/services/bookings/car-booking.service.ts` | Add `updateOriginalPricing()` HTTP method |
| Modify | `src/app/features/car-services/store/bookings/car-booking.actions.ts` | Add `UpdateOriginalPricing` / `Success` / `Failure` action trio |
| Modify | `src/app/features/car-services/store/bookings/car-booking.state.ts` | Add `@Action` handler trio |
| **Create** | `src/app/features/car-services/components/bookings/edit-original-pricing-dialog/edit-original-pricing-dialog.ts` | New dedicated dialog component |
| Modify | `src/app/features/car-services/configs/car-booking-table-actions.config.ts` | Remove `TRANSFERRED` from `isEditDisabled` |
| Modify | `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts` | Branch `onEdit()` on status |

---

## 1. Model (`car-booking.model.ts`)

Add after `UpdateCarBookingTransferPricingDto`:

```typescript
export interface UpdateCarOriginalPricingDto {
  sellingPrice: number;
  receivingPrice: number;
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

## 5. New Dialog (`edit-original-pricing-dialog.ts`)

Inline-template component, same pattern as `EditTransferPricingDialog`.

- Receives `CarBooking` via `MAT_DIALOG_DATA`
- Shows an amber info banner
- Two fields: Selling Price (×1000đ) and Receiving Price (×1000đ) — both pre-filled from `booking.sellingPrice / 1000` and `booking.receivingPrice / 1000`
- Live Debt Amount display (signal-based, same as `CarBookingFormDialog`)
- `receivingPrice` enabled/disabled mirrors `booking.paymentCollection`: if `COLLECT_FROM_GUEST` → enabled + required; if `NO_COLLECTION` → disabled (pre-filled value shown but not editable)
- Closes with `UpdateCarOriginalPricingDto` on submit, `null` on cancel
- Title: `Edit Pricing — {bookingCode}`

```typescript
export interface EditOriginalPricingDialogData {
  booking: CarBooking;
}
```

---

## 6. Table Actions Config (`car-booking-table-actions.config.ts`)

Change `isEditDisabled` — remove `TRANSFERRED` from the disabled condition:

```typescript
// Before
const isEditDisabled = (booking: CarBooking): boolean =>
  booking.status === CarBookingStatus.CANCELLED || booking.status === CarBookingStatus.TRANSFERRED;

// After
const isEditDisabled = (booking: CarBooking): boolean =>
  booking.status === CarBookingStatus.CANCELLED;
```

---

## 7. Booking List (`car-booking-list.ts`)

Import `EditOriginalPricingDialog` and `UpdateCarOriginalPricingDto`. Branch `onEdit()` on status:

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

  // existing flow unchanged
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

---

## Out of Scope

- No client-side same-month guard (API returns 400, shown as snackbar)
- No client-side payment-completed guard
- Transfer booking is never updated by this flow
- No `reason` field (BE accepts it optionally but product decision is to keep the dialog minimal)
