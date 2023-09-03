import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Form } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})

export class SignupService {


  api = `${environment.apiUrl}users/register`

  constructor(private http: HttpClient) { }

  signUp(user: User) : Observable<User>
  {
   return this.http.post<any>(`${this.api}`,user)
  }

}
