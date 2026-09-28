import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="w-full ps-[175px] pe-[175px] pt-page-x pb-section">
      <div class="mx-auto max-w-md">
      <h1 class="text-2xl font-bold text-blue-black" i18n="Forgot password heading|@@forgotPassword.title">Forgot Password?</h1>
      <p class="mt-1 text-sm text-[#797979]" i18n="Forgot password message|@@forgotPassword.subtitle">Enter your email to receive a reset link</p>

      @if (auth.error(); as err) {
        <p class="mt-4 rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
      }

      @if (success(); as msg) {
        <p class="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{{ msg }}</p>
      }

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm font-medium text-[#646D77]" i18n="Email address label|@@forgotPassword.emailLabel">Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="Enter your email"
            i18n-placeholder="Email placeholder|@@forgotPassword.emailPlaceholder"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading() || success()"
          class="w-full rounded-md uppercase tracking-wider bg-salmon px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a] disabled:opacity-50">
          {{ submitLabel() }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-[#797979]">
        <a routerLink="/login" class="font-medium text-salmon" i18n="Back to login link|@@forgotPassword.backToLogin">Back to Login</a>
      </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  email = '';
  success = signal('');

  protected readonly submitLabel = computed(() =>
    this.auth.loading() ? $localize`Sending...` : $localize`Send Reset Link`,
  );

  async submit(): Promise<void> {
    if (!this.email.trim()) return;
    try {
      await this.auth.forgotPassword(this.email.trim());
      this.success.set($localize`Check your email for the reset link.`);
    } catch {}
  }
}
