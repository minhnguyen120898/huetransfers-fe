# Car Transfer Pagination — FE Adaptation Design

**Date:** 2026-05-11  
**Trigger:** BE split `GET /profit/car-summary` — transfers array removed, new `GET /profit/car-transfers?year&month&page&limit` endpoint added.  
**Goal:** Replace the inline transfer table inside the profit summary card with a fully paginated `CarTransferList` component that follows the existing `AbstractTableDataSource` / NGXS pattern used by `CarBookingList`.

---

## Context

The profit tab currently renders a single `<app-car-profit-summary>` component that:
1. Calls `GET /profit/car-summary` (returns aggregates + `transfers[]` array inline).
2. Renders an inline `@for` table of transfer rows inside the card.

After the BE change:
- `GET /profit/car-summary` no longer includes `transfers[]`.
- `GET /profit/car-transfers?year&month&page&limit` returns `{ data: CarTransferDetail[], meta: { total, page, limit } }`.

---

## Architecture

The solution mirrors the `CarBookingList` stack exactly:

```
MonthFilterState (year/month)
        │  effect()
        ▼
CarTransferList (component)
        │  loadData(page, limit)
        ▼
CarTransferTableDataSource (AbstractTableDataSource<CarTransferDetail>)
        │  loadTransfers(params)
        ▼
CarTransferDataService (abstract)   ←── NgxsCarTransferDataService (concrete)
                                              │  dispatch
                                              ▼
                                        CarTransferState (NGXS)
                                              │  HTTP
                                              ▼
                                        CarProfitService.getCarTransfers()
                                              │
                                              ▼
                                        GET /profit/car-transfers
```

---

## File Map

### Models (modify)
| File | Change |
|------|--------|
| `models/profit/car-profit.model.ts` | Remove `transfers` from `CarTransferFinancials`. Add `CarTransferQueryParams`, `PaginatedCarTransfers`. |

### HTTP Service (modify)
| File | Change |
|------|--------|
| `services/profit/car-profit.service.ts` | Add `getCarTransfers(params: CarTransferQueryParams)` calling `GET /profit/car-transfers`. |

### Data Service layer (new)
| File | Purpose |
|------|---------|
| `services/profit/car-transfer-data.service.ts` | Abstract class: `transfers$`, `loading$`, `error$`, `meta$`, `loadTransfers(params)`, `refresh()`. |
| `services/profit/ngxs-car-transfer-data.service.ts` | Concrete: selects from `CarTransferState`, dispatches `LoadCarTransfers`. |
| `services/profit/car-transfer-table-datasource.ts` | Extends `AbstractTableDataSource<CarTransferDetail>`. Connects to data service observables. `loadData(page, pageSize)` builds params from `filters()` (year/month) + page/pageSize. |
| `services/profit/index.ts` | Export all three above. |

### NGXS Store (new)
| File | Purpose |
|------|---------|
| `store/profit/car-transfer.models.ts` | `CarTransferStateModel`: `transfers`, `meta`, `loading`, `error`, `lastQueryParams`. |
| `store/profit/car-transfer.actions.ts` | `LoadCarTransfers(params)`, `LoadCarTransfersSuccess(data, meta)`, `LoadCarTransfersFailure(error)`, `ClearCarTransfers`. |
| `store/profit/car-transfer.state.ts` | NGXS state, handles all four actions. |
| `store/profit/index.ts` | Re-export `CarTransferState` alongside existing exports. |

### Column config (new)
| File | Purpose |
|------|---------|
| `configs/car-transfer-table-columns.config.ts` | Column definitions for the transfer table (see Columns section below). |

### Component (new)
| File | Purpose |
|------|---------|
| `components/profit/car-transfer-list/car-transfer-list.ts` | Standalone component. Reacts to `MonthFilterState` via `effect()`. Provides `CarTransferDataService → NgxsCarTransferDataService`. Provides `CarTransferTableDataSource`. Passes datasource + columns to `<app-data-table>`. |
| `components/profit/car-transfer-list/car-transfer-list.html` | `<app-data-table>` inside a `<mat-card>` with header "Transfer Details". |
| `components/profit/index.ts` | Export `CarTransferList`. |

