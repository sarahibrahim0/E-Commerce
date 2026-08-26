import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-16">
      <h1 class="text-2xl font-bold text-blue-black">Verify Your Email</h1>
      <p class="mt-1 text-sm text-[#797979]">We've sent a 6-digit code to your email</p>

      @if (auth.error(); as err) {
        <p class="mt-4 rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
      }

      @if (success(); as msg) {
        <p class="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{{ msg }}</p>
      }

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm font-medium text-[#646D77]">Verification Code</label>
          <input
            type="text"
            [(ngModel)]="code"
            name="code"
            maxlength="6"
            placeholder="Enter 6-digit code"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-center text-lg tracking-[0.5em] text-blue-black outline-none focus:border-salmon placeholder:tracking-normal placeholder:text-sm" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading() || success()"
          class="w-full rounded-none uppercase tracking-wider bg-salmon px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a] disabled:opacity-50">
          {{ auth.loading() ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button (click)="resend()" [disabled]="resending() || cooldown() > 0" class="text-sm text-salmon hover:text-[#e9855a] disabled:opacity-50">
          {{ cooldown() > 0 ? 'Resend in ' + cooldown() + 's' : (resending() ? 'Sending...' : 'Resend code') }}
        </button>
      </div>

      <p class="mt-4 text-center text-sm text-[#797979]">
        <a routerLink="/login" class="font-medium text-salmon">Back to Login</a>
      </p>
    </div>
  `,
})
export class VerifyEmailComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  code = '';
  success = signal('');
  resending = signal(false);
  cooldown = signal(0);
  private interval: any;

  async submit(): Promise<void> {
    if (this.code.length !== 6) return;
    try {
      await this.auth.verifyEmail(this.code);
      this.success.set('Email verified successfully! Redirecting...');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch {}
  }

  async resend(): Promise<void> {
    this.resending.set(true);
    try {
      await this.auth.resendVerification();
      this.startCooldown();
    } catch {}
    this.resending.set(false);
  }

  private startCooldown(): void {
    this.cooldown.set(60);
    this.interval = setInterval(() => {
      this.cooldown.update((c) => {
        if (c <= 1) { clearInterval(this.interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }
}
