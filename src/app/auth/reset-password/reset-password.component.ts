import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="w-full ps-[175px] pe-[175px] pt-page-x pb-section">
      <div class="mx-auto max-w-md">
      <h1 class="text-2xl font-bold text-blue-black" i18n="Reset password heading|@@resetPassword.title">Reset Password</h1>
      <p class="mt-1 text-sm text-[#797979]" i18n="Reset password message|@@resetPassword.subtitle">Enter your new password</p>

      @if (auth.error(); as err) {
        <p class="mt-4 rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
      }

      @if (success(); as msg) {
        <p class="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{{ msg }}</p>
      }

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm font-medium text-[#646D77]" i18n="New password label|@@resetPassword.newPasswordLabel">New Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="Enter new password"
            i18n-placeholder="New password placeholder|@@resetPassword.newPasswordPlaceholder"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#646D77]" i18n="Confirm password label|@@resetPassword.confirmLabel">Confirm Password</label>
          <input
            type="password"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            i18n-placeholder="Confirm password placeholder|@@resetPassword.confirmPlaceholder"
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
        <a routerLink="/login" class="font-medium text-salmon" i18n="Back to login link|@@resetPassword.backToLogin">Back to Login</a>
      </p>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  protected readonly auth = inject(AuthStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  password = '';
  confirmPassword = '';
  success = signal('');
  private token = '';

  protected readonly submitLabel = computed(() =>
    this.auth.loading() ? $localize`Resetting...` : $localize`Reset Password`,
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async submit(): Promise<void> {
    if (!this.password || this.password !== this.confirmPassword) {
      this.auth.error.set($localize`Passwords do not match`);
      return;
    }
    try {
      await this.auth.resetPassword(this.token, this.password);
      this.success.set($localize`Password updated successfully! Redirecting to login...`);
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch {}
  }
}
