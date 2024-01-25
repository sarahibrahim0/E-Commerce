import { LoginService } from './../services/login/login.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class userInterceptor implements HttpInterceptor {

  constructor(private LoginService: LoginService) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = this.LoginService.getToken()
    const apiUrl = request.url.startsWith(environment.apiUrl);

     if(apiUrl && token){

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })

     }

     return next.handle(request);


  }
}
