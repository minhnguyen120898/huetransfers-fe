import { TemplateRef } from '@angular/core';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import {
  CarBooking,
  CarBookingStatus,
  CarPaymentCollection,
  TransportType,
} from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';
import { CarBookingColumnKey } from '../models/bookings/car-booking.enums';

export interface CarBookingTableTemplates {
  serviceDateTemplate?: TemplateRef<{ $implicit: CarBooking; value: unknown }>;
  pickupDropoffTemplate?: TemplateRef<{ $implicit: CarBooking; value: unknown }>;
  agencyTemplate?: TemplateRef<{ $implicit: CarBooking; value: unknown }>;
  currencyTemplate?: TemplateRef<{ $implicit: CarBooking; value: unknown }>;
}

const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  [TransportType.SEATS_4]: '4 Seats',
  [TransportType.SEATS_7]: '7 Seats',
  [TransportType.SEATS_16]: '16 Seats',
  [TransportType.SEATS_29]: '29 Seats',
  [TransportType.SEATS_45]: '45 Seats',
};

const STATUS_COLOR_MAP: Record<CarBookingStatus, string> = {
  [CarBookingStatus.CONFIRMED]: 'blue-chip',
  [CarBookingStatus.COMPLETED]: 'success-chip',
  [CarBookingStatus.CANCELLED]: 'error-chip',
  [CarBookingStatus.TRANSFERRED]: 'orange-chip',
};

const STATUS_LABEL_MAP: Record<CarBookingStatus, string> = {
  [CarBookingStatus.CONFIRMED]: 'Confirmed',
  [CarBookingStatus.COMPLETED]: 'Completed',
  [CarBookingStatus.CANCELLED]: 'Cancelled',
  [CarBookingStatus.TRANSFERRED]: 'Transferred',
};

const PAYMENT_STATUS_COLOR_MAP: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'error-chip',
  [PaymentStatus.PARTIAL]: 'orange-chip',
  [PaymentStatus.COMPLETED]: 'success-chip',
};

const PAYMENT_STATUS_LABEL_MAP: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PARTIAL]: 'Partial',
  [PaymentStatus.COMPLETED]: 'Paid',
};

export function getCarBookingTableColumns(
  templates?: CarBookingTableTemplates,
): TableColumn<CarBooking>[] {
  return [
    {
      key: CarBookingColumnKey.ServiceDate,
      header: 'Service Date',
      accessor: (row) => row.serviceDate,
      type: templates?.serviceDateTemplate ? 'custom' : 'date',
      width: '130px',
      ...(templates?.serviceDateTemplate && { cellTemplate: templates.serviceDateTemplate }),
    },
    {
      key: CarBookingColumnKey.BookingCode,
      header: 'Booking Code',
      accessor: (row) => row.bookingCode,
      type: 'text',
      width: '180px',
    },
    {
      key: CarBookingColumnKey.Agency,
      header: 'Agency',
      accessor: (row) => row.travelAgency?.name || '-',
      type: 'text',
      width: '160px',
    },
    {
      key: CarBookingColumnKey.GuestName,
      header: 'Guest',
      accessor: (row) => row.guestName,
      type: 'text',
      width: '150px',
    },
    {
      key: CarBookingColumnKey.VehicleType,
      header: 'Vehicle',
      accessor: (row) => TRANSPORT_TYPE_LABELS[row.vehicleType] ?? row.vehicleType,
      type: 'text',
      align: 'center',
      width: '100px',
    },
    {
      key: CarBookingColumnKey.SellingPrice,
      header: 'Selling Price',
      accessor: (row) => row.sellingPrice,
      type: templates?.currencyTemplate ? 'custom' : 'text',
      align: 'right',
      width: '140px',
      ...(templates?.currencyTemplate && { cellTemplate: templates.currencyTemplate }),
    },
    {
      key: CarBookingColumnKey.ReceivingPrice,
      header: 'Receiving Price',
      accessor: (row) => row.receivingPrice,
      type: templates?.currencyTemplate ? 'custom' : 'text',
      align: 'right',
      width: '150px',
      ...(templates?.currencyTemplate && { cellTemplate: templates.currencyTemplate }),
    },
    {
      key: CarBookingColumnKey.DebtAmount,
      header: 'Debt',
      accessor: (row) => row.debtAmount,
      type: templates?.currencyTemplate ? 'custom' : 'text',
      align: 'right',
      width: '130px',
      ...(templates?.currencyTemplate && { cellTemplate: templates.currencyTemplate }),
    },
    {
      key: CarBookingColumnKey.PaymentStatus,
      header: 'Payment',
      accessor: (row) => row.paymentStatus,
      type: 'badge',
      align: 'center',
      width: '110px',
      badgeConfig: {
        colorMap: PAYMENT_STATUS_COLOR_MAP,
        labelMap: PAYMENT_STATUS_LABEL_MAP,
      },
    },
    {
      key: CarBookingColumnKey.Status,
      header: 'Status',
      accessor: (row) => row.status,
      type: 'badge',
      align: 'center',
      width: '130px',
      badgeConfig: {
        colorMap: STATUS_COLOR_MAP,
        labelMap: STATUS_LABEL_MAP,
      },
    },
  ];
}
