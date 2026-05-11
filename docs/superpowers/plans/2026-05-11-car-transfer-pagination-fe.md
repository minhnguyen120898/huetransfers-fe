# Car Transfer Pagination FE Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline transfer table in `car-profit-summary` with a fully paginated `CarTransferList` component that calls `GET /profit/car-transfers?year&month&page&limit` and reacts to month/year filter changes.

**Architecture:** Mirror the `CarBookingList` stack — NGXS state → abstract data service → `NgxsCarTransferDataService` → `CarTransferTableDataSource` (extends `AbstractTableDataSource<CarTransferDetail>`) → `<app-data-table>`. The `CarTransferList` component uses `effect()` watching `MonthFilterState` to reset to page 1 on month change via `setFilters()`.

**Tech Stack:** Angular 20, NGXS, Angular Material, Tailwind CSS 4, TypeScript.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/app/features/car-services/models/profit/car-profit.model.ts` | Remove `transfers` from `CarTransferFinancials`; add `CarTransferQueryParams`, `PaginatedCarTransfers` |
| Modify | `src/app/features/car-services/services/profit/car-profit.service.ts` | Add `getCarTransfers(params)` HTTP method |
| Create | `src/app/features/car-services/store/profit/car-transfer.models.ts` | NGXS state model + defaults |
| Create | `src/app/features/car-services/store/profit/car-transfer.actions.ts` | NGXS actions namespace |
| Create | `src/app/features/car-services/store/profit/car-transfer.state.ts` | NGXS state class |
| Modify | `src/app/features/car-services/store/profit/index.ts` | Export new state files |
| Create | `src/app/features/car-services/services/profit/car-transfer-data.service.ts` | Abstract data service |
| Create | `src/app/features/car-services/services/profit/ngxs-car-transfer-data.service.ts` | Concrete NGXS implementation |
| Create | `src/app/features/car-services/services/profit/car-transfer-table-datasource.ts` | `AbstractTableDataSource<CarTransferDetail>` subclass |
| Modify | `src/app/features/car-services/services/profit/index.ts` | Export new service files |
| Create | `src/app/features/car-services/configs/car-transfer-table-columns.config.ts` | Column definitions |
| Create | `src/app/features/car-services/components/profit/car-transfer-list/car-transfer-list.ts` | Standalone component |
| Create | `src/app/features/car-services/components/profit/car-transfer-list/car-transfer-list.html` | Template |
| Modify | `src/app/features/car-services/components/profit/index.ts` | Export `CarTransferList` |
| Modify | `src/app/features/car-services/components/profit/car-profit-summary/car-profit-summary.html` | Remove inline transfer table |
| Modify | `src/app/app.config.ts` | Register `CarTransferState` in `provideStore` |
| Modify | `src/app/features/car-services/car-services-tab.ts` | Import + render `<app-car-transfer-list>` |
| Modify | `src/app/features/car-services/car-services-tab.html` | Add `<app-car-transfer-list>` below summary |

---

## Task 1: Update model — remove `transfers`, add query/response types

**Files:**
- Modify: `src/app/features/car-services/models/profit/car-profit.model.ts`

- [ ] **Step 1: Replace the file content**

```typescript
// src/app/features/car-services/models/profit/car-profit.model.ts
import { PaginationMeta } from '@core/models/api.model';

export interface CarProfitQueryParams {
  year: number;
  month: number;
}

export interface CarTransferQueryParams {
  year: number;
  month: number;
  page?: number;
  limit?: number;
}

export interface CarBookingFinancials {
  grossRevenue: number;
  transferDeductions: number;
  revenue: number;
  bookingCount: number;
  guestCount: number;
  netProfit: number;
}

export interface CarTransferDetail {
  originalBookingCode: string;
  transferBookingCode: string;
  partnerAgencyName: string;
  originalSellingPrice: number;
  compensationAmount: number;
  netCost: number;
}

export interface CarTransferFinancials {
  transferCount: number;
  totalOriginalSellingPrice: number;
  totalCompensationAmount: number;
  netTransferCost: number;
}

export interface PaginatedCarTransfers {
  data: CarTransferDetail[];
  meta: PaginationMeta;
}

export interface CarExpenseByCategory {
  gasoline: number;
  maintenance: number;
  insurance: number;
  bank: number;
  other: number;
}

