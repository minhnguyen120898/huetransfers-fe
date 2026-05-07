import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CarProfitService } from '../../services/profit/car-profit.service';
import { CarProfitActions } from './car-profit.actions';
import { CarProfitStateModel } from './car-profit.models';
import { CarMonthlyProfitSummary } from '../../models/profit';

@State<CarProfitStateModel>({
  name: 'carProfit',
  defaults: {
    summary: null,
    loading: false,
    error: null,
    currentParams: null,
  },
})
@Injectable()
export class CarProfitState {
  private readonly carProfitService = inject(CarProfitService);

  @Selector()
  static summary(state: CarProfitStateModel): CarMonthlyProfitSummary | null {
    return state.summary;
  }

  @Selector()
  static loading(state: CarProfitStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: CarProfitStateModel): string | null {
    return state.error;
  }

  @Selector()
  static currentParams(state: CarProfitStateModel) {
    return state.currentParams;
  }

  @Action(CarProfitActions.LoadCarProfitSummary)
  loadCarProfitSummary(
    ctx: StateContext<CarProfitStateModel>,
    action: CarProfitActions.LoadCarProfitSummary,
  ) {
    ctx.patchState({ loading: true, error: null, currentParams: action.params });

    return this.carProfitService.getCarProfitSummary(action.params).pipe(
      tap((summary) => {
        ctx.patchState({ summary, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({
          error: error.message || 'Failed to load car profit summary',
          loading: false,
        });
        return of(null);
      }),
    );
  }

  @Action(CarProfitActions.ClearCarProfitData)
  clearCarProfitData(ctx: StateContext<CarProfitStateModel>) {
    ctx.patchState({ summary: null, currentParams: null, error: null });
  }

  @Action(CarProfitActions.ClearError)
  clearError(ctx: StateContext<CarProfitStateModel>) {
    ctx.patchState({ error: null });
  }
}
