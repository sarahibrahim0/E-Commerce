import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactMessage, PageContent } from '../models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);

  getByKey(key: string): Observable<PageContent> {
    return this.http.get<PageContent>(`${environment.apiUrl}content/${key}`);
  }

  sendMessage(message: ContactMessage): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}content/contact-message`, message);
  }
}
