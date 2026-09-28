import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ContentService } from '../../core/services/content.service';
import { normalizeApiError } from '../../core/services/api-error';
import { PageContent } from '../../core/models';
import { ToastService } from '../../shared/toast/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, EmptyStateComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  readonly content = signal<PageContent | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly name = signal('');
  readonly email = signal('');
  readonly subject = signal('');
  readonly message = signal('');
  readonly sending = signal(false);
  readonly formError = signal<string | null>(null);

  protected readonly sendLabel = computed(() =>
    this.sending() ? $localize`Sending...` : $localize`Send message`,
  );

  private api = inject(ContentService);
  private toasts = inject(ToastService);

  ngOnInit(): void {
    this.api.getByKey('contact').subscribe({
      next: (page) => this.content.set(page),
      error: (err) => this.error.set(normalizeApiError(err).message),
      complete: () => this.loading.set(false),
    });
  }

  async send(): Promise<void> {
    if (!this.name().trim() || !this.email().trim() || !this.message().trim()) {
      this.formError.set($localize`Name, email, and message are required.`);
      return;
    }
    this.sending.set(true);
    this.formError.set(null);
    try {
      await firstValueFrom(this.api.sendMessage({
        name: this.name().trim(),
        email: this.email().trim(),
        subject: this.subject().trim(),
        message: this.message().trim(),
      }));
      this.name.set('');
      this.email.set('');
      this.subject.set('');
      this.message.set('');
      this.toasts.show($localize`Message sent — we will reply soon.`, 'success');
    } catch (err) {
      this.formError.set(normalizeApiError(err).message);
    } finally {
      this.sending.set(false);
    }
  }
}
