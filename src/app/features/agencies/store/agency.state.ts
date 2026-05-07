import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AgencyService } from '../services/agency.service';
import { AgencyActions } from './agency.actions';
import { AgencyStateModel, agencyStateDefaults } from './agency.models';
import { TravelAgency } from '@core/models/partner.model';
import { PaginationMeta } from '@core/models/api.model';
import { NotificationService } from '@core/services/notification.service';

@State<AgencyStateModel>({
  name: 'agencies',
  defaults: agencyStateDefaults,
})
@Injectable()
export class AgencyState {
  private readonly agencyService = inject(AgencyService);
  private readonly notificationService = inject(NotificationService);

  // Selectors
  @Selector()
  static agencies(state: AgencyStateModel): TravelAgency[] {
    return state.agencies;
  }

  @Selector()
  static selectedAgency(state: AgencyStateModel): TravelAgency | null {
    return state.selectedAgency;
  }

  @Selector()
  static loading(state: AgencyStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AgencyStateModel): string | null {
    return state.error;
  }

  @Selector()
  static meta(state: AgencyStateModel): PaginationMeta | null {
    return state.meta;
  }

  // Actions
  @Action(AgencyActions.LoadAgencies)
  loadAgencies(ctx: StateContext<AgencyStateModel>, action: AgencyActions.LoadAgencies) {
    ctx.patchState({ loading: true, error: null });

    return this.agencyService.getAgencies(action.params).pipe(
      tap((response) => {
        ctx.patchState({
          agencies: response.data,
          meta: response.meta,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to load agencies',
        });
        this.notificationService.showError('Failed to load agencies');
        return of(null);
      }),
    );
  }

  @Action(AgencyActions.LoadAgencyById)
  loadAgencyById(ctx: StateContext<AgencyStateModel>, action: AgencyActions.LoadAgencyById) {
    ctx.patchState({ loading: true, error: null });

    return this.agencyService.getAgencyById(action.id).pipe(
      tap((agency) => {
        ctx.patchState({
          selectedAgency: agency,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to load agency',
        });
        this.notificationService.showError('Failed to load agency');
        return of(null);
      }),
    );
  }

  @Action(AgencyActions.CreateAgency)
  createAgency(ctx: StateContext<AgencyStateModel>, action: AgencyActions.CreateAgency) {
    ctx.patchState({ loading: true, error: null });

    return this.agencyService.createAgency(action.data).pipe(
      tap((agency) => {
        const state = ctx.getState();
        ctx.patchState({
          agencies: [agency, ...state.agencies],
          loading: false,
        });
        this.notificationService.showSuccess('Agency created successfully');
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to create agency',
        });
        this.notificationService.showError('Failed to create agency');
        return of(null);
      }),
    );
  }

  @Action(AgencyActions.UpdateAgency)
  updateAgency(ctx: StateContext<AgencyStateModel>, action: AgencyActions.UpdateAgency) {
    ctx.patchState({ loading: true, error: null });

    return this.agencyService.updateAgency(action.id, action.data).pipe(
      tap((updatedAgency) => {
        const state = ctx.getState();
        const agencies = state.agencies.map((agency) =>
          agency.id === action.id ? updatedAgency : agency,
        );
        ctx.patchState({
          agencies,
          selectedAgency:
            state.selectedAgency?.id === action.id ? updatedAgency : state.selectedAgency,
          loading: false,
        });
        this.notificationService.showSuccess('Agency updated successfully');
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to update agency',
        });
        this.notificationService.showError('Failed to update agency');
        return of(null);
      }),
    );
  }

  @Action(AgencyActions.DeleteAgency)
  deleteAgency(ctx: StateContext<AgencyStateModel>, action: AgencyActions.DeleteAgency) {
    ctx.patchState({ loading: true, error: null });

    return this.agencyService.deleteAgency(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        const agencies = state.agencies.filter((agency) => agency.id !== action.id);
        ctx.patchState({
          agencies,
          selectedAgency: state.selectedAgency?.id === action.id ? null : state.selectedAgency,
          loading: false,
        });
        this.notificationService.showSuccess('Agency deleted successfully');
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to delete agency',
        });
        this.notificationService.showError('Failed to delete agency');
        return of(null);
      }),
    );
  }

  @Action(AgencyActions.ToggleAgencyActiveStatus)
  toggleActiveStatus(
    ctx: StateContext<AgencyStateModel>,
    action: AgencyActions.ToggleAgencyActiveStatus,
  ) {
    ctx.patchState({ loading: true, error: null });

    return this.agencyService.toggleActiveStatus(action.id, action.isActive).pipe(
      tap((updatedAgency) => {
        const state = ctx.getState();
        const agencies = state.agencies.map((agency) =>
          agency.id === action.id ? updatedAgency : agency,
        );
        ctx.patchState({
          agencies,
          selectedAgency:
            state.selectedAgency?.id === action.id ? updatedAgency : state.selectedAgency,
          loading: false,
        });
        this.notificationService.showSuccess(
          `Agency ${action.isActive ? 'activated' : 'deactivated'} successfully`,
        );
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to update agency status',
        });
        this.notificationService.showError('Failed to update agency status');
        return of(null);
      }),
    );
  }

  @Action(AgencyActions.SelectAgency)
  selectAgency(ctx: StateContext<AgencyStateModel>, action: AgencyActions.SelectAgency) {
    ctx.patchState({ selectedAgency: action.agency });
  }

  @Action(AgencyActions.ClearAgencyError)
  clearError(ctx: StateContext<AgencyStateModel>) {
    ctx.patchState({ error: null });
  }
}
