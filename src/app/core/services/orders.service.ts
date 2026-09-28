import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutRequest, CheckoutResponse, Order, PaginatedResponse } from '../models';
import { normalizeOrder } from '../utils/localize';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}orders`;

  listByUser(userId: string): Observable<PaginatedResponse<Order>> {
    return this.http
      .get<PaginatedResponse<Order>>(`${this.base}/getuserorders/${userId}`)
      .pipe(map((res) => ({ ...res, data: (res.data || []).map(normalizeOrder) })));
  }

  get(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${orderId}`).pipe(map(normalizeOrder));
  }

  checkout(req: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.base}/checkout`, req);
  }

  confirm(sessionId: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/confirm`, { sessionId }).pipe(map(normalizeOrder));
  }

  confirmPaypal(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/confirm-paypal`, { orderId }).pipe(map(normalizeOrder));
  }

  cancel(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/${orderId}/cancel`, {}).pipe(map(normalizeOrder));
  }
}