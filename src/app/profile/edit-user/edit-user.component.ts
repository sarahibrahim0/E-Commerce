import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../core/stores/auth.store';
import { AuthService } from '../../core/services/auth.service';
import { normalizeApiError } from '../../core/services/api-error';
import { ToastService } from '../../shared/toast/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  protected readonly auth = inject(AuthStore);

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly street = signal('');
  readonly apartment = signal('');
  readonly city = signal('');
  readonly zip = signal('');
  readonly country = signal('');
  readonly password = signal('');
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private api = inject(AuthService);
  private toasts = inject(ToastService);

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.name.set(user.name);
      this.email.set(user.email);
      this.phone.set(user.phone);
      this.street.set(user.street);
      this.apartment.set(user.apartment);
      this.city.set(user.city);
      this.zip.set(user.zip);
      this.country.set(user.country);
    }
  }

  async save(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.api.update(userId, {
          name: this.name().trim(),
          email: this.email().trim(),
          phone: this.phone().trim(),
          street: this.street().trim(),
          apartment: this.apartment().trim(),
          city: this.city().trim(),
          zip: this.zip().trim(),
          country: this.country().trim(),
          ...(this.password() ? { password: this.password() } : {}),
        }),
      );
      await this.auth.loadUser();
      this.password.set('');
      this.toasts.show('Profile updated', 'success');
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.saving.set(false);
    }
  }
}
