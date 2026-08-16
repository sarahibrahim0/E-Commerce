import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models';

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

  list(query: ProductQuery): Observable<Product[]> {
    let params = new HttpParams();
    if (query.categoryId) params = params.set('categories', query.categoryId);
    if (query.search) params = params.set('name', query.search);
    if (query.minPrice != null) params = params.set('minPrice', String(query.minPrice));
    if (query.maxPrice != null) params = params.set('maxPrice', String(query.maxPrice));
    if (query.color) params = params.set('color', query.color);
    return this.http.get<Product[]>(this.base, { params });
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  featured(count = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/get/featured/${count}`);
  }
}
