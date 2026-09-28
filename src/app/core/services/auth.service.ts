import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, RegisterRequest, RegisterResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}users`;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password });
  }

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.base}/register`, body);
  }

  me(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  update(id: string, body: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, body);
  }

  verifyEmail(userId: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/verify-email`, { userId, code });
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, { token, newPassword: password });
  }
}