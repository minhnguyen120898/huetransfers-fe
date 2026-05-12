import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, FormControl } from '@angular/forms';
import { format, endOfMonth, parseISO } from 'date-fns';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { select, Store } from '@ngxs/store';
import { MonthFilterState } from '@core/store/month-filter';
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { TableCard } from '@shared/components/table-card/table-card';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { RightSideSheetService, DateRangePicker, DateRange } from '@shared/components';
import { VndCurrencyPipe } from '@shared/pipes';
import { LARGE_DIALOG } from '@core/config/dialog.config';
import { AgencyActions } from '@features/agencies/store/agency.actions';
import {
  CarBooking,
  CarBookingStatus,
  CreateCarBookingDto,
  UpdateCarBookingDto,
  TransferCarBookingDto,
  UpdateCarBookingTransferPricingDto,
  UpdateCarOriginalPricingDto,
} from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';
import { CarBookingActions } from '../../../store/bookings/car-booking.actions';
import {
  CarBookingDataService,
  NgxsCarBookingDataService,
  CarBookingTableDataSource,
} from '../../../services/bookings';
import {
  getCarBookingTableColumns,
  CarBookingTableTemplates,
} from '../../../configs/car-booking-table-columns.config';
import {
  createCarBookingTableActions,
  CarBookingActionHandlers,
} from '../../../configs/car-booking-table-actions.config';
import { CarBookingStatusFilter } from '../../../models/bookings/car-booking.enums';
import { CarBookingFormDialog } from '../car-booking-form-dialog/car-booking-form-dialog';
import { CarBookingDetailView } from '../car-booking-detail-view/car-booking-detail-view';
import { TransferCarBookingDialog } from '../transfer-car-booking-dialog/transfer-car-booking-dialog';
import { EditTransferPricingDialog } from '../edit-transfer-pricing-dialog/edit-transfer-pricing-dialog';
import { EditOriginalPricingDialog } from '../edit-original-pricing-dialog/edit-original-pricing-dialog';

interface CarBookingFiltersForm {
  search: FormControl<string>;
  status: FormControl<CarBookingStatusFilter>;
  paymentStatus: FormControl<PaymentStatus | ''>;
  travelAgencyId: FormControl<string>;
  serviceDateFrom: FormControl<string>;
  serviceDateTo: FormControl<string>;
}

