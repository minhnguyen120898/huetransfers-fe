import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  ViewChild,
  TemplateRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  TravelAgency,
  CreateTravelAgencyDto,
  UpdateTravelAgencyDto,
} from '@core/models/partner.model';
import {
  AgencyDataService,
  NgxsAgencyDataService,
  AgencyTableDataSource,
  AgencyFormDialog,
} from '@features/agencies';
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { TableCard } from '@shared/components/table-card/table-card';
import { MEDIUM_DIALOG } from '@core/config/dialog.config';

// Import configurations and enums
import { getAgencyTableColumns } from '../../configs/agency-table-columns.config';
import {
  createAgencyTableActions,
  AgencyActionHandlers,
} from '../../configs/agency-table-actions.config';
import {
  AgencyStatusFilter,
  AgencyFilterKey,
  SEARCH_DEBOUNCE_TIME,
} from '../../models/agency.enums';

/**
 * Type-safe filter form interface
 */
interface AgencyFiltersForm {
  search: FormControl<string>;
  isActive: FormControl<AgencyStatusFilter>;
}

@Component({
  selector: 'app-agency-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    DataTable,
    SearchBar,
    TableCard,
  ],
  providers: [
    AgencyTableDataSource,
    { provide: AgencyDataService, useClass: NgxsAgencyDataService },
  ],
  templateUrl: './agency-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgencyListComponent implements OnInit, AgencyActionHandlers {
  // ===== Dependencies =====
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly dataSource = inject(AgencyTableDataSource);

  // ===== Template References =====
  @ViewChild('statusToggleTemplate', { static: true })
  statusToggleTemplate!: TemplateRef<any>;

  // ===== Enums for Template =====
  readonly AgencyStatusFilter = AgencyStatusFilter;
  readonly AgencyFilterKey = AgencyFilterKey;

  // ===== Form =====
  readonly filtersForm = this.fb.group<AgencyFiltersForm>({
    search: this.fb.control(''),
    isActive: this.fb.control(AgencyStatusFilter.All),
  });

  // ===== Table Configuration =====
  columns: TableColumn<TravelAgency>[] = [];
  readonly actions: TableAction<TravelAgency>[] = createAgencyTableActions(this);

  // ===== Lifecycle =====
  ngOnInit(): void {
    // Initialize columns with toggle template
    this.columns = getAgencyTableColumns(this.statusToggleTemplate);

    this.dataSource.loadData();
    this.setupFilters();
  }

  // ===== Filter Setup (Private) =====
  private setupFilters(): void {
    // Search filter with debounce
    this.filtersForm.controls.search.valueChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search: string) => {
        this.dataSource.setFilter(AgencyFilterKey.Search, search || undefined);
      });

    // Status filter
    this.filtersForm.controls.isActive.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: AgencyStatusFilter) => {
        const isActiveFilter =
          value === AgencyStatusFilter.All ? undefined : value === AgencyStatusFilter.Active;
        this.dataSource.setFilter(AgencyFilterKey.IsActive, isActiveFilter);
      });
  }

  // ===== Public API (UI Handlers) =====

  onSearchChange(searchTerm: string): void {
    this.filtersForm.controls.search.setValue(searchTerm);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AgencyFormDialog, MEDIUM_DIALOG);

    dialogRef.afterClosed().subscribe((result: CreateTravelAgencyDto | null) => {
      if (result) {
        this.dataSource.createAgency(result);
      }
    });
  }

  // ===== Action Handlers (Implements AgencyActionHandlers) =====

  onEdit(agency: TravelAgency): void {
    const dialogRef = this.dialog.open(AgencyFormDialog, {
      ...MEDIUM_DIALOG,
      data: { agency },
    });

    dialogRef.afterClosed().subscribe((result: UpdateTravelAgencyDto | null) => {
      if (result) {
        this.dataSource.updateAgency(agency.id, result);
      }
    });
  }

  onDelete(agency: TravelAgency): void {
    const newStatus = !agency.isActive;
    const action = newStatus ? 'activate' : 'deactivate';

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: `${this.capitalizeFirst(action)} Agency`,
        message: `Are you sure you want to ${action} "${agency.name}"?`,
        confirmText: this.capitalizeFirst(action),
        cancelText: 'Cancel',
        confirmColor: newStatus ? 'primary' : 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        if (newStatus) {
          // Activating: Use PUT API to update isActive = true
          this.dataSource.toggleActiveStatus(agency.id, newStatus);
        } else {
          // Deactivating: Use DELETE API (soft delete)
          this.dataSource.deleteAgency(agency.id);
        }
      }
    });
  }

  // ===== Utility Methods (Private) =====

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
