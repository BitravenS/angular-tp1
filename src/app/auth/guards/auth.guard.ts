import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_ROUTES } from '../../config/routes.config';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).isAuthenticated() || router.createUrlTree([APP_ROUTES.login]);
};