@Component({
  selector: 'app-car-booking-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    DataTable,
    SearchBar,
    TableCard,
    VndCurrencyPipe,
    DateRangePicker,
  ],
  providers: [
    CarBookingTableDataSource,
    { provide: CarBookingDataService, useClass: NgxsCarBookingDataService },
  ],
  templateUrl: './car-booking-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarBookingList implements OnInit, CarBookingActionHandlers {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);
  private readonly sideSheetService = inject(RightSideSheetService);
  readonly dataSource = inject(CarBookingTableDataSource);

  // Global month filter
  readonly selectedMonth = select(MonthFilterState.selectedMonth);
  readonly selectedYear = select(MonthFilterState.selectedYear);
  readonly dateRange = select(MonthFilterState.dateRange);

  readonly defaultDateRange = computed<DateRange>(() => {
    const range = this.dateRange();
    return {
      start: new Date(),
      end: endOfMonth(parseISO(range.endDate)),
    };
  });

  // Enums for template
  readonly CarBookingStatusFilter = CarBookingStatusFilter;
  readonly CarBookingStatus = CarBookingStatus;
  readonly PaymentStatus = PaymentStatus;

  // Template references for custom columns
  @ViewChild('currencyTemplate', { static: true }) currencyTemplate!: TemplateRef<{
    $implicit: CarBooking;
    value: unknown;
  }>;
  @ViewChild('serviceDateTemplate', { static: true }) serviceDateTemplate!: TemplateRef<{
    $implicit: CarBooking;
    value: unknown;
  }>;

  readonly filtersForm = this.fb.group<CarBookingFiltersForm>({
    search: this.fb.control(''),
    status: this.fb.control(CarBookingStatusFilter.All),
    paymentStatus: this.fb.control<PaymentStatus | ''>(''),
    travelAgencyId: this.fb.control(''),
    serviceDateFrom: this.fb.control(''),
    serviceDateTo: this.fb.control(''),
  });

  columns: TableColumn<CarBooking>[] = [];
  readonly actions: TableAction<CarBooking>[] = createCarBookingTableActions(this);

  constructor() {
    // Auto-load when month filter changes
    effect(() => {
      const def = this.defaultDateRange();
      untracked(() => {
        this.dataSource.setFilters({
          serviceDateFrom: format(def.start!, 'yyyy-MM-dd'),
          serviceDateTo: format(def.end!, 'yyyy-MM-dd'),
        });
        this.loadCountByStatus();
      });
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new AgencyActions.LoadAgencies({ limit: 100, isActive: true }));

    const templates: CarBookingTableTemplates = {
      currencyTemplate: this.currencyTemplate,
      serviceDateTemplate: this.serviceDateTemplate,
    };
    this.columns = getCarBookingTableColumns(templates);
  }

  private loadCountByStatus(): void {
    const range = this.dateRange();
    if (range) {
      this.store.dispatch(
        new CarBookingActions.LoadCountByStatus({
          serviceDateFrom: range.startDate,
          serviceDateTo: range.endDate,
        }),
      );
    }
  }

  onSearchChange(searchTerm: string): void {
    this.dataSource.setFilter('search', searchTerm || undefined);
  }

  onStatusChange(status: CarBookingStatusFilter): void {
    this.dataSource.setFilter('status', status || undefined);
  }

  onPaymentStatusChange(paymentStatus: PaymentStatus | ''): void {
    this.dataSource.setFilter('paymentStatus', paymentStatus || undefined);
  }

  onDateRangeChange(range: DateRange): void {
    if (range.start && range.end) {
      this.dataSource.setFilters({
        serviceDateFrom: format(range.start, 'yyyy-MM-dd'),
        serviceDateTo: format(range.end, 'yyyy-MM-dd'),
      });
    } else {
      const def = this.defaultDateRange();
      this.dataSource.setFilters({
        serviceDateFrom: format(def.start!, 'yyyy-MM-dd'),
        serviceDateTo: format(def.end!, 'yyyy-MM-dd'),
      });
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CarBookingFormDialog, {
      ...LARGE_DIALOG,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: CreateCarBookingDto | null) => {
      if (result) {
        this.dataSource.createCarBooking(result);
      }
    });
  }

  // CarBookingActionHandlers

  onView(booking: CarBooking): void {
    this.sideSheetService.open({
      title: `Car Booking — ${booking.bookingCode}`,
      component: CarBookingDetailView,
      data: booking,
    });
  }

  onEdit(booking: CarBooking): void {
    if (booking.status === CarBookingStatus.TRANSFERRED) {
      const dialogRef = this.dialog.open(EditOriginalPricingDialog, {
        width: '450px',
        disableClose: true,
        data: { booking },
      });
      dialogRef.afterClosed().subscribe((dto: UpdateCarOriginalPricingDto | null) => {
        if (dto) {
          this.store
            .dispatch(new CarBookingActions.UpdateOriginalPricing(booking.id, dto))
            .subscribe(() => this.dataSource.refresh());
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(CarBookingFormDialog, {
      ...LARGE_DIALOG,
      disableClose: true,
      data: { booking },
    });

    dialogRef.afterClosed().subscribe((result: UpdateCarBookingDto | null) => {
      if (result) {
        this.dataSource.updateCarBooking(booking.id, result);
      }
    });
  }

  onCancel(booking: CarBooking): void {
    const isTransfer = booking.status === CarBookingStatus.TRANSFERRED;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: isTransfer ? 'Cancel Transfer' : 'Cancel Car Booking',
        message: isTransfer
          ? `Are you sure you want to cancel the transfer for booking "${booking.bookingCode}"? This will cancel both the original and the compensation booking.`
          : `Are you sure you want to cancel booking "${booking.bookingCode}"?`,
        confirmText: isTransfer ? 'Cancel Transfer' : 'Cancel Booking',
        cancelText: 'Close',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        if (isTransfer) {
          this.store.dispatch(new CarBookingActions.CancelTransfer(booking.id));
        } else {
          this.dataSource.cancelCarBooking(booking.id);
        }
      }
    });
  }

  onTransfer(booking: CarBooking): void {
    const dialogRef = this.dialog.open(TransferCarBookingDialog, {
      width: '500px',
      disableClose: true,
      data: { booking },
    });

    dialogRef.afterClosed().subscribe((dto: TransferCarBookingDto | null) => {
      if (dto) {
        this.store
          .dispatch(new CarBookingActions.TransferCarBooking(booking.id, dto))
          .subscribe(() => this.dataSource.refresh());
      }
    });
  }

  onUpdateTransferPricing(booking: CarBooking): void {
    const dialogRef = this.dialog.open(EditTransferPricingDialog, {
      width: '450px',
      disableClose: true,
      data: { booking },
    });

    dialogRef.afterClosed().subscribe((dto: UpdateCarBookingTransferPricingDto | null) => {
      if (dto) {
        this.store
          .dispatch(new CarBookingActions.UpdateTransferPricing(booking.id, dto))
          .subscribe(() => this.dataSource.refresh());
      }
    });
  }

  getRowClass = (booking: CarBooking): string => {
    if (booking.status === CarBookingStatus.TRANSFERRED) return 'booking-pending-confirmed';
    return '';
  };
}
