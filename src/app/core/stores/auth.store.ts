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
    } catch (err) {
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
      await firstValueFrom(this.auth.register(body));
      await this.login(body.email, body.password);
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
    clearStorageKey('ecom.token');
    clearStorageKey('ecom.userId');
  }
}
