# Cancel Transferred Car Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the cancel button in the car booking list to also cancel transferred bookings by branching on `booking.status` and calling the new `DELETE /car-bookings/:id/transfer` endpoint.

**Architecture:** Status-aware branching inside the existing `onCancel` handler — no new button, no new icon. The `disabled` predicate widens to allow `CONFIRMED` and `TRANSFERRED`. The new endpoint returns `{ originalBooking, compensationBooking }`; only the original is updated in local state because the compensation booking is not shown in the list.

**Tech Stack:** Angular 17+, NGXS, RxJS, Angular Material

---

## File Map

| File | Change |
|------|--------|
| `src/app/core/models/car-booking.model.ts` | Add `CancelTransferResponse` interface |
| `src/app/features/car-services/services/bookings/car-booking.service.ts` | Add `cancelTransfer(id)` method |
| `src/app/features/car-services/store/bookings/car-booking.actions.ts` | Add `CancelTransfer` / `CancelTransferSuccess` / `CancelTransferFailure` |
| `src/app/features/car-services/store/bookings/car-booking.state.ts` | Add 3 action handlers after `cancelCarBookingFailure` block |
| `src/app/features/car-services/configs/car-booking-table-actions.config.ts` | Widen `isCancelDisabled` predicate |
| `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts` | Replace `onCancel` with status-aware version |

---

## Task 1: Add `CancelTransferResponse` interface to the model

**Files:**
- Modify: `src/app/core/models/car-booking.model.ts` (after `TransferCarBookingResponse`)

- [ ] **Step 1: Add the interface**

Open `src/app/core/models/car-booking.model.ts`. Find the existing `TransferCarBookingResponse` interface (around line 141):

```typescript
export interface TransferCarBookingResponse {
  originalBooking: CarBooking;
  transferBooking: CarBooking;
}
```

Add the new interface immediately after it:

```typescript
export interface CancelTransferResponse {
  originalBooking: CarBooking;
  compensationBooking: CarBooking;
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
git commit -m "feat: add CancelTransferResponse interface to car-booking model"
```

---

## Task 2: Add `cancelTransfer` HTTP method to the service

**Files:**
- Modify: `src/app/features/car-services/services/bookings/car-booking.service.ts`

- [ ] **Step 1: Add import**

`CancelTransferResponse` must be imported from the model. The existing import at the top of the file already imports from `@core/models/car-booking.model`. Add `CancelTransferResponse` to it:

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
} from '@core/models/car-booking.model';
```

- [ ] **Step 2: Add the method**

After `cancelCarBooking` (line 53), add:

```typescript
cancelTransfer(id: string): Observable<CancelTransferResponse> {
  return this.delete<CancelTransferResponse>(`${this.endpoint}/${id}/transfer`);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/services/bookings/car-booking.service.ts
git commit -m "feat: add cancelTransfer HTTP method to CarBookingService"
```

---

## Task 3: Add NGXS action triplet

**Files:**
- Modify: `src/app/features/car-services/store/bookings/car-booking.actions.ts`

- [ ] **Step 1: Add import**

Add `CancelTransferResponse` to the import at the top of the actions file:

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
} from '@core/models/car-booking.model';
```

- [ ] **Step 2: Add actions**

Inside the `CarBookingActions` namespace, after the `CancelCarBookingFailure` class (around line 96), add:

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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/store/bookings/car-booking.actions.ts
git commit -m "feat: add CancelTransfer NGXS action triplet"
```

---

## Task 4: Add state handlers

**Files:**
- Modify: `src/app/features/car-services/store/bookings/car-booking.state.ts`

- [ ] **Step 1: Add import**

Add `CancelTransferResponse` to the import from `@core/models/car-booking.model` at the top of the state file:

```typescript
import { CarBooking, CarBookingCountByStatus, CancelTransferResponse } from '@core/models/car-booking.model';
```

- [ ] **Step 2: Add the three handlers**

After the `cancelCarBookingFailure` handler (after line 302, before `// ─── Bulk Payment Status`), add:

```typescript
  // ─── Cancel Transfer ─────────────────────────────────────────────────────────

  @Action(CarBookingActions.CancelTransfer)
  cancelTransfer(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelTransfer,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.cancelTransfer(action.id).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingActions.CancelTransferSuccess(response));
      }),
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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/store/bookings/car-booking.state.ts
git commit -m "feat: add cancelTransfer NGXS state handlers"
```

---

## Task 5: Widen the cancel button disabled predicate

**Files:**
- Modify: `src/app/features/car-services/configs/car-booking-table-actions.config.ts`

- [ ] **Step 1: Update `isCancelDisabled`**

Find (line 16):

```typescript
const isCancelDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.CONFIRMED;
```

Replace with:

```typescript
const isCancelDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.CONFIRMED &&
  booking.status !== CarBookingStatus.TRANSFERRED;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/configs/car-booking-table-actions.config.ts
git commit -m "feat: enable cancel button for transferred bookings"
```

---

## Task 6: Replace `onCancel` with status-aware version

**Files:**
- Modify: `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts`

- [ ] **Step 1: Add `CarBookingActions` import if not already present**

Check the imports at the top of the file. The `CarBookingActions` import must be present — it is already used by `onTransfer`. Confirm it exists:

```typescript
import { CarBookingActions } from '@features/car-services/store/bookings/car-booking.actions';
```

If missing, add it.

- [ ] **Step 2: Replace `onCancel`**

Find the existing `onCancel` method (lines 221–238):

```typescript
onCancel(booking: CarBooking): void {
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: {
      title: 'Cancel Car Booking',
      message: `Are you sure you want to cancel booking "${booking.bookingCode}"?`,
      confirmText: 'Cancel Booking',
      cancelText: 'Close',
      confirmColor: 'warn',
    },
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.dataSource.cancelCarBooking(booking.id);
    }
  });
}
```

Replace it entirely with:

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

- [ ] **Step 3: Ensure `CarBookingStatus` is imported**

The component must import `CarBookingStatus` from the model. Check the existing imports — it is likely already imported as part of `CarBooking`. If not, add it:

```typescript
import { CarBooking, CarBookingStatus } from '@core/models/car-booking.model';
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts
git commit -m "feat: make onCancel status-aware to support cancelling transferred bookings"
```

---

## Manual Verification Checklist

After all tasks are complete, verify the feature end-to-end in the browser:

- [ ] A booking with `status=confirmed` — cancel button is enabled, dialog says "Cancel Car Booking", calls `DELETE /car-bookings/:id`, row updates to `cancelled`
- [ ] A booking with `status=transferred` — cancel button is enabled, dialog says "Cancel Transfer" and mentions both bookings, calls `DELETE /car-bookings/:id/transfer`, row updates to `cancelled`
- [ ] A booking with `status=completed` or `status=cancelled` — cancel button is disabled
- [ ] BE returns a guard error (e.g. payment completed) — error notification appears, row stays unchanged
