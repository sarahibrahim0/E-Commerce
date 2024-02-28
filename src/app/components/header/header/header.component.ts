import { every, filter } from 'rxjs/operators';
import { LoginService } from 'src/app/services/login/login.service';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(private LoginService: LoginService, private router: Router, private activatedRote: ActivatedRoute,
    ){

    }

currentUrl
loggedIn : boolean
token : string
hide : string
items
icon
label
iconVal: string
labelVal : string
linkString
ngOnInit(){
  this.getToken();

  this.setHidden()




}

private setHidden(){
  this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  .subscribe(event =>
   {
    if(event['url'] === '/login'){
      this.hide= '0'
    }else{
      this.hide = '1'
    }
   });


}


private getToken(){
  this.LoginService.$token.subscribe((token)=>{
    this.token = token

  })

}
login(){
return this.router.navigate(['/login']);
}

logout(){
return this.LoginService.logOut();
}


}
