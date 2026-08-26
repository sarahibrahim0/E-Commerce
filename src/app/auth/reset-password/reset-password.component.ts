import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-16">
      <h1 class="text-2xl font-bold text-blue-black">Reset Password</h1>
      <p class="mt-1 text-sm text-[#797979]">Enter your new password</p>

      @if (auth.error(); as err) {
        <p class="mt-4 rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
      }

      @if (success(); as msg) {
        <p class="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{{ msg }}</p>
      }

      <form class="mt-6 space-y-4" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm font-medium text-[#646D77]">New Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="Enter new password"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#646D77]">Confirm Password</label>
          <input
            type="password"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            required
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading() || success()"
          class="w-full rounded-none uppercase tracking-wider bg-salmon px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a] disabled:opacity-50">
          {{ auth.loading() ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-[#797979]">
        <a routerLink="/login" class="font-medium text-salmon">Back to Login</a>
      </p>
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

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async submit(): Promise<void> {
    if (!this.password || this.password !== this.confirmPassword) {
      this.auth.error.set('Passwords do not match');
      return;
    }
    try {
      await this.auth.resetPassword(this.token, this.password);
      this.success.set('Password updated successfully! Redirecting to login...');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch {}
  }
}
