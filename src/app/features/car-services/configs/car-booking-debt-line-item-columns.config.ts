import { TemplateRef } from '@angular/core';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { CarBookingDebtLineItem, TransportType } from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';
import { formatDate, DateFormat } from '@core/config/date.config';

export enum CarBookingDebtLineItemColumnKey {
  STT = 'stt',
  ServiceDate = 'serviceDate',
  GuestName = 'guestName',
  VehicleType = 'vehicleType',
  Routes = 'routes',
  PickupLocation = 'pickupLocation',
  DropoffLocation = 'dropoffLocation',
  GuestCount = 'guestCount',
  SellingPrice = 'sellingPrice',
  ReceivingPrice = 'receivingPrice',
  DebtAmount = 'debtAmount',
  PaymentStatus = 'paymentStatus',
  Note = 'note',
}

const VEHICLE_LABELS: Record<TransportType, string> = {
  [TransportType.SEATS_4]: '4 chỗ',
  [TransportType.SEATS_7]: '7 chỗ',
  [TransportType.SEATS_16]: '16 chỗ',
  [TransportType.SEATS_29]: '29 chỗ',
  [TransportType.SEATS_45]: '45 chỗ',
};

export interface CarBookingDebtLineItemTemplates {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currencyTemplate?: TemplateRef<any>;
}

export function getCarBookingDebtLineItemColumns(
  templates?: CarBookingDebtLineItemTemplates,
): TableColumn<CarBookingDebtLineItem>[] {
  return [
    {
      key: CarBookingDebtLineItemColumnKey.STT,
      header: '#',
      type: 'stt',
      width: '60px',
      align: 'center',
    },
    {
      key: CarBookingDebtLineItemColumnKey.ServiceDate,
      header: 'Service Date',
      accessor: (row) => row.serviceDate,
      type: 'text',
      format: (value) => formatDate(value as string, DateFormat.SHORT_DATE),
      width: '120px',
    },
    {
      key: CarBookingDebtLineItemColumnKey.GuestName,
      header: 'Guest',
      accessor: (row) => row.guestName,
      type: 'text',
    },
    {
      key: CarBookingDebtLineItemColumnKey.VehicleType,
      header: 'Vehicle',
      accessor: (row) => row.vehicleType,
      type: 'text',
      format: (value) => VEHICLE_LABELS[value as TransportType] ?? String(value),
      width: '100px',
    },
    {
      key: CarBookingDebtLineItemColumnKey.Routes,
      header: 'Routes',
      accessor: (row) => row.routes,
      type: 'text',
    },
    {
      key: CarBookingDebtLineItemColumnKey.PickupLocation,
      header: 'Pickup',
      accessor: (row) => row.pickupLocation,
      type: 'text',
    },
    {
      key: CarBookingDebtLineItemColumnKey.DropoffLocation,
      header: 'Dropoff',
      accessor: (row) => row.dropoffLocation,
      type: 'text',
    },
    {
      key: CarBookingDebtLineItemColumnKey.GuestCount,
      header: 'PAX',
      accessor: (row) => row.guestCount,
      type: 'number',
      align: 'center',
      width: '70px',
    },
    {
      key: CarBookingDebtLineItemColumnKey.SellingPrice,
      header: 'Selling',
      accessor: (row) => row.sellingPrice,
      type: templates?.currencyTemplate ? 'custom' : 'number',
      align: 'right',
      cellTemplate: templates?.currencyTemplate,
      width: '130px',
    },
    {
      key: CarBookingDebtLineItemColumnKey.ReceivingPrice,
      header: 'Receiving',
      accessor: (row) => row.receivingPrice,
      type: templates?.currencyTemplate ? 'custom' : 'number',
      align: 'right',
      cellTemplate: templates?.currencyTemplate,
      width: '130px',
    },
    {
      key: CarBookingDebtLineItemColumnKey.DebtAmount,
      header: 'Debt',
      accessor: (row) => row.debtAmount,
      type: templates?.currencyTemplate ? 'custom' : 'number',
      align: 'right',
      cellTemplate: templates?.currencyTemplate,
      cellClass: 'font-semibold text-red-600',
      width: '130px',
    },
    {
      key: CarBookingDebtLineItemColumnKey.PaymentStatus,
      header: 'Status',
      accessor: (row) => row.paymentStatus,
      type: 'badge',
      align: 'center',
      width: '120px',
      badgeConfig: {
        colorMap: {
          [PaymentStatus.PENDING]: 'error-chip',
          [PaymentStatus.PARTIAL]: 'orange-chip',
          [PaymentStatus.COMPLETED]: 'success-chip',
        },
        labelMap: {
          [PaymentStatus.PENDING]: 'Pending',
          [PaymentStatus.PARTIAL]: 'Partial',
          [PaymentStatus.COMPLETED]: 'Paid',
        },
      },
    },
    {
      key: CarBookingDebtLineItemColumnKey.Note,
      header: 'Note',
      accessor: (row) => row.note,
      type: 'text',
    },
  ];
}
