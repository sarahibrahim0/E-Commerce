import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private http = inject(HttpClient);
  private productsBase = `${environment.apiUrl}products`;
  private reviewsBase = `${environment.apiUrl}reviews`;

  list(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.productsBase}/${productId}/reviews`);
  }

  add(productId: string, body: { rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${this.productsBase}/${productId}/reviews`, body);
  }

  remove(reviewId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.reviewsBase}/${reviewId}`);
  }
}
