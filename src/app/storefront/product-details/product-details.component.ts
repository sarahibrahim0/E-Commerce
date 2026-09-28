import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription, firstValueFrom, timeout } from 'rxjs';
import { PaginatedResponse, Product, Review } from '../../core/models';
import { pickText } from '../../core/utils/localize';
import { ProductsService } from '../../core/services/products.service';
import { ReviewsService } from '../../core/services/reviews.service';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { ReviewsStore } from '../../core/stores/reviews.store';
import { RecentlyViewedStore } from '../../core/stores/recently-viewed.store';
import { normalizeApiError } from '../../core/services/api-error';
import { formatPrice, effectivePrice, onSale } from '../../core/utils/price';
import { RatingStarsComponent } from '../../shared/rating-stars/rating-stars.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, RatingStarsComponent, LoadingSpinnerComponent, EmptyStateComponent, ProductCardComponent, FormsModule, DatePipe],
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

  protected readonly price = computed(() => formatPrice(effectivePrice(this.product())));
  protected readonly oldPrice = computed(() => (onSale(this.product()) ? formatPrice(this.product()?.price ?? 0) : ''));
  protected readonly discountPercent = computed(() => {
    const p = this.product();
    if (!p || !onSale(p)) return 0;
    return Math.round(((p.price - Number(p.salePrice)) / p.price) * 100);
  });
  protected readonly displayOldPrice = computed(() => onSale(this.product()));
  protected readonly outOfStock = computed(() => (this.product()?.countInStock ?? 0) <= 0);
  protected readonly lowStock = computed(() => {
    const count = this.product()?.countInStock ?? 0;
    return count > 0 && count <= 5;
  });

  protected readonly productName = computed(() => pickText(this.product()?.name));

  protected readonly categoryName = computed(() => {
    const c = this.product()?.category;
    return typeof c === 'string' ? c : pickText(c?.name) ?? '';
  });

  protected readonly categoryId = computed(() => {
    const c = this.product()?.category;
    return typeof c === 'string' ? c : c?.id ?? '';
  });

  protected readonly sku = computed(() => (this.product()?.id ?? '').slice(0, 8).toUpperCase().replace(/-/g, ''));

  protected readonly isNew = computed(() => {
    const created = this.product()?.dateCreated;
    if (!created) return false;
    return Date.now() - new Date(created).getTime() < 30 * 24 * 60 * 60 * 1000;
  });

  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');
  readonly reviewSaving = signal(false);
  readonly reviewError = signal<string | null>(null);

  protected readonly reviewSubmitLabel = computed(() =>
    this.reviewSaving()
      ? $localize`Submitting...`
      : $localize`Submit review`,
  );

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
        const list = await new Promise<PaginatedResponse<Product>>((resolve, reject) =>
          this.productsApi.list({ categoryId }).subscribe({ next: resolve, error: reject }),
        );
        this.related.set(list.data.filter((p) => p.id !== product.id).slice(0, 4));
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
    this.toasts.show($localize`${pickText(product.name)} added to cart`, 'success');
  }

  async submitReview(): Promise<void> {
    const product = this.product();
    if (!product || this.reviewSaving()) return;
    this.reviewSaving.set(true);
    this.reviewError.set(null);
    try {
      await firstValueFrom(
        this.reviewsApi.add(product.id, { rating: this.reviewRating(), comment: this.reviewComment() })
          .pipe(timeout(20000)),
      );
      this.reviewComment.set('');
      this.reviewRating.set(5);
      await this.reviews.load(product.id);
      this.toasts.show($localize`Review submitted`, 'success');
    } catch (err) {
      const message = normalizeApiError(err).message;
      this.reviewError.set(message);
      this.toasts.show(message, 'error');
    } finally {
      this.reviewSaving.set(false);
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

  reviewAuthorName(review: Review): string {
    return typeof review.user === 'object' ? pickText(review.user.name) : $localize`User`;
  }

  reviewUserImage(review: Review): string {
    if (typeof review.user !== 'object') return '';
    const raw = (review.user as { image?: unknown; avatar?: unknown }).image
      ?? (review.user as { image?: unknown; avatar?: unknown }).avatar;
    if (!raw) return '';
    if (typeof raw === 'string') return raw;
    return (raw as { url?: string }).url ?? '';
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  addRelatedToCart(product: Product): void {
    this.cart.add(product);
    this.toasts.show($localize`${pickText(product.name)} added to cart`, 'success');
  }
}
