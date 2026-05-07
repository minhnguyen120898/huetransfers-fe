import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  TemplateRef,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { select } from '@ngxs/store';
import { MonthFilterState } from '@core/store/month-filter';
import { SearchBar, DataTable, TableCard } from '@shared/components';
import { VndCurrencyPipe } from '@shared/pipes';
import { FULL_SCREEN_DIALOG } from '@core/config/dialog.config';
import { CarBookingDebtAgencyRow } from '@core/models/car-booking.model';
import { PaymentStatus } from '@core/models/booking.model';
import { FooterConfig } from '@shared/components/data-table/models';
import { CarBookingDebtTableDataSource } from '../../../services/debt/car-booking-debt-table-data-source';
import { CarBookingDebtState } from '../../../store/debt/car-booking-debt.state';
import {
  getCarBookingDebtTableColumns,
  CarBookingDebtTableTemplates,
} from '../../../configs/car-booking-debt-table-columns.config';
import {
  createCarBookingDebtTableActions,
  CarBookingDebtActionHandlers,
} from '../../../configs/car-booking-debt-table-actions.config';
import {
  CarBookingDebtDetailView,
  CarBookingDebtDetailViewData,
} from '../car-booking-debt-detail-view/car-booking-debt-detail-view';

interface DebtFiltersForm {
  search: FormControl<string>;
  paymentStatus: FormControl<PaymentStatus | ''>;
}

@Component({
  selector: 'app-car-booking-debt-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    SearchBar,
    DataTable,
    TableCard,
    VndCurrencyPipe,
  ],
  providers: [CarBookingDebtTableDataSource],
  templateUrl: './car-booking-debt-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarBookingDebtList implements CarBookingDebtActionHandlers {
  private readonly matDialog = inject(MatDialog);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly dataSource = inject(CarBookingDebtTableDataSource);
  readonly debtList = select(CarBookingDebtState.debtList);
  readonly selectedMonth = select(MonthFilterState.selectedMonth);
  readonly selectedYear = select(MonthFilterState.selectedYear);
  readonly PaymentStatus = PaymentStatus;

  @ViewChild('currencyTemplate', { static: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currencyTemplate!: TemplateRef<any>;

  readonly filtersForm = this.fb.group<DebtFiltersForm>({
    search: this.fb.control(''),
    paymentStatus: this.fb.control<PaymentStatus | ''>(''),
  });

  readonly columns = computed(() => {
    const templates: CarBookingDebtTableTemplates = {
      currencyTemplate: this.currencyTemplate,
    };
    return getCarBookingDebtTableColumns(templates);
  });

  readonly actions = createCarBookingDebtTableActions(this);

  readonly footerConfig = computed<FooterConfig<CarBookingDebtAgencyRow>>(() => ({
    agencyName: '',
    bookings: this.dataSource.summary()?.bookingCount ?? null,
    sellingPrice: this.dataSource.summary()?.totalSellingPrice ?? null,
    receivingPrice: this.dataSource.summary()?.totalReceivingPrice ?? null,
    totalDebt: this.dataSource.summary()?.totalDebtAmount ?? null,
  }));

  onView(row: CarBookingDebtAgencyRow): void {
    this.matDialog.open<CarBookingDebtDetailView, CarBookingDebtDetailViewData>(
      CarBookingDebtDetailView,
      {
        ...FULL_SCREEN_DIALOG,
        data: { travelAgencyId: row.agency.id },
      },
    );
  }

  onSearchChange(search: string): void {
    this.dataSource.setFilter('search', search || undefined);
  }

  onPaymentStatusChange(paymentStatus: PaymentStatus | ''): void {
    this.dataSource.setFilter('paymentStatus', paymentStatus || undefined);
  }

  onRefresh(): void {
    this.dataSource.refresh();
  }

  get grandTotal() {
    return this.debtList()?.grandTotal ?? null;
  }
}
