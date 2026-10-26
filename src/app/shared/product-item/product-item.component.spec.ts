import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Product } from '../../core/models';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { ProductItemComponent } from './product-item.component';

const product: Product = {
  id: 'p1', name: 'Chair', description: '', richDescription: '', price: 100, salePrice: 0,
  rating: 4, numbReviews: 2, countInStock: 3, isFeatured: false,
  dateCreated: '2026-01-01T00:00:00Z',
  image: { url: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', publicId: 'chair' },
  images: [], brand: 'Home', category: 'c1',
};

describe('ProductItemComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductItemComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('emits the product when add to cart is clicked', () => {
    const fixture = TestBed.createComponent(ProductItemComponent);
    fixture.componentRef.setInput('product', product);
    const added = jasmine.createSpy('addToCart');
    fixture.componentInstance.addToCart.subscribe(added);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="product-item-add-to-cart"]').click();

    expect(added).toHaveBeenCalledOnceWith(product);
  });

  it('toggles the product wishlist when the heart is clicked', () => {
    const wishlist = TestBed.inject(WishlistStore);
    const toggle = spyOn(wishlist, 'toggle').and.resolveTo(true);
    const fixture = TestBed.createComponent(ProductItemComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="product-item-wishlist"]').click();

    expect(toggle).toHaveBeenCalledWith(product);
  });
});
