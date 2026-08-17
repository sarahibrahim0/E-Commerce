import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AddressStore } from './address.store';
import { Address } from '../models';

const address = (overrides: Partial<Address> = {}): Address => ({
  id: 'a1', label: 'Home', street: '1 Main St', apartment: '', city: 'Cairo',
  zip: '11511', country: 'Egypt', phone: '+201000000000', isDefault: false, ...overrides,
});

describe('AddressStore', () => {
  let store: AddressStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AddressStore);
    store.setUser('u1');
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the user addresses', async () => {
    const p = store.load();
    const req = http.expectOne(`${environment.apiUrl}users/u1/addresses`);
    req.flush([address(), address({ id: 'a2', label: 'Work', isDefault: true })]);
    await p;
    expect(store.list().length).toBe(2);
    expect(store.default()?.id).toBe('a2');
  });

  it('creates an address and reloads', async () => {
    const p = store.create({ label: 'Home', street: '1 Main St', apartment: '', city: 'Cairo', zip: '11511', country: 'Egypt', phone: '+201000000000', isDefault: false });
    http.expectOne(`${environment.apiUrl}users/u1/addresses`).flush(address());
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}users/u1/addresses`).flush([address()]);
    await p;
    expect(store.list().length).toBe(1);
  });

  it('updates an address and reloads', async () => {
    const p = store.update('a1', { label: 'Office' });
    http.expectOne(`${environment.apiUrl}users/u1/addresses/a1`).flush(address({ label: 'Office' }));
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}users/u1/addresses`).flush([address({ label: 'Office' })]);
    await p;
    expect(store.list()[0].label).toBe('Office');
  });

  it('removes an address and reloads', async () => {
    const p = store.remove('a1');
    http.expectOne(`${environment.apiUrl}users/u1/addresses/a1`).flush({ message: 'deleted' });
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}users/u1/addresses`).flush([]);
    await p;
    expect(store.list().length).toBe(0);
  });
});
