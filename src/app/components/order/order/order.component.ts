import { ProductsServiceService } from './../../../services/product/product.service';
import { CartService } from './../../../services/cart/cart.service';
import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil, take } from 'rxjs';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
totalPrice: number = 0
endSub$ : Subject<any> = new Subject()
  constructor(private CartService: CartService, private ProductsServiceService: ProductsServiceService){}

  ngOnInit(){
    this.getOrderSummary()
  }

  private getOrderSummary(){
    this.CartService.cartSub$.subscribe(cart=>{
      this.totalPrice =0
    if(cart){
      cart.items.map(item=>
        this.ProductsServiceService.getProductById(item.productId).subscribe({
          next: (product)=>{this.totalPrice = this.totalPrice + product.price*item.quantity},
          error: (err)=>{ console.log(err)}
        })
        )
    }
    })
  }

  ngOnDestroy(){
    this.endSub$.next(0);
    this.endSub$.complete()
  }
}
