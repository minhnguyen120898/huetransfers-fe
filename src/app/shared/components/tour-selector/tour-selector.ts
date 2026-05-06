import { Component, OnInit, inject, computed, effect } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store, select } from '@ngxs/store';
import { TourState, TourActions } from '@features/tours';
import { Tour, TourType } from '@core/models/tour.model';

@Component({
  selector: 'app-tour-selector',
  imports: [MatFormFieldModule, MatSelectModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './tour-selector.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
})
export class TourSelectorComponent implements OnInit {
  private readonly store = inject(Store);

  readonly allTours = select(TourState.selectorTours);
  readonly selectedTour = select(TourState.selectedTour);
  readonly loading = select(TourState.loading);

  readonly publicTours = computed(() => {
    return (
      this.allTours()?.filter((tour) => tour.tourType === TourType.PUBLIC && tour.isActive) || []
    );
  });

  constructor() {
    effect(() => {
      const tours = this.publicTours();
      const selected = this.selectedTour();
      const isLoading = this.loading();

      if (!isLoading && tours.length > 0 && !selected) {
        this.store.dispatch(new TourActions.SelectTour(tours[0]));
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new TourActions.LoadSelectorTours({ limit: 100, isActive: true }));
  }

  onTourChange(tour: Tour | null): void {
    this.store.dispatch(new TourActions.SelectTour(tour));
  }

  compareTours(tour1: Tour | null, tour2: Tour | null): boolean {
    return tour1?.id === tour2?.id;
  }
}
