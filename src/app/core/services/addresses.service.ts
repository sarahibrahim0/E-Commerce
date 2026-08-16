import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address, AddressInput } from '../models';

@Injectable({ providedIn: 'root' })
export class AddressesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}users`;

  list(userId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.base}/${userId}/addresses`);
  }

  create(userId: string, body: AddressInput): Observable<Address> {
    return this.http.post<Address>(`${this.base}/${userId}/addresses`, body);
  }

  update(userId: string, addressId: string, body: Partial<AddressInput>): Observable<Address> {
    return this.http.put<Address>(`${this.base}/${userId}/addresses/${addressId}`, body);
  }

  remove(userId: string, addressId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${userId}/addresses/${addressId}`);
  }
}
