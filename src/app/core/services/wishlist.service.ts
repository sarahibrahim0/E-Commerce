import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models';
import { normalizeProduct } from '../utils/localize';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}wishlist`;

  get(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base).pipe(
      map((products) => products.map(normalizeProduct)),
    );
  }

  add(productId: string): Observable<Product[] | { message: string }> {
    return this.http.post<Product[] | { message: string }>(`${this.base}/${productId}`, {}).pipe(
      map((res) => (Array.isArray(res) ? res.map(normalizeProduct) : res)),
    );
  }

  remove(productId: string): Observable<Product[] | { message: string }> {
    return this.http.delete<Product[] | { message: string }>(`${this.base}/${productId}`).pipe(
      map((res) => (Array.isArray(res) ? res.map(normalizeProduct) : res)),
    );
  }

  check(productId: string): Observable<{ inWishlist: boolean }> {
    return this.http.get<{ inWishlist: boolean }>(`${this.base}/check/${productId}`);
  }
}