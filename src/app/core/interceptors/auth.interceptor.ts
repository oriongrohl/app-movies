import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => { // authInterceptor es una función que intercepta las solicitudes HTTP salientes y las respuestas entrantes para agregar un token de autenticación a las solicitudes que lo requieren, y para manejar errores de autenticación (como el error 401) de manera centralizada. Esto permite que la aplicación maneje la autenticación de manera consistente en todas las solicitudes HTTP sin tener que agregar manualmente el token en cada solicitud.
  const auth = inject(AuthService);
  const token = auth.getFreshToken();

  const needsToken = req.url.startsWith(environment.sgeApiUrl);

  const request = (token && needsToken)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && needsToken) {
        auth.logout('Sesión expirada. Vuelve a iniciar sesión.');
      }
      return throwError(() => err);
    })
  );
};
