import { TemplateRef } from '@angular/core';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { CarBookingDebtAgencyRow } from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';

export enum CarBookingDebtColumnKey {
  STT = 'stt',
  AgencyName = 'agencyName',
  Bookings = 'bookings',
  Guests = 'guests',
  SellingPrice = 'sellingPrice',
  ReceivingPrice = 'receivingPrice',
  TotalDebt = 'totalDebt',
  PaymentStatus = 'paymentStatus',
}

export interface CarBookingDebtTableTemplates {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currencyTemplate?: TemplateRef<any>;
}

function formatVnd(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
  return `${formatted} ₫`;
}

export function getCarBookingDebtTableColumns(
  templates?: CarBookingDebtTableTemplates,
): TableColumn<CarBookingDebtAgencyRow>[] {
  return [
    {
      key: CarBookingDebtColumnKey.STT,
      header: '#',
      type: 'stt',
      width: '60px',
      align: 'center',
    },
    {
      key: CarBookingDebtColumnKey.AgencyName,
      header: 'Agency Name',
      accessor: (row) => row.agency.name,
      type: 'text',
    },
    {
      key: CarBookingDebtColumnKey.Bookings,
      header: 'Bookings',
      accessor: (row) => row.summary.totalBookings,
      type: 'number',
      align: 'center',
      width: '100px',
    },
    {
      key: CarBookingDebtColumnKey.Guests,
      header: 'Guests',
      accessor: (row) => row.summary.totalGuests,
      type: 'number',
      align: 'center',
      width: '100px',
    },
    {
      key: CarBookingDebtColumnKey.SellingPrice,
      header: 'Selling Price',
      accessor: (row) => row.summary.totalSellingPrice,
      type: templates?.currencyTemplate ? 'custom' : 'number',
      align: 'right',
      cellTemplate: templates?.currencyTemplate,
      format: (value) => formatVnd(value as number),
      width: '150px',
    },
    {
      key: CarBookingDebtColumnKey.ReceivingPrice,
      header: 'Receiving Price',
      accessor: (row) => row.summary.totalReceivingPrice,
      type: templates?.currencyTemplate ? 'custom' : 'number',
      align: 'right',
      cellTemplate: templates?.currencyTemplate,
      format: (value) => formatVnd(value as number),
      width: '150px',
    },
    {
      key: CarBookingDebtColumnKey.TotalDebt,
      header: 'Total Debt',
      accessor: (row) => row.summary.totalDebt,
      type: templates?.currencyTemplate ? 'custom' : 'number',
      align: 'right',
      cellTemplate: templates?.currencyTemplate,
      format: (value) => formatVnd(value as number),
      width: '150px',
    },
    {
      key: CarBookingDebtColumnKey.PaymentStatus,
      header: 'Payment Status',
      accessor: (row) => (row.summary.allPaid ? PaymentStatus.COMPLETED : PaymentStatus.PENDING),
      type: 'badge',
      align: 'center',
      width: '140px',
      badgeConfig: {
        colorMap: {
          [PaymentStatus.PENDING]: 'error-chip',
          [PaymentStatus.PARTIAL]: 'orange-chip',
          [PaymentStatus.COMPLETED]: 'success-chip',
        },
        labelMap: {
          [PaymentStatus.PENDING]: 'Pending',
          [PaymentStatus.PARTIAL]: 'Partial',
          [PaymentStatus.COMPLETED]: 'Completed',
        },
      },
    },
  ];
}
