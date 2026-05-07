import {
  CreateExpenseDto,
  Expense,
  ExpenseQueryParams,
  ExpenseSummary,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';

export namespace ExpenseActions {
  export class LoadExpenses {
    static readonly type = '[Expense] Load Expenses';
    constructor(public params?: ExpenseQueryParams) {}
  }

  export class LoadExpensesSuccess {
    static readonly type = '[Expense] Load Expenses Success';
    constructor(
      public expenses: Expense[],
      public meta: PaginationMeta,
    ) {}
  }

  export class LoadExpensesFailure {
    static readonly type = '[Expense] Load Expenses Failure';
    constructor(public error: string) {}
  }

  export class LoadExpenseSummary {
    static readonly type = '[Expense] Load Expense Summary';
    constructor(
      public year: number,
      public month: number,
    ) {}
  }

  export class LoadExpenseSummarySuccess {
    static readonly type = '[Expense] Load Expense Summary Success';
    constructor(public summary: ExpenseSummary) {}
  }

  export class LoadExpenseSummaryFailure {
    static readonly type = '[Expense] Load Expense Summary Failure';
    constructor(public error: string) {}
  }

  export class CreateExpense {
    static readonly type = '[Expense] Create Expense';
    constructor(public dto: CreateExpenseDto) {}
  }

  export class CreateExpenseSuccess {
    static readonly type = '[Expense] Create Expense Success';
    constructor(public expense: Expense) {}
  }

  export class CreateExpenseFailure {
    static readonly type = '[Expense] Create Expense Failure';
    constructor(public error: string) {}
  }

  export class UpdateExpense {
    static readonly type = '[Expense] Update Expense';
    constructor(
      public id: string,
      public dto: UpdateExpenseDto,
    ) {}
  }

  export class UpdateExpenseSuccess {
    static readonly type = '[Expense] Update Expense Success';
    constructor(public expense: Expense) {}
  }

  export class UpdateExpenseFailure {
    static readonly type = '[Expense] Update Expense Failure';
    constructor(public error: string) {}
  }

  export class DeleteExpense {
    static readonly type = '[Expense] Delete Expense';
    constructor(public id: string) {}
  }

  export class DeleteExpenseSuccess {
    static readonly type = '[Expense] Delete Expense Success';
    constructor(public id: string) {}
  }

  export class DeleteExpenseFailure {
    static readonly type = '[Expense] Delete Expense Failure';
    constructor(public error: string) {}
  }

  export class SelectExpense {
    static readonly type = '[Expense] Select Expense';
    constructor(public expense: Expense | null) {}
  }
}
