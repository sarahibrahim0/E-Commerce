import { CartItem } from './../../../interfaces/cart';
import { Product } from './../../../interfaces/product';
import { CartService } from './../../../services/cart/cart.service';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent {
  constructor(private Router : Router, private CartService: CartService){}

  @Input()
  product!: Product;
  @Output() addCart = new EventEmitter()
  addToCart(product)
{
const CartItem : CartItem = {productId : product.id, quantity: 1 }
this.CartService.setCartItem(CartItem, false);
this.addCart.emit();
}

}
