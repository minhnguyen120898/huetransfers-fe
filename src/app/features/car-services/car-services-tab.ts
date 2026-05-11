import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { CarBookingList } from './components/bookings';
import { ExpenseList } from './components/expenses';
import { CarBookingDebtList } from './components/debt';
import { CarProfitSummary, CarTransferList } from './components/profit';

@Component({
  selector: 'app-car-services-tab',
  imports: [
    MatTabsModule,
    MatCardModule,
    CarBookingList,
    ExpenseList,
    CarBookingDebtList,
    CarProfitSummary,
    CarTransferList,
  ],
  templateUrl: './car-services-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarServicesTab {}
