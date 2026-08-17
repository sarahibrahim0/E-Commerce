import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { OrdersStore } from './orders.store';
import { Order, CheckoutRequest } from '../models';

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1', orderItems: [], shippingAddress1: '1 Main St', shippingAddress2: '', city: 'Cairo',
  country: 'Egypt', phone: '+201000000000', status: 'Pending', paymentStatus: 'unpaid',
  paymentId: '', couponCode: '', discount: 0, totalPrice: 100, user: 'u1',
  dateOrdered: '2026-01-01T00:00:00Z', ...overrides,
});

const request: CheckoutRequest = {
  orderItems: [{ product: 'p1', quantity: 1 }],
  shippingAddress: { street: '1 Main St', apartment: '', city: 'Cairo', zip: '11511', country: 'Egypt', phone: '+201000000000' },
  customerEmail: 'a@b.c',
};

describe('OrdersStore', () => {
  let store: OrdersStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(OrdersStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the user orders', async () => {
    const p = store.loadOrders('u1');
    const req = http.expectOne(`${environment.apiUrl}orders/getuserorders/u1`);
    req.flush([order()]);
    await p;
    expect(store.orders().length).toBe(1);
  });

  it('loads a single order', async () => {
    const p = store.loadOrder('o1');
    const req = http.expectOne(`${environment.apiUrl}orders/o1`);
    req.flush(order({ status: 'Delivered', paymentStatus: 'paid' }));
    await p;
    expect(store.current()?.paymentStatus).toBe('paid');
  });

  it('creates a checkout session', async () => {
    const p = store.checkout(request);
    const req = http.expectOne(`${environment.apiUrl}orders/checkout`);
    expect(req.request.body).toEqual(request);
    req.flush({ sessionId: 'cs_123', orderId: 'o1' });
    const res = await p;
    expect(res.sessionId).toBe('cs_123');
    expect(store.error()).toBeNull();
  });

  it('confirms a paid session and stores the order', async () => {
    const p = store.confirm('cs_123');
    const req = http.expectOne(`${environment.apiUrl}orders/confirm`);
    expect(req.request.body).toEqual({ sessionId: 'cs_123' });
    req.flush(order({ paymentStatus: 'paid' }));
    const result = await p;
    expect(result.paymentStatus).toBe('paid');
    expect(store.current()?.id).toBe('o1');
  });

  it('cancels an order and updates the list', async () => {
    store.orders.set([order()]);
    const p = store.cancel('o1');
    const req = http.expectOne(`${environment.apiUrl}orders/o1/cancel`);
    req.flush(order({ status: 'Cancelled', paymentStatus: 'refunded' }));
    await p;
    expect(store.orders()[0].status).toBe('Cancelled');
    expect(store.orders()[0].paymentStatus).toBe('refunded');
  });
});