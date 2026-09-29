import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { networkInterceptor } from './network.interceptor';
import { ConnectivityService } from '../services/connectivity.service';
import { ToastService } from '../../shared/toast/toast.service';

describe('networkInterceptor', () => {
  let http: HttpClient;
  let mock: HttpTestingController;
  let connectivity: ConnectivityService;
  let toasts: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([networkInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
    connectivity = TestBed.inject(ConnectivityService);
    toasts = TestBed.inject(ToastService);
  });

  afterEach(() => {
    mock.verify();
  });

  it('retries an idempotent GET when the first attempt fails with status 0', () => {
    let result: unknown = null;
    http.get('/api/test').subscribe((res) => (result = res));

    const first = mock.expectOne('/api/test');
    expect(first.request.headers.get('x-network-retry')).toBeNull();
    first.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    // The interceptor replays the request with a retry marker.
    mock.expectOne((r) => r.url === '/api/test').flush({ ok: true });
    expect(result).toEqual({ ok: true });
  });

  it('marks the server unreachable when a request cannot reach it', () => {
    spyOn(connectivity, 'reportUnreachable');
    http.get('/api/test').subscribe({ error: () => undefined });
    mock.expectOne('/api/test').error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    expect(connectivity.reportUnreachable).toHaveBeenCalled();
    drainRetries();
  });

  it('marks the server reachable again after a successful request', () => {
    spyOn(connectivity, 'reportReachable');
    http.get('/api/test').subscribe();
    mock.expectOne('/api/test').flush({ ok: true });
    expect(connectivity.reportReachable).toHaveBeenCalled();
  });

  it('retries a 503 from the backend', () => {
    let attempts = 0;
    http.get('/api/test').subscribe({ next: () => attempts++ });

    mock.expectOne('/api/test').flush({ message: 'down' }, { status: 503, statusText: 'Service Unavailable' });
    mock.expectOne((r) => r.url === '/api/test').flush({ ok: true });
    expect(attempts).toBe(1);
  });

  it('does not retry a POST so non-idempotent writes are not duplicated', () => {
    let errorStatus = -1;
    http.post('/api/test', { a: 1 }).subscribe({ error: (e) => (errorStatus = e.status) });

    mock.expectOne('/api/test').error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    expect(errorStatus).toBe(0);
  });

  it('leaves real application errors alone', () => {
    spyOn(connectivity, 'reportUnreachable');
    let errorStatus = -1;
    http.get('/api/test').subscribe({ error: (e) => (errorStatus = e.status) });

    mock.expectOne('/api/test').flush({ message: 'nope' }, { status: 422, statusText: 'Unprocessable Entity' });
    expect(errorStatus).toBe(422);
    expect(connectivity.reportUnreachable).not.toHaveBeenCalled();
  });

  it('notifies the user once per failing request', () => {
    spyOn(toasts, 'show');
    http.get('/api/test').subscribe({ error: () => undefined });
    mock.expectOne('/api/test').error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    drainRetries();
    expect(toasts.show).toHaveBeenCalledTimes(1);
  });

  it('stops after the retry budget and surfaces the failure', () => {
    let errorStatus = -1;
    http.get('/api/test').subscribe({ error: (e) => (errorStatus = e.status) });

    // Initial attempt plus MAX_RETRIES replays, then the error reaches the caller.
    for (let i = 0; i <= 2; i++) {
      mock
        .expectOne('/api/test')
        .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    }
    expect(errorStatus).toBe(0);
  });

  /** Flush every retry the interceptor still has queued. */
  function drainRetries(): void {
    for (const match of mock.match('/api/test')) {
      match.flush({ ok: true });
    }
  }
});
