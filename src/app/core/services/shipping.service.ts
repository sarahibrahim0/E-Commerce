import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShippingConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}shipping`;

  getConfig(): Observable<ShippingConfig> {
    return this.http.get<ShippingConfig>(this.base);
  }

  updateConfig(config: Partial<ShippingConfig>): Observable<ShippingConfig> {
    return this.http.put<ShippingConfig>(this.base, config);
  }
}
