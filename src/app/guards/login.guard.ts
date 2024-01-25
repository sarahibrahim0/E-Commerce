import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { LoginService } from '../services/login/login.service';
import { environment } from 'src/environments/environment';

export const isLoggedGuard : CanActivateFn = ()=>{

  const router = inject(Router);
  const loginService =  inject(LoginService);
  const api = environment.apiUrl
  let userToken: string ;

  loginService.$token.subscribe(token=>{
    userToken = token;

  })



}