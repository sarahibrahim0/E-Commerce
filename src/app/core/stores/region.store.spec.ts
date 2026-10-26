import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RegionStore } from './region.store';

describe('RegionStore', () => {
  let store: RegionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(RegionStore);
  });

  it('emits when the selected display currency changes', () => {
    store.currencies.set([
      { id: 'egp', code: 'EGP', symbol: 'E£', rate: 1, isDefault: true },
      { id: 'usd', code: 'USD', symbol: '$', rate: 0.02, isDefault: false },
    ]);
    const changes: string[] = [];
    store.currencyChanges.subscribe((currency) => changes.push(currency.code));

    store.setCurrency('USD');

    expect(changes).toEqual(['USD']);
    expect(store.currency().rate).toBe(0.02);
  });
});
