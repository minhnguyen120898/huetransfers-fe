import { TransportType } from '@features/operations';
import { TimeOption, TourGroupType } from './booking.model';

/**
 * Relation Types for OperationEntity
 */

// Tour relation (partial for display)
export interface TourRelation {
  id: string;
  name: string;
  description?: string | null;
  duration?: string | null;
}

// Restaurant relation (partial for display)
export interface RestaurantRelation {
  id: string;
  name: string;
  tel?: string | null;
  address?: string | null;
}

// Transport Provider relation (partial for display)
export interface TransportProviderRelation {
  id: string;
  name: string;
  vehicleType?: string | null;
  tel?: string | null;
}

// Transport Provider Assignment in Operation (NEW - for multi-provider support)
export interface TransportProviderInOperation {
  id: string; // Assignment UUID
  providerNumber: number; // Sequential: 1, 2, 3...
  transportProvider: TransportProviderRelation;
  vehicleType: string;
  nettPrice: number;
  vehicleLabel?: string | null;
  note?: string | null;
}

// Guide relation (partial for display)
export interface GuideRelation {
  id: string;
  name: string;
  tel?: string | null;
  language?: string | null;
}

// BookingOperationGuide join table with guide
export interface OperationGuideAssignment {
  id: string;
  bookingOperationId: string;
  guideId: string;
  serviceDate: Date | null;
  guideCost: number;
  dayNumber: number | null;
  note: string | null;
  guide: GuideRelation;
}

// Booking relation (partial for display)
export interface BookingRelation {
  id: string;
  bookingCode: string;
  guestName: string;
  departureDate: Date;
  status: string;
  adultCount?: number;
  childCount?: number;
  tourGroupType: TourGroupType;
  pickupLocation: string;
  note?: string;
  // Optional fields that may be included in some queries
  tourId?: string;
  travelAgencyId?: string | null;
  timeOption?: string;
  sellingPrice?: number;
  receivingPrice?: number;
}

// BookingOperationMapping join table with booking
export interface OperationBookingMapping {
  id: string;
  bookingId: string;
  bookingOperationId: string;
  transportProviderNumber?: number | null; // NEW: Which provider this booking is assigned to
  createdAt: Date;
  booking: BookingRelation;
}

// User relation (partial for audit trail)
export interface UserRelation {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Operation entity returned from backend
 * Represents the execution of a tour with associated costs
 * Matches backend OperationEntity structure
 */
export interface Operation {
  id: string;

  // Group operation fields (NEW - for many-to-many with bookings)
  tourId: string | null;
  operationDate: Date | null;
  timeOption: TimeOption | null;
  totalPax: number | null;

  // Cost and service fields
  tourNettPrice: number | null;
  restaurantId: string | null;
  restaurantNettPrice: number | null;
  restaurantServiceDate: Date | null;
  restaurantNote: string | null;
  transportServiceDate: Date | null;
  transportRoute: string | null;
  transportNote: string | null;
  totalGuideCost: number;
  otherCosts: string | null;
  totalOtherCosts: number;
  totalOperationCost: number | null;
  grossProfit: number | null;
  profitMarginPercent: number | null;
  operatedAt: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;

  // Relations (populated when included)
  tour?: TourRelation | null;
  restaurant?: RestaurantRelation | null;
  transports?: TransportProviderInOperation[];
  guides?: OperationGuideAssignment[];
  bookings?: OperationBookingMapping[];
  createdBy?: UserRelation | null;
  updatedBy?: UserRelation | null;
}

/**
 * DTO for transport provider assignment (NEW - multi-provider support)
 */
export interface TransportProviderAssignmentDto {
  transportProviderId: string; // UUID of transport provider
  providerNumber: number; // Sequential: 1, 2, 3... (unique per operation)
  vehicleType: string; // Vehicle type: 'seats_4', 'seats_7', 'seats_16', 'seats_29', 'seats_45'
  nettPrice: number; // Cost for this provider (VND)
  vehicleLabel?: string; // Optional: "Van 1", "Bus A", etc.
  note?: string; // Optional: Driver info, contact, etc.
}

/**
 * DTO for booking transport assignment (NEW - multi-provider support)
 */
export interface BookingTransportAssignmentDto {
  bookingId: string; // Booking UUID
  transportProviderNumber: number; // References providerNumber (1, 2, 3...)
}

/**
 * DTO for creating a group operation (sent to backend)
 * Matches POST /api/v1/operations/group request body
 *
 * Group operations allow multiple bookings for the same tour/date/timeOption
 * to be handled by a single operation, matching real-world tour operations.
 */
export interface CreateGroupOperationDto {
  // Required fields
  tourId: string;
  operationDate: string; // ISO format YYYY-MM-DD
  timeOption: TimeOption;
  expectedBookingIds: string[]; // Expected booking IDs for validation (prevents race conditions)

  // Optional: Specific booking IDs to include (if not provided, ALL eligible bookings included)
  bookingIds?: string[];

