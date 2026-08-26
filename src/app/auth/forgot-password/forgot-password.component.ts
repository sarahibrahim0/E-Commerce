import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-16">
      <h1 class="text-2xl font-bold text-blue-black">Forgot Password?</h1>
      <p class="mt-1 text-sm text-[#797979]">Enter your email to receive a reset link</p>

      @if (auth.error(); as err) {
        <p class="mt-4 rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
      }

      @if (success(); as msg) {
        <p class="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{{ msg }}</p>
      }

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm font-medium text-[#646D77]">Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="Enter your email"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading() || success()"
          class="w-full rounded-none uppercase tracking-wider bg-salmon px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a] disabled:opacity-50">
          {{ auth.loading() ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-[#797979]">
        <a routerLink="/login" class="font-medium text-salmon">Back to Login</a>
      </p>
    </div>
  `,
})
export class ForgotPasswordComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  email = '';
  success = signal('');

  async submit(): Promise<void> {
    if (!this.email.trim()) return;
    try {
      await this.auth.forgotPassword(this.email.trim());
      this.success.set('Check your email for the reset link.');
    } catch {}
  }
}
