import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ReviewsStore } from './reviews.store';
import { Review } from '../models';

const review = (id: string, rating: number): Review => ({
  id, rating, comment: 'ok', product: 'p1', dateCreated: '2026-01-01T00:00:00Z',
  user: { id: 'u1', name: 'Sara' },
});

describe('ReviewsStore', () => {
  let store: ReviewsStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ReviewsStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads reviews for a product', async () => {
    const p = store.load('p1');
    const req = http.expectOne(`${environment.apiUrl}products/p1/reviews`);
    req.flush({ data: [review('r1', 5)], total: 1, page: 1, totalPages: 1 });
    await p;
    expect(store.reviews().length).toBe(1);
    expect(store.productId()).toBe('p1');
  });

  it('adds a review and reloads the list', async () => {
    const loadPromise = store.load('p1');
    http.expectOne(`${environment.apiUrl}products/p1/reviews`).flush({ data: [], total: 0, page: 1, totalPages: 0 });
    await loadPromise;

    const addPromise = store.add('p1', 4, 'nice');
    http.expectOne(`${environment.apiUrl}products/p1/reviews`).flush(review('r2', 4));
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}products/p1/reviews`).flush({ data: [review('r2', 4)], total: 1, page: 1, totalPages: 1 });
    await addPromise;
    expect(store.reviews()[0].id).toBe('r2');
  });

  it('deletes a review and reloads the list', async () => {
    const loadPromise = store.load('p1');
    http.expectOne(`${environment.apiUrl}products/p1/reviews`).flush({ data: [review('r1', 5)], total: 1, page: 1, totalPages: 1 });
    await loadPromise;

    const delPromise = store.remove('r1');
    http.expectOne(`${environment.apiUrl}reviews/r1`).flush({ message: 'review deleted' });
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}products/p1/reviews`).flush({ data: [], total: 0, page: 1, totalPages: 0 });
    await delPromise;
    expect(store.reviews().length).toBe(0);
  });
});
