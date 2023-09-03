import { User } from '../../interfaces/user';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as countriesLib from 'i18n-iso-countries';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  api = `${environment.apiUrl}users`

  constructor(private http: HttpClient) { }

  getUsers() : Observable<User[]>{
    return this.http.get<User[]>(`${this.api}`);
  }

  getUserById(id: string) : Observable<User>
  {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  postUser(user : User) : Observable<User>
  {
    return this.http.post<User>(`${this.api}`, user);
  }

  deleteUser(id: string): Observable<User>
  {
    return this.http.delete<User>(`${this.api}/${id}`);
  }

  editUser( id : string , user: User ) : Observable<User>
  {
    return this.http.put<User>(`${this.api}/${id}`, user);
  }


  getCountries(): { id: string; name: string }[] {
    return Object.entries(countriesLib.getNames('en', { select: 'official' })).map((entry) => {
      return {
        id: entry[0],
        name: entry[1]
      };
    });
  }

  getCountry(countryKey: string): string {
    return countriesLib.getName(countryKey, 'en');
  }
}
