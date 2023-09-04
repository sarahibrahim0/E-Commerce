import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { LoginService } from '../services/login/login.service';


export const isLoggedGuard : CanActivateFn = ()=>{

  const router = inject(Router);
  const loginService =  inject(LoginService);
  let userToken: string ;

  loginService.$token.subscribe(token=>{
    userToken = token;

  })

  if(!userToken){
router.navigate(['/login'])
return false
  }

  return true;

}