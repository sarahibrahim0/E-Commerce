import { TestBed } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  let service: ConnectivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectivityService);
  });

  it('starts online', () => {
    expect(service.status()).toBe('online');
    expect(service.online()).toBeTrue();
  });

  it('reports the server as unreachable when a request cannot reach it', () => {
    service.reportUnreachable();
    expect(service.status()).toBe('server-unreachable');
    expect(service.online()).toBeFalse();
  });

  it('recovers once a request reaches the server again', () => {
    service.reportUnreachable();
    service.reportReachable();
    expect(service.status()).toBe('online');
    expect(service.online()).toBeTrue();
  });

  it('distinguishes the device being offline from the server being down', () => {
    const setOnline = (value: boolean) =>
      Object.defineProperty(navigator, 'onLine', { value, configurable: true });

    const original = navigator.onLine;
    try {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
      expect(service.status()).toBe('offline');

      setOnline(true);
      window.dispatchEvent(new Event('online'));
      expect(service.status()).toBe('online');
    } finally {
      setOnline(original);
      window.dispatchEvent(new Event('online'));
    }
  });

  it('assumes the server is back when the device reconnects', () => {
    const original = navigator.onLine;
    try {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
      service.reportUnreachable();
      expect(service.status()).toBe('offline');

      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
      // A stale "server down" flag must not survive a reconnect.
      expect(service.status()).toBe('online');
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: original, configurable: true });
      window.dispatchEvent(new Event('online'));
    }
  });
});