### Wiring (modify)
| File | Change |
|------|--------|
| `app.config.ts` | Add `CarTransferState` to `provideStore([...])`. |
| `car-services-tab.ts` | Import and render `<app-car-transfer-list>` below `<app-car-profit-summary>` in the Total tab. |
| `components/profit/car-profit-summary/car-profit-summary.html` | Remove the inline transfer `<table>` block (lines 136–186). Keep the 3-number aggregates grid. |

---

## Data Flow Detail

### Month change → table reload

`CarTransferList` uses the same `effect()` pattern as `CarProfitSummary`:

```typescript
effect(() => {
  const year = this.selectedYear();
  const month = this.selectedMonth();
  this.timestamp(); // forces re-run on manual refresh

  if (year && month) {
    this.dataSource.setFilters({ year, month }); // resets to page 1
  }
});
```

`setFilters` on `AbstractTableDataSource` resets to page 1 and calls `loadData(1)`.  
`loadData(page, pageSize)` on `CarTransferTableDataSource` reads `filters()` for year/month, combines with page/pageSize, dispatches `LoadCarTransfers`.

### Pagination

User clicks next page → `DataTable` emits `PageEvent` → `dataSource.loadData(page, pageSize)` → dispatch `LoadCarTransfers({ year, month, page, limit })` → HTTP call → `LoadCarTransfersSuccess` → NGXS state updates `transfers` + `meta` → DataSource observables emit → table re-renders.

---

## Columns

| Key | Header | Type | Notes |
|-----|--------|------|-------|
| `stt` | # | `stt` | Auto row number |
| `originalBookingCode` | Original Code | `text` | |
| `transferBookingCode` | Transfer Code | `text` | |
| `partnerAgencyName` | Partner Agency | `text` | |
| `originalSellingPrice` | Original Price | `text` | Formatted with `vndCurrency` via `format()` |
| `compensationAmount` | Compensation | `text` | Formatted with `vndCurrency` via `format()` |
| `netCost` | Net Cost | `text` | Formatted with `vndCurrency` via `format()`, red when positive |

No row actions needed (read-only table).

---

## Model Changes Detail

### `CarTransferFinancials` — remove `transfers`
```typescript
// Before
export interface CarTransferFinancials {
  transferCount: number;
  totalOriginalSellingPrice: number;
  totalCompensationAmount: number;
  netTransferCost: number;
  transfers: CarTransferDetail[]; // ← REMOVE
}

// After
export interface CarTransferFinancials {
  transferCount: number;
  totalOriginalSellingPrice: number;
  totalCompensationAmount: number;
  netTransferCost: number;
}
```

### New additions to model file
```typescript
export interface CarTransferQueryParams {
  year: number;
  month: number;
  page?: number;
  limit?: number;
}

export interface PaginatedCarTransfers {
  data: CarTransferDetail[];
  meta: PaginationMeta; // reuse @core/models/api.model PaginationMeta { total, page, limit }
}
```

---

## State Model Detail

```typescript
// car-transfer.models.ts
export interface CarTransferStateModel {
  transfers: CarTransferDetail[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  lastQueryParams: CarTransferQueryParams | null;
}

export const carTransferStateDefaults: CarTransferStateModel = {
  transfers: [],
  meta: null,
  loading: false,
  error: null,
  lastQueryParams: null,
};
```

---

## Summary Component Cleanup

Remove lines 136–186 from `car-profit-summary.html` (the `<div class="overflow-x-auto">` block containing the inline transfer table). The 3-number grid (original price / compensation / net cost) at lines 114–133 stays — it reads from the summary aggregate, which the BE still returns.

The `hasTransfers` computed signal in `car-profit-summary.ts` can stay — it correctly gates the entire "Transfer Financials" card on `transferCount > 0`.

---

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** Model removes `transfers[]`, HTTP service adds new method, NGXS state is new (no conflict with `CarProfitState`), component mirrors `CarProfitSummary` pattern. Tab wiring adds the component to the existing Total tab.
- **Scope:** One feature, one endpoint, one new component stack. Appropriately sized.
- **Ambiguity:** Month/year filter reaction confirmed: `effect()` + `setFilters()` → resets to page 1. `PaginationMeta` reused from `@core/models/api.model` (same shape as BE response `meta`).
