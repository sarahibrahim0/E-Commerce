import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServerCountry, ServerCurrency, ServerPaymentMethod, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getCountries(): Observable<PaginatedResponse<ServerCountry>> {
    return this.http.get<PaginatedResponse<ServerCountry>>(`${this.base}countries`, {
      params: { limit: '200', sortBy: 'name', sortDir: 'asc' },
    });
  }

  getCurrencies(): Observable<PaginatedResponse<ServerCurrency>> {
    return this.http.get<PaginatedResponse<ServerCurrency>>(`${this.base}currencies`, {
      params: { limit: '200', sortBy: 'name', sortDir: 'asc' },
    });
  }

  getPaymentMethods(): Observable<PaginatedResponse<ServerPaymentMethod>> {
    return this.http.get<PaginatedResponse<ServerPaymentMethod>>(`${this.base}payment-methods`, {
      params: { limit: '200', sortBy: 'name', sortDir: 'asc' },
    });
  }
}