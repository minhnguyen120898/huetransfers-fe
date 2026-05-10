# Design: Cancel Transferred Car Booking (FE)

**Date:** 2026-05-10
**Status:** Approved
**BE Spec:** `huetransfers-be/docs/superpowers/specs/2026-05-10-cancel-transferred-car-booking-design.md`

---

## Background

The BE added `DELETE /api/v1/car-bookings/:id/transfer` to cancel a transferred booking atomically (both the original `status=transferred` booking and its compensation `isTransfer=true` booking). The FE must expose this via the existing cancel button — same icon, same row position — branching on booking status before calling the right endpoint.

The compensation booking is never shown in the FE list, so only the original booking needs to be updated in local state after success.

---

## Approach

Extend the existing cancel button and `onCancel` handler to be status-aware:

- `status === CONFIRMED` → existing flow (`DELETE /car-bookings/:id`)
- `status === TRANSFERRED` → new flow (`DELETE /car-bookings/:id/transfer`)

No new button. No new icon. The `disabled` predicate widens to allow both statuses.

---

## Changes

### 1. `src/app/core/models/car-booking.model.ts`

Add response interface:

```typescript
export interface CancelTransferResponse {
  originalBooking: CarBooking;
  compensationBooking: CarBooking;
}
```

---

### 2. `src/app/features/car-services/services/bookings/car-booking.service.ts`

Add HTTP method:

```typescript
cancelTransfer(id: string): Observable<CancelTransferResponse> {
  return this.delete<CancelTransferResponse>(`${this.endpoint}/${id}/transfer`);
}
```

---

### 3. `src/app/features/car-services/store/bookings/car-booking.actions.ts`

Add action triplet inside `CarBookingActions` namespace:

```typescript
export class CancelTransfer {
  static readonly type = '[CarBooking] Cancel Transfer';
  constructor(public id: string) {}
}

export class CancelTransferSuccess {
  static readonly type = '[CarBooking] Cancel Transfer Success';
  constructor(public response: CancelTransferResponse) {}
}

export class CancelTransferFailure {
  static readonly type = '[CarBooking] Cancel Transfer Failure';
  constructor(public error: string) {}
}
```

---

### 4. `src/app/features/car-services/store/bookings/car-booking.state.ts`

Add three action handlers after the existing `cancelCarBooking` block:

```typescript
@Action(CarBookingActions.CancelTransfer)
cancelTransfer(ctx: StateContext<CarBookingStateModel>, action: CarBookingActions.CancelTransfer) {
  ctx.patchState({ loading: true, error: null });
  return this.carBookingService.cancelTransfer(action.id).pipe(
    tap((response) => ctx.dispatch(new CarBookingActions.CancelTransferSuccess(response))),
    catchError((error) => {
      ctx.dispatch(
        new CarBookingActions.CancelTransferFailure(
          error.message || 'Failed to cancel transfer',
        ),
      );
      return of(error);
    }),
  );
}

@Action(CarBookingActions.CancelTransferSuccess)
cancelTransferSuccess(
  ctx: StateContext<CarBookingStateModel>,
  action: CarBookingActions.CancelTransferSuccess,
) {
  const { originalBooking } = action.response;
  const carBookings = ctx.getState().carBookings.map((b) =>
    b.id === originalBooking.id ? originalBooking : b,
  );
  ctx.patchState({ carBookings, loading: false, error: null });
  this.notification.showSuccess('Transfer cancelled successfully');
  this.refresh(ctx);
}

@Action(CarBookingActions.CancelTransferFailure)
cancelTransferFailure(
  ctx: StateContext<CarBookingStateModel>,
  action: CarBookingActions.CancelTransferFailure,
) {
  ctx.patchState({ loading: false, error: action.error });
  this.notification.showError('Failed to cancel transfer');
}
```

---

### 5. `src/app/features/car-services/configs/car-booking-table-actions.config.ts`

Widen the `isCancelDisabled` predicate:

```typescript
// Before
const isCancelDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.CONFIRMED;

// After
const isCancelDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.CONFIRMED &&
  booking.status !== CarBookingStatus.TRANSFERRED;
```

Tooltip stays `'Cancel'` — no change needed there.

---

### 6. `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts`

Replace `onCancel` with status-aware version:

```typescript
onCancel(booking: CarBooking): void {
  const isTransfer = booking.status === CarBookingStatus.TRANSFERRED;

  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: {
      title: isTransfer ? 'Cancel Transfer' : 'Cancel Car Booking',
      message: isTransfer
        ? `Are you sure you want to cancel the transfer for booking "${booking.bookingCode}"? This will cancel both the original and the compensation booking.`
        : `Are you sure you want to cancel booking "${booking.bookingCode}"?`,
      confirmText: isTransfer ? 'Cancel Transfer' : 'Cancel Booking',
      cancelText: 'Close',
      confirmColor: 'warn',
    },
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      if (isTransfer) {
        this.store.dispatch(new CarBookingActions.CancelTransfer(booking.id));
      } else {
        this.dataSource.cancelCarBooking(booking.id);
      }
    }
  });
}
```

---

## Data Flow

```
Cancel button clicked (status=TRANSFERRED)
  → ConfirmDialog ("Cancel Transfer" title, explains both bookings cancel)
    → user confirms
      → store.dispatch(CancelTransfer(id))
        → DELETE /car-bookings/:id/transfer
          → CancelTransferSuccess({ originalBooking, compensationBooking })
            → update originalBooking in local state
            → showSuccess('Transfer cancelled successfully')
            → refresh()
```

---

## Out of Scope

- No changes to the detail view (`car-booking-detail-view`) — cancel action lives only in the list
- No tooltip change — stays `'Cancel'` for both statuses
- No changes to `CarBookingActionId` enum — reuses existing `Cancel` id
- Compensation booking is not updated in FE state (not shown in the list)
- No guard logic on the FE side beyond what the button's disabled state already enforces — the BE guards are authoritative
