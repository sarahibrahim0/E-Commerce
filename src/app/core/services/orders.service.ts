import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutRequest, CheckoutResponse, Order } from '../models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}orders`;

  listByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/getuserorders/${userId}`);
  }

  get(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${orderId}`);
  }

  checkout(req: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.base}/checkout`, req);
  }

  confirm(sessionId: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/confirm`, { sessionId });
  }

  cancel(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/${orderId}/cancel`, {});
  }
}
