export interface CarProfitQueryParams {
  year: number;
  month: number;
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
  transfers: CarTransferDetail[];
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
