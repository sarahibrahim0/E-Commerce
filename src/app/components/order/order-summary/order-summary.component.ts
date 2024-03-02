import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './../../../interfaces/product';
import { ProductsServiceService } from 'src/app/services/product/product.service';
import { CartService } from './../../../services/cart/cart.service';
import { Cart, CartItemsDetails } from 'src/app/interfaces/cart';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {

constructor(private ProductsServiceService: ProductsServiceService, private CartService: CartService){

}
orders : CartItemsDetails[] = [];
subtotal: number = 0;
@Output() placeOrderEmitter : EventEmitter<any> = new EventEmitter();

ngOnInit(){

  this.getOrderProducts();

}

private getOrderProducts(){

    const cart: Cart = this.CartService.getCart();
    return cart.items.forEach(element => {
      this.ProductsServiceService.getProductById(element.productId).subscribe({
        next: (value)=> {
          this.subtotal = this.subtotal + (value.price * element.quantity)
          this.orders.push ({
            product: value,
            quantity: element.quantity
          });
        },
      })
    })
  }


  placeOrder(){
    this.placeOrderEmitter.emit('emit');
  }


}
