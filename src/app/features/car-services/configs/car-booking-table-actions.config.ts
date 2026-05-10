import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { CarBooking, CarBookingStatus } from '@core/models/car-booking.model';
import { CarBookingActionId } from '../models/bookings/car-booking.enums';

export interface CarBookingActionHandlers {
  onView: (booking: CarBooking) => void;
  onEdit: (booking: CarBooking) => void;
  onCancel: (booking: CarBooking) => void;
  onTransfer: (booking: CarBooking) => void;
  onUpdateTransferPricing: (booking: CarBooking) => void;
}

const isEditDisabled = (booking: CarBooking): boolean =>
  booking.status === CarBookingStatus.CANCELLED || booking.status === CarBookingStatus.TRANSFERRED;

const isCancelDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.CONFIRMED &&
  booking.status !== CarBookingStatus.TRANSFERRED;

const isTransferDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.CONFIRMED || booking.isTransfer;

const isUpdateTransferPricingDisabled = (booking: CarBooking): boolean =>
  booking.status !== CarBookingStatus.TRANSFERRED;

export function createCarBookingTableActions(
  handlers: CarBookingActionHandlers,
): TableAction<CarBooking>[] {
  return [
    {
      id: CarBookingActionId.View,
      icon: 'visibility',
      tooltip: 'View Details',
      color: 'primary',
      handler: (booking) => handlers.onView(booking),
    },
    {
      id: CarBookingActionId.Edit,
      icon: 'edit',
      tooltip: 'Edit',
      color: 'primary',
      handler: (booking) => handlers.onEdit(booking),
      disabled: (booking: CarBooking) => isEditDisabled(booking),
    },
    {
      id: CarBookingActionId.Transfer,
      icon: 'swap_horiz',
      tooltip: 'Transfer to Partner',
      color: 'accent',
      handler: (booking) => handlers.onTransfer(booking),
      disabled: (booking: CarBooking) => isTransferDisabled(booking),
    },
    {
      id: CarBookingActionId.UpdateTransferPricing,
      icon: 'price_change',
      tooltip: 'Update Transfer Pricing',
      color: 'accent',
      handler: (booking) => handlers.onUpdateTransferPricing(booking),
      disabled: (booking: CarBooking) => isUpdateTransferPricingDisabled(booking),
    },
    {
      id: CarBookingActionId.Cancel,
      icon: 'cancel',
      tooltip: 'Cancel',
      color: 'warn',
      handler: (booking) => handlers.onCancel(booking),
      disabled: (booking: CarBooking) => isCancelDisabled(booking),
    },
  ];
}
