import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";



export class loginGuard {
  CanActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ){

    return true
  }
}

export const isLoggedGuard : CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot )=>{
  return inject(loginGuard).CanActivate(route, state)
}