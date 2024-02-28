import { CartService } from './services/cart/cart.service';
import { Component, ElementRef, HostListener, NgModule, ViewChild } from '@angular/core';
import { LoginService } from './services/login/login.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isScrolled = false;
  token: string;
  url : string

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.isScrolled = window.scrollY < 100;
  }

  @ViewChild('top') topContent: ElementRef;




  title = 'Angular E-commerce';

  constructor(private CartService: CartService , private LoginService : LoginService , private route: Router ){}

  ngOnInit(){
    this.CartService.initialCartLocalStorage();
    this.LoginService.$token.subscribe({
      next : (token)=>{
        console.log(token , 'token');
        this.token = token;
      }

    })
    this.route.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.url = event.url  // This will log the URL of the page whenever it changes
    });
  }


  scrollToElement()
  {
    this.topContent.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
