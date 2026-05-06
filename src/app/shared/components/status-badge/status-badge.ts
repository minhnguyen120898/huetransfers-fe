import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { BookingStatus } from '@core/models/booking.model';

export type PaymentStatus = 'pending' | 'partial' | 'completed';

@Component({
  selector: 'app-status-badge',
  imports: [NgClass],
  templateUrl: './status-badge.html',
  styles: `
    :host {
      display: inline-block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  status = input.required<BookingStatus | PaymentStatus | string>();
  type = input<'booking' | 'payment' | 'custom'>('booking');

  statusClasses = computed(() => {
    const status = this.status().toLowerCase();
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    const statusMap: Record<string, string> = {
      // Booking statuses
      pending: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_operation: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',

      // Payment statuses
      partial: 'bg-yellow-100 text-yellow-800',
    };

    const colorClass = statusMap[status] || 'bg-gray-100 text-gray-800';
    return `${baseClasses} ${colorClass}`;
  });

  displayText = computed(() => {
    const status = this.status();
    // Convert snake_case to Title Case
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  });
}
