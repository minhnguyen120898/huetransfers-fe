import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { CarTransferDetail } from '../models/profit';

const formatVnd = (value: unknown): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

export function getCarTransferTableColumns(): TableColumn<CarTransferDetail>[] {
  return [
    {
      key: 'stt',
      header: '#',
      type: 'stt',
    },
    {
      key: 'originalBookingCode',
      header: 'Original Code',
      type: 'text',
    },
    {
      key: 'transferBookingCode',
      header: 'Transfer Code',
      type: 'text',
    },
    {
      key: 'partnerAgencyName',
      header: 'Partner Agency',
      type: 'text',
    },
    {
      key: 'originalSellingPrice',
      header: 'Original Price',
      type: 'text',
      format: (value) => formatVnd(value),
    },
    {
      key: 'compensationAmount',
      header: 'Compensation',
      type: 'text',
      format: (value) => formatVnd(value),
    },
    {
      key: 'netCost',
      header: 'Net Cost',
      type: 'text',
      format: (value) => formatVnd(value),
    },
  ];
}
