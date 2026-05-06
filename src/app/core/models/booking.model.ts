export interface Booking {
  id: string;
  bookingCode: string;
  tourId: string;
  travelAgencyId: string;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  guestCount: number;
  adultCount: number;
  childCount: number;
  tourGroupType: TourGroupType;
  bookingDate: string;
  departureDate: string;
  departureTime: string;
  timeOption: TimeOption;
  pickupLocation?: string;
  dropoffLocation?: string;
  adultPrice: number;
  childPrice: number;
  sellingPrice: number;
  receivingPrice: number;
  vat: boolean;
  debtAmount: number;
  paymentCollection: PaymentCollection;
  status: BookingStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  tour?: any;
  travelAgency?: any;
  createdBy?: { id: string; username: string; fullName?: string };
  updatedBy?: { id: string; username: string; fullName?: string };

  // Related operation (present if operation exists for this booking's tour/date/time)
  relatedOperation?: RelatedOperationInfo;

  // Transfer tracking fields
  isTransfer?: boolean;
  transferFromId?: string;
  transferToAgencyId?: string;
  transferReason?: string;
  transferredAt?: string;

  // Transfer relations (populated when needed)
  transferFrom?: Booking;
  transferBooking?: Booking; // For backward compatibility (single)
  transferBookings?: Booking[]; // Array of transfer bookings (backend returns this)
  transferToAgency?: any;
}

/**
 * Related operation info returned when creating a booking
 * Present if an operation already exists for the booking's tour/date/time
 */
export interface RelatedOperationInfo {
  exists: true;
  operationId: string;
  tourName: string;
  operationDate: string;
  timeOption: TimeOption;
  currentTotalPax: number | null;
  message: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_OPERATION = 'in_operation',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  TRANSFERRED = 'transferred',
}

export enum TimeOption {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
}

export enum PaymentCollection {
  NO_COLLECTION = 'no_collection',
  COLLECT_FROM_GUEST = 'collect_from_guest',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
}

export enum TourType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum TourGroupType {
  LARGE_GROUP = 'large_group',
  SMALL_GROUP = 'small_group',
  BUS = 'bus',
}

export interface CreateBookingDto {
  tourId: string;
  travelAgencyId: string;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  adultCount: number;
  childCount: number;
  tourGroupType: TourGroupType;
  departureDate: string; // ISO date string
  departureTime?: string;
  timeOption: TimeOption;
  pickupLocation?: string;
  dropoffLocation?: string;
  adultPrice: number;
  childPrice: number;
  sellingPrice: number;
  receivingPrice: number;
  vat: boolean;
  paymentCollection: PaymentCollection;
  note?: string;
}

/**
 * UpdateBookingDto for pending/confirmed bookings
 * Allows updating all fields except tourId (immutable)
 */
export interface UpdateBookingDto {
  travelAgencyId?: string;
  guestName?: string;
  guestPhone?: string;
  adultCount?: number;
  childCount?: number;
  tourGroupType?: TourGroupType;
  departureDate?: string; // ISO date string
  departureTime?: string;
  timeOption?: TimeOption;
  pickupLocation?: string;
  dropoffLocation?: string;
  adultPrice?: number;
  childPrice?: number;
  sellingPrice?: number;
  receivingPrice?: number;
  vat?: boolean;
  paymentCollection?: PaymentCollection;
  note?: string;
}

/**
 * UpdateBookingDto for in_operation/completed bookings
 * Only allows updating note
 */
export interface UpdateBookingLimitedDto {
  note?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  tourId?: string;
  travelAgencyId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Transfer booking info as returned in the transferBookings array
 * of a transferred booking's detail response.
 */
export interface TransferBookingInfo {
  bookingCode: string;
  sellingPrice: number;
  receivingPrice: number;
  debtAmount: number;
  status: BookingStatus | string;
  guestName: string;
  transferToAgency: { id: string; name: string } | null;
  tour: { name: string } | null;
}

/**
 * Detailed booking response from GET /api/v1/bookings/{id}
 * Includes additional fields like tourType, paymentStatus, and user names
 */
export interface BookingDetail {
  id: string;
  bookingCode: string;
  tourId: string;
  travelAgencyId: string | null;
  tourType: TourType;
  timeOption: TimeOption;
  departureDate: string; // ISO date string
  guestName: string;
  guestPhone: string | null;
  adultCount: number;
  childCount: number;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  adultPrice: number;
  childPrice: number;
  sellingPrice: number;
  receivingPrice: number;
  debtAmount: number | null;
  paymentCollection: PaymentCollection;
  paymentCollectionNote: string | null;
  paymentStatus: PaymentStatus | null;
  status: BookingStatus;
  tourGroupType: TourGroupType;
  note: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  createdById: string | null;
  updatedById: string | null;
  createdByName?: string | null;
  updatedByName?: string | null;

  // Transfer tracking fields
  isTransfer: boolean;
  transferFromId: string | null;
  transferToAgencyId: string | null;
  transferReason: string | null;
  transferredAt: string | null;

  // Transfer relations
  transferBookings: TransferBookingInfo[];
  transferToAgency: { id: string; name: string } | null;
}
