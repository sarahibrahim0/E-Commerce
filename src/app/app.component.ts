import { CartService } from './services/cart/cart.service';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'E-Commerce';

  constructor(private CartService: CartService){}

  ngOnInit(){
    this.CartService.initialCartLocalStorage()
  }
}
