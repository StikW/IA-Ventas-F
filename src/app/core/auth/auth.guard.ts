import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

function loginRedirect(router: Router, returnUrl?: string) {
  const queryParams: Record<string, string> = { login: '1' };
  if (returnUrl && returnUrl !== '/' && !returnUrl.startsWith('/?')) {
    queryParams['returnUrl'] = returnUrl;
  }
  return router.createUrlTree(['/'], { queryParams });
}

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return loginRedirect(router, state.url);
};

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }

  return loginRedirect(router, state.url);
};

export const businessGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.currentUser()?.role === 'NEGOCIO') {
    return true;
  }

  if (auth.isAuthenticated() && auth.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }

  return loginRedirect(router, state.url);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([auth.isAdmin() ? '/admin' : '/business']);
};
