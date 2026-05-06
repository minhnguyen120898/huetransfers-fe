import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TravelAgency } from '@core/models/partner.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Reusable Agency Autocomplete Component
 *
 * Features:
 * - Autocomplete search filtering
 * - Two-way binding with formControl
 * - Required validation support
 * - Display function for selected value
 */
@Component({
  selector: 'app-agency-autocomplete',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './agency-autocomplete.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgencyAutocomplete {
  // Inputs
  readonly agencies = input.required<TravelAgency[]>();
  readonly selectedAgencyId = input<string>('');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('Travel Agency');
  readonly placeholder = input<string>('Search agency...');

  // Output
  readonly selectedAgencyIdChange = output<string>();

  // Internal state
  readonly searchControl = new FormControl<string | TravelAgency | null>(null);
  readonly filteredAgencies = signal<TravelAgency[]>([]);

  // Computed selected agency
  readonly selectedAgency = computed(() => {
    const id = this.selectedAgencyId();
    return this.agencies().find((agency) => agency.id === id) || null;
  });

  constructor() {
    // Filter agencies based on search input
    // Value can be: string (user typing), TravelAgency (option selected), or null
    this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      // Only filter when user is typing (string value)
      if (typeof value === 'string') {
        this.filterAgencies(value);
      }
    });

    // Initialize filtered agencies when agencies input signal changes
    effect(() => {
      const allAgencies = this.agencies();
      this.filteredAgencies.set(allAgencies);
    });

    // Set initial value when selected agency changes (on component init or edit)
    effect(() => {
      const selected = this.selectedAgency();
      if (selected && !this.searchControl.value) {
        // Only set if control is empty (initial load)
        this.searchControl.setValue(selected, { emitEvent: false });
      }
    });

    // Sync disabled state from parent
    effect(() => {
      const isDisabled = this.disabled();
      if (isDisabled) {
        this.searchControl.disable({ emitEvent: false });
      } else {
        this.searchControl.enable({ emitEvent: false });
      }
    });
  }

  private filterAgencies(searchValue: string): void {
    const search = searchValue.toLowerCase();
    const filtered = this.agencies().filter(
      (agency) =>
        agency.name.toLowerCase().includes(search) ||
        agency.tel?.toLowerCase().includes(search) ||
        agency.address?.toLowerCase().includes(search),
    );
    this.filteredAgencies.set(filtered);
  }

  onAgencySelected(agency: TravelAgency): void {
    this.selectedAgencyIdChange.emit(agency.id);
  }

  displayAgency(agency: TravelAgency | null): string {
    return agency?.name || '';
  }

  onBlur(): void {
    // If current value is a string (user typed but didn't select), reset
    const currentValue = this.searchControl.value;
    if (typeof currentValue === 'string') {
      const selected = this.selectedAgency();
      this.searchControl.setValue(selected, { emitEvent: false });
    }
  }

  get hasError(): boolean {
    return this.required() && !this.selectedAgencyId() && this.searchControl.touched;
  }
}
