import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ConnectionStatus = 'online' | 'offline' | 'server-unreachable';

/**
 * Tracks whether the browser can reach the API at all.
 *
 * Two independent things can break a request and they need different
 * messaging: the device losing connectivity, and the backend (or its database)
 * being down while the device is fine. The interceptor reports the outcome of
 * every request into this service, and the banner renders the result.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly browserOnline = signal(true);
  private readonly serverReachable = signal(true);

  readonly online = computed(() => (this.isBrowser ? this.browserOnline() && this.serverReachable() : true));

  readonly status = computed<ConnectionStatus>(() => {
    if (!this.isBrowser) return 'online';
    if (!this.browserOnline()) return 'offline';
    if (!this.serverReachable()) return 'server-unreachable';
    return 'online';
  });

  constructor() {
    if (!this.isBrowser) return;

    this.browserOnline.set(navigator.onLine);

    const onOnline = () => {
      this.browserOnline.set(true);
      // Assume the server is back until a request proves otherwise, otherwise
      // the banner stays up forever after a reconnect.
      this.serverReachable.set(true);
    };
    const onOffline = () => this.browserOnline.set(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    });
  }

  /** Called by the network interceptor when a request reaches the API. */
  reportReachable(): void {
    if (this.serverReachable()) return;
    this.serverReachable.set(true);
  }

  /** Called by the network interceptor when a request cannot reach the API. */
  reportUnreachable(): void {
    if (!this.serverReachable()) return;
    this.serverReachable.set(false);
  }
}
