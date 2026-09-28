import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactMessage, PageContent } from '../models';
import { normalizeContentPage } from '../utils/localize';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private readonly cache = new Map<string, PageContent>();

  getByKey(key: string): Observable<PageContent> {
    return this.http.get<PageContent>(`${environment.apiUrl}content/${key}`).pipe(
      map(normalizeContentPage),
    );
  }

  getByKeyCached(key: string, fallback: PageContent): Observable<PageContent> {
    const cached = this.cache.get(key);
    if (cached) return new Observable((subscriber) => {
      subscriber.next(cached);
      subscriber.complete();
    });
    return new Observable((subscriber) => {
      this.getByKey(key).subscribe({
        next: (page) => {
          this.cache.set(key, page);
          subscriber.next(page);
          subscriber.complete();
        },
        error: (err) => {
          this.cache.set(key, fallback);
          subscriber.next(fallback);
          subscriber.complete();
        },
      });
    });
  }

  list(): Observable<PageContent[]> {
    return this.http.get<PageContent[]>(`${environment.apiUrl}content`).pipe(
      map((pages) => pages.map(normalizeContentPage)),
    );
  }

  create(body: Partial<PageContent>): Observable<PageContent> {
    return this.http.post<PageContent>(`${environment.apiUrl}content`, body).pipe(
      map(normalizeContentPage),
    );
  }

  update(id: string, body: Partial<PageContent>): Observable<PageContent> {
    return this.http.put<PageContent>(`${environment.apiUrl}content/${id}`, body).pipe(
      map(normalizeContentPage),
    );
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}content/${id}`);
  }

  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  sendMessage(message: ContactMessage): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}content/contact-message`, message);
  }
}