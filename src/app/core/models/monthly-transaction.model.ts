/**
 * Transaction Type Enum
 */
export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

/**
 * Monthly Transaction entity (matches API response)
 */
export interface MonthlyTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  month: number; // 1-12
  year: number; // e.g., 2026
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * Create Monthly Transaction DTO
 */
export interface CreateMonthlyTransactionDto {
  title: string;
  amount: number;
  type: TransactionType;
  month: number;
  year: number;
  note?: string;
}

/**
 * Update Monthly Transaction DTO
 */
export interface UpdateMonthlyTransactionDto {
  title?: string;
  amount?: number;
  type?: TransactionType;
  month?: number;
  year?: number;
  note?: string;
}

/**
 * Monthly Transaction query parameters
 */
export interface MonthlyTransactionQueryParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  year?: number;
  month?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Monthly Transaction Summary (for summary endpoints)
 */
export interface MonthlyTransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number; // income - expense
  transactionCount: number;
}
