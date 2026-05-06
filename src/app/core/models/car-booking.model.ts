import { PaginationParams } from './api.model';
import { PaymentStatus } from './booking.model';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum TransportType {
  SEATS_4 = 'seats_4',
  SEATS_7 = 'seats_7',
  SEATS_16 = 'seats_16',
  SEATS_29 = 'seats_29',
  SEATS_45 = 'seats_45',
}

export enum CarBookingStatus {
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  TRANSFERRED = 'transferred',
}

export enum CarPaymentCollection {
  NO_COLLECTION = 'no_collection',
  COLLECT_FROM_GUEST = 'collect_from_guest',
}

export enum ExpenseCategory {
  GASOLINE = 'gasoline',
  MAINTENANCE = 'maintenance',
  INSURANCE = 'insurance',
  BANK = 'bank',
  OTHER = 'other',
}

// ─── Car Booking ─────────────────────────────────────────────────────────────

export interface CarBookingAgency {
  id: string;
  name: string;
  tel: string | null;
  address: string | null;
}

export interface CarBookingTransferSummary {
  id: string;
  bookingCode: string;
  sellingPrice: number;
  receivingPrice: number;
  debtAmount: number;
  status: CarBookingStatus | string;
  guestName: string;
  transferToAgency: { id: string; name: string; tel: string | null } | null;
}

export interface CarBooking {
  id: string;
  bookingCode: string;
  travelAgencyId: string | null;
  travelAgency: CarBookingAgency | null;
  vehicleType: TransportType;
  serviceDate: string;
  guestName: string;
  guestPhone: string | null;
  guestCount: number;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  vat: boolean;
  sellingPrice: number;
  receivingPrice: number;
  debtAmount: number;
  paymentCollection: CarPaymentCollection;
  paymentCollectionNote: string | null;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  status: CarBookingStatus;
  note: string | null;
  routes: string | null;
  isTransfer: boolean;
  transferFromId: string | null;
  transferToAgencyId: string | null;
  transferReason: string | null;
  transferredAt: string | null;
  transferBookings: CarBookingTransferSummary[];
  transferToAgency: { id: string; name: string; tel: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CarBookingQueryParams extends PaginationParams {
  travelAgencyId?: string;
  vehicleType?: TransportType;
  status?: CarBookingStatus;
  serviceDateFrom?: string;
  serviceDateTo?: string;
  paymentStatus?: PaymentStatus;
}

export interface CreateCarBookingDto {
  travelAgencyId?: string;
  vehicleType: TransportType;
  serviceDate: string;
  guestName: string;
  guestPhone?: string;
  guestCount: number;
  pickupLocation?: string;
  dropoffLocation?: string;
  vat?: boolean;
  sellingPrice: number;
  receivingPrice: number;
  paymentCollection: CarPaymentCollection;
  paymentCollectionNote?: string;
  note?: string;
  routes?: string;
}

export interface UpdateCarBookingDto {
  travelAgencyId?: string | null;
  vehicleType?: TransportType;
  serviceDate?: string;
  guestName?: string;
  guestPhone?: string | null;
  guestCount?: number;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  vat?: boolean;
  sellingPrice?: number;
  receivingPrice?: number;
  paymentCollection?: CarPaymentCollection;
  paymentCollectionNote?: string | null;
  paymentStatus?: PaymentStatus;
  status?: CarBookingStatus;
  note?: string | null;
  routes?: string | null;
}

export interface TransferCarBookingDto {
  partnerAgencyId: string;
  compensationAmount?: number;
  reason: string;
}

export interface TransferCarBookingResponse {
  originalBooking: CarBooking;
  transferBooking: CarBooking;
}

export interface UpdateCarBookingTransferPricingDto {
  compensationAmount: number;
  reason?: string;
}

export interface BulkPaymentStatusDto {
  bookingIds: string[];
  paymentStatus: PaymentStatus;
}

export interface BulkPaymentStatusResponse {
  count: number;
}

export interface CarBookingCountByStatus {
  confirmedCount: number;
  totalCount: number;
}

export interface CarBookingCountParams {
  travelAgencyId?: string;
  serviceDateFrom?: string;
  serviceDateTo?: string;
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  month: number;
  year: number;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseQueryParams extends PaginationParams {
  category?: ExpenseCategory;
  year?: number;
  month?: number;
}

export interface CreateExpenseDto {
  title: string;
  amount: number;
  category: ExpenseCategory;
  month: number;
  year: number;
  note?: string;
}

export interface UpdateExpenseDto {
  title?: string;
  amount?: number;
  category?: ExpenseCategory;
  month?: number;
  year?: number;
  note?: string | null;
}

export interface ExpenseSummary {
  totalAmount: number;
  byCategory: Record<ExpenseCategory, number>;
  expenseCount: number;
  year: number;
  month: number;
}

// ─── Car Booking Debt ─────────────────────────────────────────────────────────

export interface CarBookingDebtSummary {
  totalBookings: number;
  totalGuests: number;
  totalSellingPrice: number;
  totalReceivingPrice: number;
  totalDebt: number;
  allPaid: boolean;
}

export interface CarBookingDebtAgency {
  id: string;
  name: string;
  tel: string | null;
  address: string | null;
}

export interface CarBookingDebtAgencyRow {
  agency: CarBookingDebtAgency;
  summary: CarBookingDebtSummary;
}

export interface CarBookingDebtGrandTotal {
  totalPartners: number;
  totalBookingsOrOperations: number;
  totalPax: number;
  totalSellingPrice: number;
  totalDebtOrOwed: number;
}

export interface CarBookingDebtPeriod {
  startDate: string;
  endDate: string;
}

export interface CarBookingDebtListResponse {
  year: number;
  month: number;
  period: CarBookingDebtPeriod;
  agencies: CarBookingDebtAgencyRow[];
  grandTotal: CarBookingDebtGrandTotal;
}

export interface CarBookingDebtLineItem {
  id: string;
  bookingCode: string;
  serviceDate: string;
  guestName: string;
  guestPhone: string | null;
  guestCount: number;
  vehicleType: TransportType;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  routes: string | null;
  sellingPrice: number;
  receivingPrice: number;
  debtAmount: number;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  note: string | null;
}

export interface CarBookingDebtDetailAgency extends CarBookingDebtAgencyRow {
  bookings: CarBookingDebtLineItem[];
}

export interface CarBookingDebtDetailResponse {
  year: number;
  month: number;
  period: CarBookingDebtPeriod;
  agency: CarBookingDebtDetailAgency;
}

export interface CarBookingDebtQueryParams {
  year: number;
  month: number;
  paymentStatus?: PaymentStatus | PaymentStatus[];
  search?: string;
}

export interface CarBookingSummaryResponse {
  totalSellingPrice: number;
  totalReceivingPrice: number;
  totalDebtAmount: number;
  bookingCount: number;
  filter: { year: number; month: number };
}
