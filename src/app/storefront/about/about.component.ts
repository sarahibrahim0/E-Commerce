import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { normalizeApiError } from '../../core/services/api-error';
import { ContentSection, PageContent } from '../../core/models';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
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

  protected readonly sectionIcon = (section: ContentSection): string => {
    const h = section.heading.toLowerCase();
    if (/story|who/i.test(h)) return 'bi-journal-bookmark';
    if (/stand|value|mission|promise/i.test(h)) return 'bi-heart';
    if (/deliver|shipping|delivery/i.test(h)) return 'bi-truck';
    if (/price|pricing/i.test(h)) return 'bi-tag';
    if (/support|help|service/i.test(h)) return 'bi-headset';
    if (/quality|material/i.test(h)) return 'bi-gem';
    return 'bi-stars';
  };
}