import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Product } from '../../core/models';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { ToastService } from '../../shared/toast/toast.service';
import { WishlistComponent } from './wishlist.component';

describe('WishlistComponent', () => {
  it('adds a wishlist product to the cart and shows a success toast', () => {
    const product: Product = {
      id: 'p1',
      name: 'Chair',
      description: '',
      richDescription: '',
      price: 25,
      salePrice: 0,
      rating: 0,
      numbReviews: 0,
      countInStock: 1,
      isFeatured: false,
      dateCreated: '2026-01-01T00:00:00Z',
      image: { url: '', publicId: '' },
      images: [],
      brand: '',
      category: 'c1',
    };
    const cart = { add: jasmine.createSpy('add') };
    const wishlist = {
      loading: () => false,
      count: () => 0,
      list: () => [],
      load: jasmine.createSpy('load'),
    };
    TestBed.configureTestingModule({
      imports: [WishlistComponent],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: cart },
        { provide: WishlistStore, useValue: wishlist },
      ],
    });

    const fixture = TestBed.createComponent(WishlistComponent);
    const toasts = TestBed.inject(ToastService);
    fixture.detectChanges();

    fixture.componentInstance.addToCart(product);

    expect(cart.add).toHaveBeenCalledWith(product);
    expect(toasts.toasts().at(-1)).toEqual(jasmine.objectContaining({
      message: 'Chair added to cart',
      type: 'success',
    }));
  });
});
