# Design: Date Range Filter for Car Booking List

**Date:** 2026-05-12
**Status:** Approved

---

## Overview

Add a date range picker to the car booking list filter bar so users can filter bookings by a custom service date range. When a custom range is selected it overrides the global month filter; clearing it reverts to the global month filter.

---

## Architecture

No new services, state, or actions are needed. The datasource and query params already support `serviceDateFrom` / `serviceDateTo`. The change is purely in the presentation layer: one UI component + wiring logic in the list component.

---

## Components

### Shared `DateRangePicker` (`app-date-range-picker`)

Already exists at `src/app/shared/components/date-range-picker/date-range-picker.ts`.

- Emits `DateRange { start: Date | null; end: Date | null }` via `dateRangeChange` output.
- Exposes a `clear()` method for programmatic reset.

No changes required to this component.

---

## Changes to `CarBookingList`

### Template (`car-booking-list.html`)

Add `app-date-range-picker` to the filter bar between the Payment filter and the Search bar:

```html
<app-date-range-picker
  class="w-full md:max-w-70 flex-shrink-0"
  label="Service Date"
  (dateRangeChange)="onDateRangeChange($event)"
/>
```

### Component (`car-booking-list.ts`)

1. **Import** `DateRangePicker` from `@shared/components` and add it to `imports`.

2. **Add `onDateRangeChange(range: DateRange)` method:**
   - If both `start` and `end` are non-null: format each to `yyyy-MM-dd` using `date-fns` `format()`, then call `dataSource.setFilters({ serviceDateFrom, serviceDateTo })`.
   - If either is null (user cleared): read `this.dateRange()` from the store and call `dataSource.setFilters({ serviceDateFrom: range.startDate, serviceDateTo: range.endDate })` to revert to the global month filter.

3. **No changes** to `filtersForm` — `serviceDateFrom` / `serviceDateTo` controls already exist (they are used only to hold state for the existing global-month-driven logic; the date picker manages its own internal form).

---

## Data Flow

```
User picks range
  → DateRangePicker emits DateRange
    → onDateRangeChange() formats dates
      → dataSource.setFilters({ serviceDateFrom, serviceDateTo })
        → loadData() sends params to BE

User clears range
  → DateRangePicker emits { start: null, end: null }
    → onDateRangeChange() reads MonthFilterState.dateRange
      → dataSource.setFilters({ serviceDateFrom, serviceDateTo })  ← month range
```

---

## Format Contract

Dates sent to the BE must be ISO 8601 format: `YYYY-MM-DD` (e.g. `2026-03-01`).

Use `date-fns` `format(date, 'yyyy-MM-dd')` — already used elsewhere in the project.

---

## Out of Scope

- No min/max date constraints on the picker (BE has no such restriction).
- No URL persistence of the selected range.
- No changes to the global `MonthFilterState`.
