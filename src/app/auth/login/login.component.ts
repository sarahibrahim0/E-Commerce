import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private static readonly rememberedCredentialsKey = 'ecom.rememberedCredentials';

  protected readonly auth = inject(AuthStore);

  readonly email = signal(this.getRememberedCredentials()?.email ?? '');
  readonly password = signal(this.getRememberedCredentials()?.password ?? '');
  readonly rememberPassword = signal(this.getRememberedCredentials() !== null);
  readonly showPassword = signal(false);

  protected readonly submitLabel = computed(() =>
    this.auth.loading() ? $localize`Signing in...` : $localize`Sign in`,
  );

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private getRememberedCredentials(): { email: string; password: string } | null {
    const saved = localStorage.getItem(LoginComponent.rememberedCredentialsKey);
    if (!saved) return null;

    try {
      const credentials = JSON.parse(saved);
      return typeof credentials?.email === 'string' && typeof credentials?.password === 'string'
        ? credentials
        : null;
    } catch {
      localStorage.removeItem(LoginComponent.rememberedCredentialsKey);
      return null;
    }
  }

  async submit(): Promise<void> {
    if (!this.email().trim() || !this.password()) return;
    try {
      await this.auth.login(this.email().trim(), this.password());
      if (this.rememberPassword()) {
        localStorage.setItem(LoginComponent.rememberedCredentialsKey, JSON.stringify({
          email: this.email().trim(),
          password: this.password(),
        }));
      } else {
        localStorage.removeItem(LoginComponent.rememberedCredentialsKey);
      }
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
      await this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      if (err?.status === 403) {
        this.router.navigate(['/verify-email']);
      }
    }
  }
}
