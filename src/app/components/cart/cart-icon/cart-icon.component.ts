import { CartService } from './../../../services/cart/cart.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-icon',
  templateUrl: './cart-icon.component.html',
  styleUrls: ['./cart-icon.component.scss']
})
export class CartIconComponent {

  constructor(private CartService: CartService) { }
  cartCount = 0;



  ngOnInit(): void {
    this.CartService.cartSub$.subscribe(cart => {
      this.cartCount = cart?.items?.length ?? 0;

    })
  }

}
