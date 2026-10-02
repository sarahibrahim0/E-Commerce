import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, PaginatedResponse } from '../models';
import { normalizeCategory } from '../utils/localize';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);

  // Categories rarely change within a session, so every caller shares one request.
  private readonly list$ = this.http
    .get<PaginatedResponse<Category> | Category[]>(`${environment.apiUrl}categories`)
    .pipe(
      map((categories) => (Array.isArray(categories) ? categories : categories.data).map(normalizeCategory)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  list(): Observable<Category[]> {
    return this.list$;
  }
}