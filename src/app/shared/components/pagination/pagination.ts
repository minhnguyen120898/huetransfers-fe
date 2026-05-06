import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginatorModule, PageEvent as MatPageEvent } from '@angular/material/paginator';

export interface PageEvent {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  imports: [MatPaginatorModule],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  page = input.required<number>();
  pageSize = input.required<number>();
  total = input.required<number>();
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  pageChange = output<PageEvent>();

  // Convert 1-based page to 0-based pageIndex for mat-paginator
  pageIndex = computed(() => this.page() - 1);

  onPageChange(event: MatPageEvent): void {
    // Convert 0-based pageIndex to 1-based page
    this.pageChange.emit({
      page: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
  }
}
