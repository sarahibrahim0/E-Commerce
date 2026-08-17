import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  protected readonly auth = inject(AuthStore);

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly confirm = signal('');
  readonly formError = signal<string | null>(null);

  private router = inject(Router);

  async submit(): Promise<void> {
    if (!this.name().trim() || !this.email().trim() || !this.phone().trim() || !this.password()) {
      this.formError.set('All fields are required.');
      return;
    }
    if (this.password() !== this.confirm()) {
      this.formError.set('Passwords do not match.');
      return;
    }
    this.formError.set(null);
    try {
      await this.auth.register({
        name: this.name().trim(),
        email: this.email().trim(),
        phone: this.phone().trim(),
        password: this.password(),
      });
      await this.router.navigate(['/']);
    } catch {
      // error surfaced via auth.error()
    }
  }
}
