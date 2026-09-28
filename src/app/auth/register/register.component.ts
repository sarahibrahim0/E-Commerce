import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { COUNTRIES } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly countries = COUNTRIES;

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly phoneDialCode = signal('+20');
  readonly country = signal('');
  readonly password = signal('');
  readonly confirm = signal('');
  readonly formError = signal<string | null>(null);

  protected readonly submitLabel = computed(() =>
    this.auth.loading() ? $localize`Creating account...` : $localize`Create account`,
  );

  private router = inject(Router);

  onCountryChange(code: string): void {
    const found = this.countries.find(c => c.code === code);
    if (found) {
      this.country.set(found.name);
      this.phoneDialCode.set(found.dialCode);
    }
  }

  async submit(): Promise<void> {
    if (!this.name().trim() || !this.email().trim() || !this.phone().trim() || !this.password()) {
      this.formError.set($localize`All fields are required.`);
      return;
    }
    if (this.password() !== this.confirm()) {
      this.formError.set($localize`Passwords do not match.`);
      return;
    }
    this.formError.set(null);
    try {
      await this.auth.register({
        name: this.name().trim(),
        email: this.email().trim(),
        phone: this.phone().trim(),
        phoneDialCode: this.phoneDialCode(),
        password: this.password(),
      });
      await this.router.navigate(['/verify-email']);
    } catch {
      // error surfaced via auth.error()
    }
  }
}
