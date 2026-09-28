import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Review } from '../models';
import { ReviewsService } from '../services/reviews.service';
import { normalizeApiError } from '../services/api-error';

@Injectable({ providedIn: 'root' })
export class ReviewsStore {
  private api = inject(ReviewsService);

  readonly productId = signal('');
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(productId: string): Promise<void> {
    this.productId.set(productId);
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.list(productId));
      this.reviews.set(res.data);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  async add(productId: string, rating: number, comment: string): Promise<void> {
    await firstValueFrom(this.api.add(productId, { rating, comment }));
    await this.load(productId);
  }

  async remove(reviewId: string): Promise<void> {
    await firstValueFrom(this.api.remove(reviewId));
    await this.load(this.productId());
  }
}
