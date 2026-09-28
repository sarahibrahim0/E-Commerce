import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, PaginatedResponse } from '../models';
import { normalizeProduct } from '../utils/localize';

export interface ProductQuery {
  categoryId?: string | null;
  search?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  color?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}products`;

  list(query: ProductQuery): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    if (query.categoryId) params = params.set('categories', query.categoryId);
    if (query.search) params = params.set('search', query.search);
    if (query.minPrice != null) params = params.set('minPrice', String(query.minPrice));
    if (query.maxPrice != null) params = params.set('maxPrice', String(query.maxPrice));
    if (query.color) params = params.set('color', query.color);
    return this.http.get<PaginatedResponse<Product>>(this.base, { params }).pipe(
      map((res) => ({
        ...res,
        data: (res.data || res as unknown as Product[]).map(normalizeProduct),
      })),
    );
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`).pipe(map(normalizeProduct));
  }

  featured(count = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/get/featured/${count}`).pipe(
      map((products) => products.map(normalizeProduct)),
    );
  }
}