export interface CarExpenseFinancials {
  total: number;
  byCategory: CarExpenseByCategory;
  expenseCount: number;
}

export interface CarMonthlyProfitSummary {
  year: number;
  month: number;
  bookingFinancials: CarBookingFinancials;
  transferFinancials: CarTransferFinancials;
  expenseFinancials: CarExpenseFinancials;
  totalProfit: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/features/car-services/models/profit/car-profit.model.ts
git commit -m "refactor: remove transfers array from CarTransferFinancials, add CarTransferQueryParams and PaginatedCarTransfers"
```

---

## Task 2: Add `getCarTransfers` to the HTTP service

**Files:**
- Modify: `src/app/features/car-services/services/profit/car-profit.service.ts`

- [ ] **Step 1: Replace the file content**

```typescript
// src/app/features/car-services/services/profit/car-profit.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import {
  CarMonthlyProfitSummary,
  CarProfitQueryParams,
  CarTransferQueryParams,
  PaginatedCarTransfers,
} from '../../models/profit';

@Injectable({
  providedIn: 'root',
})
export class CarProfitService extends BaseHttpService {
  private readonly endpoint = 'profit';

  getCarProfitSummary(params: CarProfitQueryParams): Observable<CarMonthlyProfitSummary> {
    const httpParams = this.buildParams({ ...params });
    return this.get<CarMonthlyProfitSummary>(`${this.endpoint}/car-summary`, {
      params: httpParams,
    });
  }

