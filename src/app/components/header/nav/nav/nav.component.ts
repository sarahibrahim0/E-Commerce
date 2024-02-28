import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {


  constructor(private LoginService: LoginService, private router: Router, private ActivatedRoute: ActivatedRoute,
    ){

    }

  url :string;
  hideNav: boolean = false;
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
idParam : string

sidebarVisible: boolean = false;

@HostListener('window:scroll', ['$event'])
onScroll(event) {
  this.hideNav = window.scrollY > 80;
}

  ngOnInit(){
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.url = event.url  // This will log the URL of the page whenever it changes
    });




    this.ActivatedRoute.paramMap.subscribe((params)=>
    {

      console.log(params)
      if(params['id']){
       console.log('id' + params['id'])
     }}
   )

    this.getToken();

    this.setHidden()



  }




toggleSideBar(){
  this.sidebarVisible = !this.sidebarVisible;
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
