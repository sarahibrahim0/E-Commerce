import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="w-full ps-[175px] pe-[175px] pt-page-x pb-section">
      <div class="mx-auto max-w-md">
      <h1 class="text-2xl font-bold text-blue-black" i18n="Verify email heading|@@verifyEmail.title">Verify Your Email</h1>
      <p class="mt-1 text-sm text-[#797979]" i18n="Verify email message|@@verifyEmail.subtitle">We've sent a 6-digit code to your email</p>

      @if (auth.error(); as err) {
        <p class="mt-4 rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
      }

      @if (success(); as msg) {
        <p class="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{{ msg }}</p>
      }

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm font-medium text-[#646D77]" i18n="Verification code label|@@verifyEmail.codeLabel">Verification Code</label>
          <input
            type="text"
            [(ngModel)]="code"
            name="code"
            maxlength="6"
            placeholder="Enter 6-digit code"
            i18n-placeholder="Verification code placeholder|@@verifyEmail.codePlaceholder"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-center text-lg tracking-[0.5em] text-blue-black outline-none focus:border-salmon placeholder:tracking-normal placeholder:text-sm" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading() || success()"
          class="w-full rounded-md uppercase tracking-wider bg-salmon px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a] disabled:opacity-50">
          {{ submitLabel() }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button (click)="resend()" [disabled]="resending() || cooldown() > 0" class="text-sm text-salmon hover:text-[#e9855a] disabled:opacity-50">
          {{ resendLabel() }}
        </button>
      </div>

      <p class="mt-4 text-center text-sm text-[#797979]">
        <a routerLink="/login" class="font-medium text-salmon" i18n="Back to login link|@@verifyEmail.backToLogin">Back to Login</a>
      </p>
      </div>
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

  protected readonly submitLabel = computed(() =>
    this.auth.loading() ? $localize`Verifying...` : $localize`Verify`,
  );

  protected readonly resendLabel = computed(() => {
    if (this.cooldown() > 0) return $localize`Resend in ${this.cooldown()}s`;
    return this.resending() ? $localize`Sending...` : $localize`Resend code`;
  });

  async submit(): Promise<void> {
    if (this.code.length !== 6) return;
    try {
      await this.auth.verifyEmail(this.code);
      this.success.set($localize`Email verified successfully! Redirecting...`);
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
