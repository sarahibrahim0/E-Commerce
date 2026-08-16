import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { normalizeApiError } from '../services/api-error';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('ecom.token');
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(request).pipe(
    catchError((err) => throwError(() => normalizeApiError(err))),
  );
};
