import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon } from '../models';

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private http = inject(HttpClient);

  validate(code: string, subtotal?: number): Observable<Coupon> {
    const body = subtotal != null ? { code, subtotal } : { code };
    return this.http.post<Coupon>(`${environment.apiUrl}coupons/validate`, body);
  }
}
