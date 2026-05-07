import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { forceChangePasswordGuard } from './force-change-password-guard';

describe('forceChangePasswordGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => forceChangePasswordGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
