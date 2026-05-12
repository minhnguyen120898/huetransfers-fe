# Car Booking Date Range Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a date range picker to the car booking list filter bar that overrides the global month filter when a custom range is selected, and reverts to the global month filter when cleared.

**Architecture:** The datasource and query params already support `serviceDateFrom`/`serviceDateTo`. The change is purely in the presentation layer — add the shared `DateRangePicker` component to the filter bar and wire an `onDateRangeChange()` handler that either applies the custom range or falls back to the global month range from `MonthFilterState`.

**Tech Stack:** Angular 17+, Angular Material Datepicker, NGXS, date-fns

---

## Files

| Action | File |
|--------|------|
| Modify | `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts` |
| Modify | `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.html` |

---

### Task 1: Wire the date range handler in the component

**Files:**
- Modify: `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts`

- [ ] **Step 1: Add `DateRangePicker` import and add to the `imports` array**

In `car-booking-list.ts`, add the import at the top:

```typescript
import { DateRangePicker, DateRange } from '@shared/components';
```

Then add `DateRangePicker` to the component `imports` array (alongside the existing `MatSelectModule`):

```typescript
imports: [
  CommonModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatDialogModule,
  DataTable,
  SearchBar,
  TableCard,
  VndCurrencyPipe,
  DateRangePicker,
],
```

- [ ] **Step 2: Add the `onDateRangeChange` method**

Add this method to the `CarBookingList` class, after `onPaymentStatusChange`:

```typescript
onDateRangeChange(range: DateRange): void {
  if (range.start && range.end) {
    this.dataSource.setFilters({
      serviceDateFrom: format(range.start, 'yyyy-MM-dd'),
      serviceDateTo: format(range.end, 'yyyy-MM-dd'),
    });
  } else {
    const monthRange = this.dateRange();
    this.dataSource.setFilters({
      serviceDateFrom: monthRange.startDate,
      serviceDateTo: monthRange.endDate,
    });
  }
}
```

Add the `format` import from `date-fns` at the top of the file (it is already available as a project dependency — used in `month-filter.state.ts`):

```typescript
import { format } from 'date-fns';
```

- [ ] **Step 3: Verify the file compiles**

```bash
cd /Users/minhnn/Documents/workspaces/my-project/huetransfers-fe
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `car-booking-list.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.ts
git commit -m "feat: add onDateRangeChange handler to car booking list"
```

---

### Task 2: Add the date range picker to the filter bar template

**Files:**
- Modify: `src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.html`

- [ ] **Step 1: Insert `app-date-range-picker` between Payment filter and Search bar**

In `car-booking-list.html`, locate the Payment filter block (ends at the closing `</mat-form-field>` for the payment select) and the Search bar block (`<div class="flex-1 md:max-w-64">`). Insert the following between them:

```html
<!-- Date range filter -->
<app-date-range-picker
  class="w-full md:max-w-70 flex-shrink-0"
  label="Service Date"
  (dateRangeChange)="onDateRangeChange($event)"
/>
```

The full filter bar order after the change:

1. Status filter (`mat-select`)
2. Payment filter (`mat-select`)
3. **Date range filter** ← new
4. Search bar
5. Add Booking button

- [ ] **Step 2: Verify the template compiles**

```bash
cd /Users/minhnn/Documents/workspaces/my-project/huetransfers-fe
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/components/bookings/car-booking-list/car-booking-list.html
git commit -m "feat: add date range picker to car booking list filter bar"
```

---

### Task 3: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/minhnn/Documents/workspaces/my-project/huetransfers-fe
npm start
```

- [ ] **Step 2: Verify the date range picker renders**

Open the car bookings list page. Confirm the "Service Date" picker appears between the Payment dropdown and the Search bar.

- [ ] **Step 3: Test custom range selection**

Pick a start and end date. Confirm the table reloads and the network request contains `serviceDateFrom` and `serviceDateTo` query params matching the selected dates in `yyyy-MM-dd` format.

- [ ] **Step 4: Test clearing the range**

Clear the picker (reset to empty). Confirm the table reloads with `serviceDateFrom`/`serviceDateTo` matching the current global month range (first and last day of the selected month from the month picker in the header).

- [ ] **Step 5: Test global month filter interaction**

Change the global month picker. Confirm the table reloads with the new month range (i.e. the `effect()` still fires when no custom range is active, or after the custom range was cleared).
