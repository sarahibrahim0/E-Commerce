import { Product } from 'src/app/interfaces/product';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../../interfaces/user';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  api = `${environment.apiUrl}users/login`
  $token : BehaviorSubject<string> = new BehaviorSubject<string>(this.getToken())
  $id : BehaviorSubject<string> = new BehaviorSubject<string>(this.getId())

  constructor(private http : HttpClient) {
   }

  login(email: string , password: string) : Observable<User>
  {
   return this.http.post<any>(`${this.api}`, { email,  password})
  }

  setToken(data){
    localStorage.setItem('Token', data);
  }

  getToken(){

  return localStorage.getItem('Token');

  }

  removeToken(){
    localStorage.removeItem('Token');
  }

  setId(id: string){
    localStorage.setItem('id', id);
  }

  getId(){
    return localStorage.getItem('id');
  }
  logOut(){
    localStorage.removeItem('Token');
    localStorage.removeItem('id')
    this.$token.next(null)
  }
}


