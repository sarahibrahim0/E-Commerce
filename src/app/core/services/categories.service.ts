import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, PaginatedResponse } from '../models';
import { normalizeCategory } from '../utils/localize';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);

  list(): Observable<Category[]> {
    return this.http.get<PaginatedResponse<Category> | Category[]>(`${environment.apiUrl}categories`).pipe(
      map((categories) => (Array.isArray(categories) ? categories : categories.data).map(normalizeCategory)),
    );
  }
}