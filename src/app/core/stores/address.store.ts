import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Address, AddressInput } from '../models';
import { AddressesService } from '../services/addresses.service';
import { normalizeApiError } from '../services/api-error';

@Injectable({ providedIn: 'root' })
export class AddressStore {
  private api = inject(AddressesService);

  private userId: string | null = null;
  readonly list = signal<Address[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly default = computed(() => this.list().find((a) => a.isDefault) ?? null);

  setUser(userId: string | null): void {
    this.userId = userId;
  }

  async load(): Promise<void> {
    const id = this.userId;
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      this.list.set(await firstValueFrom(this.api.list(id)));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  async create(body: AddressInput): Promise<void> {
    if (!this.userId) return;
    await firstValueFrom(this.api.create(this.userId, body));
    await this.load();
  }

  async update(addressId: string, body: Partial<AddressInput>): Promise<void> {
    if (!this.userId) return;
    await firstValueFrom(this.api.update(this.userId, addressId, body));
    await this.load();
  }

  async remove(addressId: string): Promise<void> {
    if (!this.userId) return;
    await firstValueFrom(this.api.remove(this.userId, addressId));
    await this.load();
  }
}
