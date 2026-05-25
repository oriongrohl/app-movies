import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

  // Valida el token contra FastAPI — cubre refresh y cambio de ruta
  return auth.verifyToken().pipe(
    map(() => true),
    catchError(() => {
      auth.logout('Sesión expirada. Vuelve a iniciar sesión.');
      return of(router.createUrlTree(['/login']));
    })
  );
};
