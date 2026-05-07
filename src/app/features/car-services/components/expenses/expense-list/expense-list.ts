import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { select, Store } from '@ngxs/store';
import { MonthFilterState } from '@core/store/month-filter';
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { TableCard } from '@shared/components/table-card/table-card';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { VndCurrencyPipe } from '@shared/pipes';
import { LARGE_DIALOG } from '@core/config/dialog.config';
import {
  CreateExpenseDto,
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';
import { ExpenseState } from '../../../store/expenses/expense.state';
import { ExpenseActions } from '../../../store/expenses/expense.actions';
import { ExpenseDataService } from '../../../services/expenses/expense-data.service';
import { NgxsExpenseDataService } from '../../../services/expenses/ngxs-expense-data.service';
import { ExpenseTableDataSource } from '../../../services/expenses/expense-table-datasource';
import { ExpenseFormDialog } from '../expense-form-dialog/expense-form-dialog';
import {
  ExpenseColumnKey,
  ExpenseActionId,
  ExpenseCategoryFilter,
} from '../../../models/expenses/expense.enums';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.GASOLINE]: 'Gasoline',
  [ExpenseCategory.MAINTENANCE]: 'Maintenance',
  [ExpenseCategory.INSURANCE]: 'Insurance',
  [ExpenseCategory.BANK]: 'Bank',
  [ExpenseCategory.OTHER]: 'Other',
};

interface ExpenseFiltersForm {
  search: FormControl<string>;
  category: FormControl<ExpenseCategoryFilter>;
}

@Component({
  selector: 'app-expense-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    DataTable,
    SearchBar,
    TableCard,
    VndCurrencyPipe,
  ],
  providers: [
    ExpenseTableDataSource,
    { provide: ExpenseDataService, useClass: NgxsExpenseDataService },
  ],
  templateUrl: './expense-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);
  readonly dataSource = inject(ExpenseTableDataSource);

  readonly selectedMonth = select(MonthFilterState.selectedMonth);
  readonly selectedYear = select(MonthFilterState.selectedYear);
  readonly summary = select(ExpenseState.summary);
  readonly summaryLoading = select(ExpenseState.summaryLoading);

  readonly ExpenseCategoryFilter = ExpenseCategoryFilter;
  readonly ExpenseCategory = ExpenseCategory;
  readonly CATEGORY_LABELS = CATEGORY_LABELS;

  readonly filtersForm = this.fb.group<ExpenseFiltersForm>({
    search: this.fb.control(''),
    category: this.fb.control(ExpenseCategoryFilter.All),
  });

  readonly columns: TableColumn<Expense>[] = [
    {
      key: ExpenseColumnKey.Title,
      header: 'Title',
      accessor: (row) => row.title,
      type: 'text',
      width: '200px',
    },
    {
      key: ExpenseColumnKey.Category,
      header: 'Category',
      accessor: (row) => CATEGORY_LABELS[row.category] ?? row.category,
      type: 'text',
      align: 'center',
      width: '120px',
    },
    {
      key: ExpenseColumnKey.Amount,
      header: 'Amount',
      accessor: (row) => row.amount,
      type: 'text',
      align: 'right',
      width: '140px',
    },
    {
      key: ExpenseColumnKey.Period,
      header: 'Period',
      accessor: (row) => `${row.month}/${row.year}`,
      type: 'text',
      align: 'center',
      width: '100px',
    },
    {
      key: ExpenseColumnKey.Note,
      header: 'Note',
      accessor: (row) => row.note || '—',
      type: 'text',
      width: '200px',
    },
  ];

  readonly actions: TableAction<Expense>[] = [
    {
      id: ExpenseActionId.Edit,
      icon: 'edit',
      tooltip: 'Edit',
      color: 'primary',
      handler: (expense) => this.onEdit(expense),
    },
    {
      id: ExpenseActionId.Delete,
      icon: 'delete',
      tooltip: 'Delete',
      color: 'warn',
      handler: (expense) => this.onDelete(expense),
    },
  ];

  constructor() {
    // Auto-load when month/year changes
    effect(() => {
      const month = this.selectedMonth();
      const year = this.selectedYear();
      untracked(() => {
        this.dataSource.setFilters({ month, year });
        this.store.dispatch(new ExpenseActions.LoadExpenseSummary(year, month));
      });
    });
  }

  ngOnInit(): void {
    // Initial load handled by effect
  }

  onSearchChange(search: string): void {
    this.dataSource.setFilter('search', search || undefined);
  }

  onCategoryChange(category: ExpenseCategoryFilter): void {
    this.dataSource.setFilter('category', category || undefined);
  }

  openCreateDialog(): void {
    const month = this.selectedMonth();
    const year = this.selectedYear();

    const dialogRef = this.dialog.open(ExpenseFormDialog, {
      ...LARGE_DIALOG,
      disableClose: true,
      data: { defaultMonth: month, defaultYear: year },
    });

    dialogRef.afterClosed().subscribe((dto: CreateExpenseDto | null) => {
      if (dto) {
        this.dataSource.createExpense(dto);
      }
    });
  }

  onEdit(expense: Expense): void {
    const dialogRef = this.dialog.open(ExpenseFormDialog, {
      ...LARGE_DIALOG,
      disableClose: true,
      data: { expense },
    });

    dialogRef.afterClosed().subscribe((dto: UpdateExpenseDto | null) => {
      if (dto) {
        this.dataSource.updateExpense(expense.id, dto);
      }
    });
  }

  onDelete(expense: Expense): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Expense',
        message: `Are you sure you want to delete "${expense.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.dataSource.deleteExpense(expense.id);
      }
    });
  }

  getCategoryTotal(summary: ExpenseSummary, category: ExpenseCategory): number {
    return summary.byCategory[category] ?? 0;
  }
}