  getCarTransfers(params: CarTransferQueryParams): Observable<PaginatedCarTransfers> {
    const httpParams = this.buildParams({ ...params });
    return this.get<PaginatedCarTransfers>(`${this.endpoint}/car-transfers`, {
      params: httpParams,
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/features/car-services/services/profit/car-profit.service.ts
git commit -m "feat: add getCarTransfers HTTP method to CarProfitService"
```

---

## Task 3: Create NGXS state — models, actions, state class

**Files:**
- Create: `src/app/features/car-services/store/profit/car-transfer.models.ts`
- Create: `src/app/features/car-services/store/profit/car-transfer.actions.ts`
- Create: `src/app/features/car-services/store/profit/car-transfer.state.ts`
- Modify: `src/app/features/car-services/store/profit/index.ts`

- [ ] **Step 1: Create `car-transfer.models.ts`**

```typescript
// src/app/features/car-services/store/profit/car-transfer.models.ts
import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';

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

- [ ] **Step 2: Create `car-transfer.actions.ts`**

```typescript
// src/app/features/car-services/store/profit/car-transfer.actions.ts
import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';

export namespace CarTransferActions {
  export class LoadCarTransfers {
    static readonly type = '[CarTransfer] Load Car Transfers';
    constructor(public params: CarTransferQueryParams) {}
  }

  export class LoadCarTransfersSuccess {
    static readonly type = '[CarTransfer] Load Car Transfers Success';
    constructor(
      public transfers: CarTransferDetail[],
      public meta: PaginationMeta,
    ) {}
  }

  export class LoadCarTransfersFailure {
    static readonly type = '[CarTransfer] Load Car Transfers Failure';
    constructor(public error: string) {}
  }

  export class ClearCarTransfers {
    static readonly type = '[CarTransfer] Clear Car Transfers';
  }
}
```

- [ ] **Step 3: Create `car-transfer.state.ts`**

```typescript
// src/app/features/car-services/store/profit/car-transfer.state.ts
import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PaginationMeta } from '@core/models/api.model';
import { CarProfitService } from '../../services/profit/car-profit.service';
import { CarTransferDetail } from '../../models/profit';
import { CarTransferActions } from './car-transfer.actions';
import { CarTransferStateModel, carTransferStateDefaults } from './car-transfer.models';

@State<CarTransferStateModel>({
  name: 'carTransfer',
  defaults: carTransferStateDefaults,
})
@Injectable()
export class CarTransferState {
  private readonly carProfitService = inject(CarProfitService);

  @Selector()
  static transfers(state: CarTransferStateModel): CarTransferDetail[] {
    return state.transfers;
  }

  @Selector()
  static meta(state: CarTransferStateModel): PaginationMeta | null {
    return state.meta;
  }

  @Selector()
  static loading(state: CarTransferStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: CarTransferStateModel): string | null {
    return state.error;
  }

  @Selector()
  static lastQueryParams(state: CarTransferStateModel) {
    return state.lastQueryParams;
  }

  @Action(CarTransferActions.LoadCarTransfers)
  loadCarTransfers(
    ctx: StateContext<CarTransferStateModel>,
    action: CarTransferActions.LoadCarTransfers,
  ) {
    ctx.patchState({ loading: true, error: null, lastQueryParams: action.params });
    return this.carProfitService.getCarTransfers(action.params).pipe(
      tap((response) => {
        ctx.dispatch(
          new CarTransferActions.LoadCarTransfersSuccess(response.data, response.meta),
        );
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarTransferActions.LoadCarTransfersFailure(
            error.message || 'Failed to load car transfers',
          ),
        );
        return of(null);
      }),
    );
  }

  @Action(CarTransferActions.LoadCarTransfersSuccess)
  loadCarTransfersSuccess(
    ctx: StateContext<CarTransferStateModel>,
    action: CarTransferActions.LoadCarTransfersSuccess,
  ) {
    ctx.patchState({ transfers: action.transfers, meta: action.meta, loading: false, error: null });
  }

  @Action(CarTransferActions.LoadCarTransfersFailure)
  loadCarTransfersFailure(
    ctx: StateContext<CarTransferStateModel>,
    action: CarTransferActions.LoadCarTransfersFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(CarTransferActions.ClearCarTransfers)
  clearCarTransfers(ctx: StateContext<CarTransferStateModel>) {
    ctx.patchState(carTransferStateDefaults);
  }
}
```

- [ ] **Step 4: Update `store/profit/index.ts`**

```typescript
// src/app/features/car-services/store/profit/index.ts
export * from './car-profit.actions';
export * from './car-profit.models';
export * from './car-profit.state';
export * from './car-transfer.actions';
export * from './car-transfer.models';
export * from './car-transfer.state';
```

- [ ] **Step 5: Commit**

```bash
git add src/app/features/car-services/store/profit/
git commit -m "feat: add CarTransferState NGXS state (models, actions, state class)"
```

---

## Task 4: Create data service layer

**Files:**
- Create: `src/app/features/car-services/services/profit/car-transfer-data.service.ts`
- Create: `src/app/features/car-services/services/profit/ngxs-car-transfer-data.service.ts`
- Create: `src/app/features/car-services/services/profit/car-transfer-table-datasource.ts`
- Modify: `src/app/features/car-services/services/profit/index.ts`

- [ ] **Step 1: Create abstract data service**

```typescript
// src/app/features/car-services/services/profit/car-transfer-data.service.ts
import { Observable } from 'rxjs';
import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';

export abstract class CarTransferDataService {
  abstract readonly transfers$: Observable<CarTransferDetail[]>;
  abstract readonly loading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;
  abstract readonly meta$: Observable<PaginationMeta | null>;

  abstract loadTransfers(params: CarTransferQueryParams): void;
  abstract refresh(): void;
}
```

- [ ] **Step 2: Create NGXS concrete implementation**

```typescript
// src/app/features/car-services/services/profit/ngxs-car-transfer-data.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';
import { CarTransferState } from '../../store/profit/car-transfer.state';
import { CarTransferActions } from '../../store/profit/car-transfer.actions';
import { CarTransferDataService } from './car-transfer-data.service';

@Injectable()
export class NgxsCarTransferDataService extends CarTransferDataService {
  private readonly store = inject(Store);

  readonly transfers$: Observable<CarTransferDetail[]> = this.store.select(
    CarTransferState.transfers,
  );
  readonly loading$: Observable<boolean> = this.store.select(CarTransferState.loading);
  readonly error$: Observable<string | null> = this.store.select(CarTransferState.error);
  readonly meta$: Observable<PaginationMeta | null> = this.store.select(CarTransferState.meta);

  loadTransfers(params: CarTransferQueryParams): void {
    this.store.dispatch(new CarTransferActions.LoadCarTransfers(params));
  }

  refresh(): void {
    const lastParams = this.store.selectSnapshot(CarTransferState.lastQueryParams);
    if (lastParams) {
      this.store.dispatch(new CarTransferActions.LoadCarTransfers(lastParams));
    }
  }
}
```

- [ ] **Step 3: Create table datasource**

```typescript
// src/app/features/car-services/services/profit/car-transfer-table-datasource.ts
import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';
import { CarTransferDataService } from './car-transfer-data.service';

@Injectable()
export class CarTransferTableDataSource extends AbstractTableDataSource<CarTransferDetail> {
  private readonly dataService = inject(CarTransferDataService);

  constructor() {
    super();
    this.dataService.transfers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transfers) => this._data.set(transfers));

    this.dataService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this._loading.set(loading));

    this.dataService.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this._error.set(error));

    this.dataService.meta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => this._meta.set(meta));
  }

  override loadData(page = 1, pageSize = 10): void {
    const filters = this.filters() as { year?: number; month?: number };
    if (!filters.year || !filters.month) return;

    const params: CarTransferQueryParams = {
      year: filters.year,
      month: filters.month,
      page,
      limit: pageSize,
    };
    this.dataService.loadTransfers(params);
  }

  override refresh(): void {
    this.dataService.refresh();
  }

  protected override areRowsEqual(
    row1: CarTransferDetail,
    row2: CarTransferDetail,
  ): boolean {
    return row1.originalBookingCode === row2.originalBookingCode &&
      row1.transferBookingCode === row2.transferBookingCode;
  }
}
```

- [ ] **Step 4: Update `services/profit/index.ts`**

```typescript
// src/app/features/car-services/services/profit/index.ts
export * from './car-profit.service';
export * from './car-profit-data.service';
export * from './ngxs-car-profit-data.service';
export * from './car-transfer-data.service';
export * from './ngxs-car-transfer-data.service';
export * from './car-transfer-table-datasource';
```

- [ ] **Step 5: Commit**

```bash
git add src/app/features/car-services/services/profit/
git commit -m "feat: add CarTransferDataService, NgxsCarTransferDataService, CarTransferTableDataSource"
```

---

## Task 5: Create column config

**Files:**
- Create: `src/app/features/car-services/configs/car-transfer-table-columns.config.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/app/features/car-services/configs/car-transfer-table-columns.config.ts
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { CarTransferDetail } from '../../models/profit';
import { formatVnd } from '@shared/pipes/vnd-currency.pipe';

export function getCarTransferTableColumns(): TableColumn<CarTransferDetail>[] {
  return [
    {
      key: 'stt',
      header: '#',
      type: 'stt',
    },
    {
      key: 'originalBookingCode',
      header: 'Original Code',
      type: 'text',
    },
    {
      key: 'transferBookingCode',
      header: 'Transfer Code',
      type: 'text',
    },
    {
      key: 'partnerAgencyName',
      header: 'Partner Agency',
      type: 'text',
    },
    {
      key: 'originalSellingPrice',
      header: 'Original Price',
      type: 'text',
      format: (value) => formatVnd(value as number),
    },
    {
      key: 'compensationAmount',
      header: 'Compensation',
      type: 'text',
      format: (value) => formatVnd(value as number),
    },
    {
      key: 'netCost',
      header: 'Net Cost',
      type: 'text',
      format: (value) => formatVnd(value as number),
      cellClass: (row) => (row.netCost > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'),
    },
  ];
}
```

> **Note:** If `formatVnd` is not exported from `vnd-currency.pipe.ts`, check the file. If the pipe only has a `transform` method (no standalone `formatVnd` function), replace `format: (value) => formatVnd(value as number)` with an inline formatter using `Intl.NumberFormat`:
> ```typescript
> format: (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value as number),
> ```

- [ ] **Step 2: Check `vnd-currency.pipe.ts` and adjust if needed**

```bash
grep -n "export function\|export const\|transform" src/app/shared/pipes/vnd-currency.pipe.ts
```

If there is no exported standalone function, replace the three `format` callbacks in the column config with:
```typescript
format: (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value)),
```

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/configs/car-transfer-table-columns.config.ts
git commit -m "feat: add car transfer table column config"
```

---

## Task 6: Create `CarTransferList` component

**Files:**
- Create: `src/app/features/car-services/components/profit/car-transfer-list/car-transfer-list.ts`
- Create: `src/app/features/car-services/components/profit/car-transfer-list/car-transfer-list.html`
- Modify: `src/app/features/car-services/components/profit/index.ts`

- [ ] **Step 1: Create the component class**

```typescript
// src/app/features/car-services/components/profit/car-transfer-list/car-transfer-list.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  OnInit,
} from '@angular/core';
import { select } from '@ngxs/store';
import { MonthFilterState } from '@core/store/month-filter';
import { DataTable } from '@shared/components/data-table/data-table';
import { TableCard } from '@shared/components/table-card/table-card';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { CarTransferDetail } from '../../../models/profit';
import { CarTransferDataService } from '../../../services/profit/car-transfer-data.service';
import { NgxsCarTransferDataService } from '../../../services/profit/ngxs-car-transfer-data.service';
import { CarTransferTableDataSource } from '../../../services/profit/car-transfer-table-datasource';
import { getCarTransferTableColumns } from '../../../configs/car-transfer-table-columns.config';

@Component({
  selector: 'app-car-transfer-list',
  standalone: true,
  imports: [DataTable, TableCard],
  templateUrl: './car-transfer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: CarTransferDataService, useClass: NgxsCarTransferDataService },
    CarTransferTableDataSource,
  ],
})
export class CarTransferList {
  readonly dataSource = inject(CarTransferTableDataSource);
  readonly columns: TableColumn<CarTransferDetail>[] = getCarTransferTableColumns();

  private readonly selectedMonth = select(MonthFilterState.selectedMonth);
  private readonly selectedYear = select(MonthFilterState.selectedYear);
  private readonly timestamp = select(MonthFilterState.timestamp);

  constructor() {
    effect(() => {
      const year = this.selectedYear();
      const month = this.selectedMonth();
      this.timestamp();

      if (year && month) {
        this.dataSource.setFilters({ year, month });
      }
    });
  }
}
```

- [ ] **Step 2: Create the template**

```html
<!-- src/app/features/car-services/components/profit/car-transfer-list/car-transfer-list.html -->
<app-table-card title="Transfer Details">
  <app-data-table
    table
    [dataSource]="dataSource"
    [columns]="columns"
    [paginated]="true"
    emptyStateIcon="swap_horiz"
    emptyStateTitle="No transfers"
    emptyStateMessage="No transfer bookings found for this month."
    [tableMaxHeightClass]="'max-h-[32rem]'"
  />
</app-table-card>
```

- [ ] **Step 3: Update `components/profit/index.ts`**

```typescript
// src/app/features/car-services/components/profit/index.ts
export * from './car-profit-summary/car-profit-summary';
export * from './car-transfer-list/car-transfer-list';
```

- [ ] **Step 4: Commit**

```bash
git add src/app/features/car-services/components/profit/
git commit -m "feat: add CarTransferList standalone component with DataTable and month-filter reaction"
```

---

## Task 7: Register `CarTransferState` in app config

**Files:**
- Modify: `src/app/app.config.ts`

- [ ] **Step 1: Add import and register state**

Add to the imports block at the top:
```typescript
import { CarTransferState } from '@features/car-services/store/profit';
```

Add `CarTransferState` to the `provideStore([...])` array alongside `CarProfitState`:
```typescript
provideStore(
  [
    AuthState,
    AgencyState,
    SettingsState,
    CarBookingState,
    ExpenseState,
    CarBookingDebtState,
    CarProfitState,
    CarTransferState,   // ← add this
    MonthFilterState,
    UserManagementState,
  ],
  ...
),
```

- [ ] **Step 2: Commit**

```bash
git add src/app/app.config.ts
git commit -m "feat: register CarTransferState in NGXS provideStore"
```

---

## Task 8: Wire `CarTransferList` into the Total tab

**Files:**
- Modify: `src/app/features/car-services/car-services-tab.ts`
- Modify: `src/app/features/car-services/car-services-tab.html`

- [ ] **Step 1: Update `car-services-tab.ts`**

```typescript
// src/app/features/car-services/car-services-tab.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { CarBookingList } from './components/bookings';
import { ExpenseList } from './components/expenses';
import { CarBookingDebtList } from './components/debt';
import { CarProfitSummary, CarTransferList } from './components/profit';

@Component({
  selector: 'app-car-services-tab',
  imports: [
    MatTabsModule,
    MatCardModule,
    CarBookingList,
    ExpenseList,
    CarBookingDebtList,
    CarProfitSummary,
    CarTransferList,
  ],
  templateUrl: './car-services-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarServicesTab {}
```

- [ ] **Step 2: Update `car-services-tab.html` — add `<app-car-transfer-list>` below summary**

```html
<!-- src/app/features/car-services/car-services-tab.html -->
<mat-card class="card-sm">
  <mat-card-content>
    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
      <mat-tab>
        <ng-template mat-tab-label>
          <span>Car Bookings</span>
        </ng-template>
        <ng-template matTabContent>
          <app-car-booking-list class="block mt-4" />
        </ng-template>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <span>Expenses</span>
        </ng-template>
        <ng-template matTabContent>
          <app-expense-list class="block mt-4" />
        </ng-template>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <span>Car Booking Debt</span>
        </ng-template>
        <ng-template matTabContent>
          <app-car-booking-debt-list class="block mt-4" />
        </ng-template>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <span>Total</span>
        </ng-template>
        <ng-template matTabContent>
          <div class="block mt-4 space-y-6">
            <app-car-profit-summary />
            <app-car-transfer-list />
          </div>
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  </mat-card-content>
</mat-card>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/features/car-services/car-services-tab.ts src/app/features/car-services/car-services-tab.html
git commit -m "feat: add CarTransferList to Total tab below profit summary"
```

---

## Task 9: Remove inline transfer table from summary

**Files:**
- Modify: `src/app/features/car-services/components/profit/car-profit-summary/car-profit-summary.html`

- [ ] **Step 1: Remove the inline transfer table block**

Find and delete the block starting at `<!-- Transfer Details Table -->` and ending with the closing `</div>` of `<div class="overflow-x-auto">` (the entire `<table>` section inside the Transfer Financials card). Keep the 3-number aggregates grid above it.

The Transfer Financials card section should look like this after the removal:

```html
<!-- Transfer Financials Card -->
@if (hasTransfers()) {
  <mat-card appearance="outlined">
    <mat-card-content>
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Transfer Financials</h3>
        <span
          class="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700"
        >
          {{ transferFinancials()?.transferCount }} TRANSFERS
        </span>
      </div>

      <!-- Summary Grid -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500 mb-1">Original Price</p>
          <p class="text-xl font-bold text-gray-900">
            {{ transferFinancials()?.totalOriginalSellingPrice | vndCurrency }}
          </p>
        </div>
        <div class="p-4 bg-orange-50 rounded-lg">
          <p class="text-sm text-gray-500 mb-1">Compensation Paid</p>
          <p class="text-xl font-bold text-orange-600">
            {{ transferFinancials()?.totalCompensationAmount | vndCurrency }}
          </p>
        </div>
        <div class="p-4 bg-red-50 rounded-lg">
          <p class="text-sm text-gray-500 mb-1">Net Transfer Cost</p>
          <p class="text-xl font-bold text-red-600">
            {{ transferFinancials()?.netTransferCost | vndCurrency }}
          </p>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/features/car-services/components/profit/car-profit-summary/car-profit-summary.html
git commit -m "refactor: remove inline transfer table from car-profit-summary, replaced by CarTransferList"
```

---

## Task 10: Build verification

- [ ] **Step 1: Run TypeScript check**

```bash
cd /Users/minhnn/Documents/workspaces/my-project/huetransfers-fe
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Fix any type errors**

Common issues to watch for:
- `CarTransferDetail` imported from `@core/models/car-booking.model` in the column config — if it's not there, import from `../../models/profit` (relative) or the barrel.
- `formatVnd` not exported from `vnd-currency.pipe.ts` — use `Intl.NumberFormat` inline as noted in Task 5.
- `MonthFilterState.timestamp` selector not existing — check with `grep -n "timestamp" src/app/core/store/month-filter/*.ts`. If missing, remove `this.timestamp()` from the effect and the `select(MonthFilterState.timestamp)` line in `car-transfer-list.ts`.

- [ ] **Step 3: Run the dev server and verify visually**

```bash
npx ng serve
```

Open the app, navigate to Car Services → Total tab. Verify:
1. The profit summary card shows the 3-number aggregates grid (no inline table).
2. Below it, "Transfer Details" card shows the paginated table.
3. Changing the month filter reloads both the summary and the transfer list, resetting to page 1.
4. Pagination controls work — next/previous page loads new rows.

- [ ] **Step 4: Commit any fixes**

```bash
git add -p
git commit -m "fix: resolve build errors from car transfer pagination adaptation"
```
