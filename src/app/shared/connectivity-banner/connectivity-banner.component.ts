import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConnectivityService } from '../../core/services/connectivity.service';

@Component({
  selector: 'app-connectivity-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (connectivity.status() !== 'online') {
      <div class="banner" [class.offline]="connectivity.status() === 'offline'" role="alert">
        @if (connectivity.status() === 'offline') {
          <span i18n="@@networkBannerOffline">You are offline. Some features will not work until you reconnect.</span>
        } @else {
          <span i18n="@@networkBannerServer">The store is temporarily unreachable. We will keep trying.</span>
        }
      </div>
    }
  `,
  styles: [
    `
      .banner {
        position: sticky;
        top: 0;
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        text-align: center;
        font-size: 0.9rem;
        font-weight: 500;
        color: #7a4a00;
        background: #fff4d6;
        border-bottom: 1px solid #f0d49a;
      }
      .banner.offline {
        color: #7f1d1d;
        background: #fde8e8;
        border-bottom-color: #f5bcbc;
      }
    `,
  ],
})
export class ConnectivityBannerComponent {
  readonly connectivity = inject(ConnectivityService);
}
