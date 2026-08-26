import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { RegisterRequest, User } from '../models';
import { AuthService } from '../services/auth.service';
import { normalizeApiError } from '../services/api-error';
import { clearStorageKey } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private auth = inject(AuthService);

  readonly token = signal<string | null>(localStorage.getItem('ecom.token'));
  readonly userId = signal<string | null>(localStorage.getItem('ecom.userId'));
  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pendingVerificationUserId = signal<string | null>(null);
  readonly pendingVerificationEmail = signal<string | null>(null);

  readonly isLoggedIn = computed(() => this.token() !== null);

  async login(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.auth.login(email, password).pipe(
          tap((res) => {
            this.token.set(res.token);
            this.userId.set(res.id);
            localStorage.setItem('ecom.token', res.token);
            localStorage.setItem('ecom.userId', res.id);
          }),
          switchMap((res) => this.auth.me(res.id)),
          tap((user) => this.user.set(user)),
        ),
      );
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
      const res = await firstValueFrom(this.auth.register(body)) as any;
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
      this.user.set(await firstValueFrom(this.auth.me(id)));
    } catch {
      this.user.set(null);
    }
  }

  logout(): void {
    this.token.set(null);
    this.userId.set(null);
    this.user.set(null);
    this.error.set(null);
    this.pendingVerificationUserId.set(null);
    this.pendingVerificationEmail.set(null);
    clearStorageKey('ecom.token');
    clearStorageKey('ecom.userId');
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
    if (!email) throw new Error('No pending verification email');
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
