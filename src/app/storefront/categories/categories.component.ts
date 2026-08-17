import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Category } from '../../core/models';
import { CategoriesService } from '../../core/services/categories.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private api = inject(CategoriesService);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.categories.set(await firstValueFrom(this.api.list()));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not load categories');
    } finally {
      this.loading.set(false);
    }
  }
}
