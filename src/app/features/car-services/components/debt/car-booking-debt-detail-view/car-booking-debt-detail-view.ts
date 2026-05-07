import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { select, Store } from '@ngxs/store';
import { VndCurrencyPipe } from '@shared/pipes';
import {
  LoadingSpinner,
  ErrorState,
  Dialog,
  DialogContent,
  DialogHeader,
  DataTable,
  ConfirmDialog,
} from '@shared/components';
import { CarBookingActions } from '../../../store/bookings/car-booking.actions';
import { BulkPaymentStatusDto } from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';
import { MonthFilterState } from '@core/store/month-filter';
import { TableColumn } from '@shared/components/data-table/models';
import { CarBookingDebtState } from '../../../store/debt/car-booking-debt.state';
import { CarBookingDebtActions } from '../../../store/debt/car-booking-debt.actions';
import { CarBookingDebtDetailDataSource } from '../../../services/debt/car-booking-debt-detail-datasource';
import {
  getCarBookingDebtLineItemColumns,
  CarBookingDebtLineItemTemplates,
} from '../../../configs/car-booking-debt-line-item-columns.config';
import { CarBookingDebtLineItem } from '@core/models/car-booking.model';

export interface CarBookingDebtDetailViewData {
  travelAgencyId: string;
}

@Component({
  selector: 'app-car-booking-debt-detail-view',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    VndCurrencyPipe,
    LoadingSpinner,
    ErrorState,
    Dialog,
    DialogContent,
    DialogHeader,
    DataTable,
  ],
  providers: [CarBookingDebtDetailDataSource],
  templateUrl: './car-booking-debt-detail-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarBookingDebtDetailView implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly dialogData = inject<CarBookingDebtDetailViewData>(MAT_DIALOG_DATA);

  private readonly month = select(MonthFilterState.selectedMonth);
  private readonly year = select(MonthFilterState.selectedYear);

  readonly dataSource = inject(CarBookingDebtDetailDataSource);
  readonly data = select(CarBookingDebtState.selectedAgencyDetail);
  readonly loading = select(CarBookingDebtState.detailLoading);
  readonly error = select(CarBookingDebtState.detailError);
  readonly exportLoading = select(CarBookingDebtState.exportLoading);

  @ViewChild('currencyTemplate', { static: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currencyTemplate!: TemplateRef<any>;

  columns: TableColumn<CarBookingDebtLineItem>[] = [];

  readonly selectedCount = computed(() => this.dataSource.selectedRows().length);
  readonly hasSelection = computed(() => this.selectedCount() > 0);

  isBookingPaid = (row: CarBookingDebtLineItem): boolean => {
    return row.paymentStatus === PaymentStatus.COMPLETED;
  };

  constructor() {
    effect(() => {
      const report = this.data();
      if (report) {
        this.dataSource.setBookings(report.agency.bookings);
      }
    });

    effect(() => {
      this.dataSource.setLoadingState(this.loading());
    });

    effect(() => {
      this.dataSource.setErrorState(this.error());
    });
  }

  ngOnInit(): void {
    const templates: CarBookingDebtLineItemTemplates = {
      currencyTemplate: this.currencyTemplate,
    };
    this.columns = getCarBookingDebtLineItemColumns(templates);
    this.loadData();
  }

  private loadData(): void {
    this.store.dispatch(
      new CarBookingDebtActions.LoadCarBookingDebtDetail(this.dialogData.travelAgencyId, {
        year: this.year(),
        month: this.month(),
      }),
    );
  }

  exportToExcel(): void {
    this.store.dispatch(
      new CarBookingDebtActions.ExportCarBookingDebtExcel(this.dialogData.travelAgencyId, {
        year: this.year(),
        month: this.month(),
        paymentStatus: 'pending,partial',
      }),
    );
  }

  onMarkAsPaid(): void {
    const selected = this.dataSource.selectedRows();
    if (selected.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Mark as Paid',
        message: `Are you sure you want to mark ${selected.length} booking(s) as paid?`,
        confirmText: 'Mark as Paid',
        cancelText: 'Cancel',
        color: 'primary',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      const dto: BulkPaymentStatusDto = {
        bookingIds: selected.map((b) => b.id),
        paymentStatus: PaymentStatus.COMPLETED,
      };
      this.store.dispatch(new CarBookingActions.BulkUpdatePaymentStatus(dto)).subscribe(() => {
        this.dataSource.deselectAll();
        this.loadData();
      });
    });
  }
}