  // Restaurant (optional)
  restaurantId?: string;
  restaurantNettPrice?: number;
  restaurantServiceDate?: string; // ISO format YYYY-MM-DD (defaults to operationDate)
  restaurantNote?: string;

  // DEPRECATED: Single transport provider (kept for backward compatibility)
  // Use transportProviders instead
  transportProviderId?: string;
  transportNettPrice?: number;
  transportServiceDate?: string; // ISO format YYYY-MM-DD (defaults to operationDate)
  transportNote?: string;
  transportType?: TransportType; // Vehicle type/seats
  transportRoute?: string;

  // NEW: Multi-provider transport support
  transportProviders?: TransportProviderAssignmentDto[]; // Array of transport providers
  bookingTransportAssignments?: BookingTransportAssignmentDto[]; // Assign bookings to providers

  // Guides (optional) - NEW FORMAT: array of guide assignments
  guides?: {
    guideId: string;
    guideCost: number;
    serviceDate: string; // ISO format YYYY-MM-DD
    dayNumber: number;
    note?: string;
  }[];

  // Other costs (optional)
  otherCosts?: string; // Description
  totalOtherCosts?: number;

  // General (optional)
  note?: string;
}

/**
 * DTO for updating a group operation
 * All fields are optional (partial update)
 */
export interface UpdateGroupOperationDto {
  operationDate?: string;
  timeOption?: TimeOption;

  restaurantId?: string;
  restaurantNettPrice?: number;
  restaurantServiceDate?: string;
  restaurantNote?: string;

  // DEPRECATED: Single transport provider (kept for backward compatibility)
  // Use transportProviders instead
  transportProviderId?: string;
  transportNettPrice?: number;
  transportServiceDate?: string;
  transportNote?: string;
  transportType?: TransportType;
  transportRoute?: string;

  // NEW: Multi-provider transport support
  transportProviders?: TransportProviderAssignmentDto[]; // Array of transport providers
  bookingTransportAssignments?: BookingTransportAssignmentDto[]; // Reassign bookings to providers

  // Guides (optional) - NEW FORMAT: array of guide assignments
  guides?: {
    guideId: string;
    guideCost: number;
    serviceDate: string; // ISO format YYYY-MM-DD
    dayNumber: number;
    note?: string;
  }[];

  otherCosts?: string;
  totalOtherCosts?: number;

  note?: string;
}

// ============================================================================
// ADD BOOKINGS TO OPERATION
// ============================================================================

/**
 * DTO for adding bookings to an existing operation
 * Used when late bookings arrive for a date/time that already has an operation
 */
export interface AddBookingsToOperationDto {
  bookingIds: string[];
  expectedBookingIds: string[];
}

/**
 * Response from adding bookings to operation
 */
export interface AddBookingsToOperationResponse {
  operation: {
    id: string;
    tourId: string;
    operationDate: string;
    timeOption: TimeOption;
    totalPax: number;
    createdAt: string;
    updatedAt: string;
  };
  addedBookings: AddedBooking[];
  totalBookingsCount: number;
  totalPax: number;
}

export interface AddedBooking {
  id: string;
  bookingCode: string;
  guestName: string;
  adultCount: number;
  childCount: number;
  totalPax: number;
  agency: {
    id: string;
    name: string;
  } | null;
}

// ============================================================================
// GET ELIGIBLE BOOKINGS
// ============================================================================

/**
 * Response from getting eligible bookings for an operation
 */
export interface GetEligibleBookingsResponse {
  eligibleBookings: EligibleBooking[];
  count: number;
  operation: {
    id: string;
    tourId: string;
    tourName: string;
    operationDate: string;
    timeOption: TimeOption;
  };
}

/**
 * Booking that can be added to an operation
 */
export interface EligibleBooking {
  id: string;
  bookingCode: string;
  guestName: string;
  adultCount: number;
  childCount: number;
  totalPax: number;
  agency: {
    id: string;
    name: string;
  } | null;
  status: 'pending' | 'confirmed';
}

// ============================================================================
// RELATED OPERATION (for booking creation response)
// ============================================================================

/**
 * Related operation info returned when creating a booking
 * Present if an operation already exists for the booking's tour/date/time
 */
export interface RelatedOperation {
  exists: true;
  operationId: string;
  tourName: string;
  operationDate: string;
  timeOption: TimeOption;
  currentTotalPax: number | null;
  message: string;
}

// ============================================================================
// OPERATION SUMMARY (for monthly aggregation)
// ============================================================================

/**
 * Query parameters for operation summary
 */
export interface OperationSummaryQuery {
  year: number; // 2020-2100
  month: number; // 1-12
  tourId?: string; // Optional tour ID filter
}

/**
 * Response from GET /api/v1/operations/summary
 * Returns aggregated financial data for all operations in a given month
 */
export interface OperationSummaryResponse {
  tourNettPrice: number; // Total revenue from all operations (VND)
  totalOperationCost: number; // Total costs for all operations (VND)
  grossProfit: number; // Total profit (tourNettPrice - totalOperationCost)
  operationCount: number; // Number of operations in the month
  totalPax: number;
  filter: {
    year: number;
    month: number;
  };
}
