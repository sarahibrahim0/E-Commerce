import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { RegisterRequest, RegisterResponse, User } from '../models';
import { AuthService } from '../services/auth.service';
import { normalizeApiError } from '../services/api-error';
import { normalizeUser } from '../utils/localize';
import { clearStorageKey, readStorageString, writeStorageString } from '../utils/storage';
import { WishlistStore } from './wishlist.store';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  constructor() {
    this.http = inject(HttpClient);
    this.auth = inject(AuthService);
    this.wishlistStore = inject(WishlistStore);

    this.token.set(readStorageString('ecom.token', null));
    this.userId.set(safeStoredId(readStorageString('ecom.userId', null)));
    this.user.set(null);
    this.loading.set(false);
    this.error.set(null);
    this.pendingVerificationUserId.set(null);
    this.pendingVerificationEmail.set(null);
  }

  private http: HttpClient;
  private auth: AuthService;
  private wishlistStore: WishlistStore;

  readonly token = signal<string | null>(null);
  readonly userId = signal<string | null>(null);
  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pendingVerificationUserId = signal<string | null>(null);
  readonly pendingVerificationEmail = signal<string | null>(null);

  readonly isLoggedIn = computed(() => this.token() !== null);
  readonly isAdmin = computed(() => this.user()?.isAdmin === true);

  async login(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.auth.login(email, password).pipe(
          tap((res) => {
            this.token.set(res.token);
            this.userId.set(res.userId);
            writeStorageString('ecom.token', res.token);
            writeStorageString('ecom.userId', res.userId);
            if (res.refreshToken) {
              writeStorageString('ecom.refreshToken', res.refreshToken);
            }
          }),
          switchMap((res) => this.auth.me(res.userId)),
          tap((user) => this.user.set(normalizeUser(user))),
        ),
      );
      this.wishlistStore.load();
    } catch (err: any) {
      if (err?.status === 403 && err?.error?.userId) {
        this.pendingVerificationUserId.set(err.error.userId);
        this.pendingVerificationEmail.set(email);
        this.error.set(err.error.message || 'Email not verified');
        throw err;
      }
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async register(body: RegisterRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res: RegisterResponse = await firstValueFrom(this.auth.register(body));
      this.pendingVerificationUserId.set(res.userId || null);
      this.pendingVerificationEmail.set(body.email);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async loadUser(): Promise<void> {
    const id = this.userId();
    if (!id) return;
    try {
      this.user.set(normalizeUser(await firstValueFrom(this.auth.me(id))));
    } catch {
      this.user.set(null);
    }
  }

  async logout(): Promise<void> {
    const refreshToken = readStorageString('ecom.refreshToken', null);
    if (refreshToken) {
      try {
        await firstValueFrom(this.http.post(`${environment.apiUrl}auth/logout`, { refreshToken }));
      } catch {
        // ignore; cleanup anyway
      }
    }
    this.token.set(null);
    this.userId.set(null);
    this.user.set(null);
    this.error.set(null);
    this.pendingVerificationUserId.set(null);
    this.pendingVerificationEmail.set(null);
    clearStorageKey('ecom.token');
    clearStorageKey('ecom.userId');
    clearStorageKey('ecom.refreshToken');
    this.wishlistStore.clear();
  }

  async verifyEmail(code: string): Promise<void> {
    const userId = this.pendingVerificationUserId();
    if (!userId) throw new Error('No pending verification');
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.verifyEmail(userId, code));
      this.pendingVerificationUserId.set(null);
      this.pendingVerificationEmail.set(null);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async resendVerification(): Promise<void> {
    const email = this.pendingVerificationEmail();
    if (!email) throw new Error($localize`No pending verification email`);
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.resendVerification(email));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.forgotPassword(email));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.resetPassword(token, password));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }
}

function safeStoredId(value: string | null): string | null {
  if (!value) return null;
  if (value === 'undefined' || value === 'null') return null;
  return value;
}