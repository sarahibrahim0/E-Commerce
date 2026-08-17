import { Component, OnInit, inject, signal } from '@angular/core';
import { ContentService } from '../../core/services/content.service';
import { normalizeApiError } from '../../core/services/api-error';
import { PageContent } from '../../core/models';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [LoadingSkeletonComponent, EmptyStateComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  readonly content = signal<PageContent | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private api = inject(ContentService);

  ngOnInit(): void {
    this.api.getByKey('about').subscribe({
      next: (page) => this.content.set(page),
      error: (err) => this.error.set(normalizeApiError(err).message),
      complete: () => this.loading.set(false),
    });
  }
}
