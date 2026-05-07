export enum CarBookingColumnKey {
  BookingCode = 'bookingCode',
  Agency = 'agency',
  GuestName = 'guestName',
  VehicleType = 'vehicleType',
  ServiceDate = 'serviceDate',
  SellingPrice = 'sellingPrice',
  ReceivingPrice = 'receivingPrice',
  DebtAmount = 'debtAmount',
  PaymentStatus = 'paymentStatus',
  Status = 'status',
  Actions = 'actions',
}

export enum CarBookingActionId {
  View = 'view',
  Edit = 'edit',
  Cancel = 'cancel',
  Transfer = 'transfer',
  UpdateTransferPricing = 'update_transfer_pricing',
}

export enum CarBookingStatusFilter {
  All = '',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Transferred = 'transferred',
}

export const SEARCH_DEBOUNCE_TIME = 300;
