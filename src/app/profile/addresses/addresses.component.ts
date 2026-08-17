import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressStore } from '../../core/stores/address.store';
import { AuthStore } from '../../core/stores/auth.store';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../shared/toast/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton.component';
import { Address } from '../../core/models';
import { normalizeApiError } from '../../core/services/api-error';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [FormsModule, EmptyStateComponent, LoadingSkeletonComponent],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss',
})
export class AddressesComponent implements OnInit {
  protected readonly store = inject(AddressStore);
  protected readonly auth = inject(AuthStore);

  readonly label = signal('Home');
  readonly street = signal('');
  readonly apartment = signal('');
  readonly city = signal('');
  readonly zip = signal('');
  readonly country = signal('');
  readonly phone = signal('');
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly isDefault = computed(() => this.store.default());

  private confirm = inject(ConfirmDialogService);
  private toasts = inject(ToastService);

  ngOnInit(): void {
    this.store.setUser(this.auth.userId());
    void this.store.load();
  }

  edit(address: Address): void {
    this.editingId.set(address.id);
    this.label.set(address.label);
    this.street.set(address.street);
    this.apartment.set(address.apartment);
    this.city.set(address.city);
    this.zip.set(address.zip);
    this.country.set(address.country);
    this.phone.set(address.phone);
  }

  resetForm(): void {
    this.editingId.set(null);
    this.label.set('Home');
    this.street.set('');
    this.apartment.set('');
    this.city.set('');
    this.zip.set('');
    this.country.set('');
    this.phone.set('');
  }

  async save(): Promise<void> {
    if (!this.street().trim() || !this.city().trim() || !this.country().trim() || !this.phone().trim()) {
      this.error.set('Street, city, country, and phone are required.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const body = {
      label: this.label().trim() || 'Home',
      street: this.street().trim(),
      apartment: this.apartment().trim(),
      city: this.city().trim(),
      zip: this.zip().trim(),
      country: this.country().trim(),
      phone: this.phone().trim(),
      isDefault: this.store.list().length === 0,
    };
    try {
      if (this.editingId()) {
        await this.store.update(this.editingId()!, body);
      } else {
        await this.store.create(body);
      }
      this.resetForm();
      this.toasts.show('Address saved', 'success');
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.saving.set(false);
    }
  }

  async setDefault(address: Address): Promise<void> {
    if (address.isDefault) return;
    await this.store.update(address.id, { isDefault: true });
    this.toasts.show('Default address updated', 'success');
  }

  async remove(address: Address): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete address',
      message: `Delete "${address.label}"?`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await this.store.remove(address.id);
    this.toasts.show('Address deleted', 'success');
  }
}
