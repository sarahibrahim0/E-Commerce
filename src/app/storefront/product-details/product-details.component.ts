import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { Product } from '../../core/models';
import { ProductsService } from '../../core/services/products.service';
import { ReviewsService } from '../../core/services/reviews.service';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { ReviewsStore } from '../../core/stores/reviews.store';
import { RecentlyViewedStore } from '../../core/stores/recently-viewed.store';
import { normalizeApiError } from '../../core/services/api-error';
import { formatPrice } from '../../core/utils/price';
import { RatingStarsComponent } from '../../shared/rating-stars/rating-stars.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, RatingStarsComponent, LoadingSkeletonComponent, EmptyStateComponent, ProductCardComponent, FormsModule, DatePipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly reviews = inject(ReviewsStore);
  protected readonly recentlyViewed = inject(RecentlyViewedStore);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly activeImage = signal('');
  readonly related = signal<Product[]>([]);

  protected readonly price = computed(() => formatPrice(this.product()?.price ?? 0));
  protected readonly outOfStock = computed(() => (this.product()?.countInStock ?? 0) <= 0);

  protected reviewRating = 5;
  protected reviewComment = '';
  protected reviewSaving = false;

  private route = inject(ActivatedRoute);
  private productsApi = inject(ProductsService);
  private reviewsApi = inject(ReviewsService);
  private toasts = inject(ToastService);

  private paramSub: Subscription | null = null;

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      void this.load(id);
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.product.set(null);
    this.related.set([]);
    this.quantity.set(1);
    try {
      const product = await new Promise<Product>((resolve, reject) =>
        this.productsApi.get(id).subscribe({ next: resolve, error: reject }),
      );
      this.product.set(product);
      this.activeImage.set(product.image.url || product.images[0]?.url || '');
      this.recentlyViewed.add(product);
      const categoryId =
        typeof product.category === 'string' ? product.category : product.category?.id;
      if (categoryId) {
        const list = await new Promise<Product[]>((resolve, reject) =>
          this.productsApi.list({ categoryId }).subscribe({ next: resolve, error: reject }),
        );
        this.related.set(list.filter((p) => p.id !== product.id).slice(0, 4));
      }
      void this.reviews.load(id);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  setQuantity(q: number): void {
    this.quantity.set(Math.max(1, q));
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;
    this.cart.add(product, this.quantity());
    this.toasts.show(`${product.name} added to cart`, 'success');
  }

  async submitReview(): Promise<void> {
    const product = this.product();
    if (!product || this.reviewSaving) return;
    this.reviewSaving = true;
    try {
      await new Promise<void>((resolve, reject) =>
        this.reviewsApi.add(product.id, { rating: this.reviewRating, comment: this.reviewComment })
          .subscribe({ next: () => resolve(), error: reject }),
      );
      this.reviewComment = '';
      this.reviewRating = 5;
      await this.reviews.load(product.id);
      this.toasts.show('Review submitted', 'success');
    } catch {
      this.toasts.show('Could not submit review', 'error');
    } finally {
      this.reviewSaving = false;
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.reviewsApi.remove(reviewId).subscribe({ next: () => resolve(), error: reject }),
    );
    await this.reviews.load(this.reviews.productId());
  }

  isReviewOwner(review: import('../../core/models').Review): boolean {
    const user = review.user;
    return this.auth.isLoggedIn() && typeof user === 'object' && user.id === this.auth.userId();
  }

  reviewAuthorName(review: import('../../core/models').Review): string {
    return typeof review.user === 'object' ? review.user.name : 'User';
  }

  addRelatedToCart(product: Product): void {
    this.cart.add(product);
    this.toasts.show(`${product.name} added to cart`, 'success');
  }
}
