import { Product } from 'src/app/interfaces/product';
import { CartService } from './../../../services/cart/cart.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartItem, CartItemsDetails } from 'src/app/interfaces/cart';
import { ProductsServiceService } from 'src/app/services/product/product.service';
interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})




export class CartComponent implements OnInit{

  first: number = 0;

  rows: number = 10;

  p: number = 1 ;

  onPageChange(event: PageEvent) {
      this.first = event.first;
      this.rows = event.rows;
  }

  endSub$: Subject<any> = new Subject()

  constructor(private Router : Router, private CartService: CartService, private productService: ProductsServiceService){}

  cartCount : number ;
  cartItemsDetails :CartItemsDetails[] = []

  ngOnInit(){
    this.getCartDetails();
    console.log(this.p)
  }
  backToShop(){
this.Router.navigate(['/products'])
}

getEvent(event){

}


 getCartDetails (){
    this.CartService.cartSub$.pipe(takeUntil(this.endSub$)).subscribe(cart => {
      // this.cartItemsDetails = []
      this.cartCount = cart.items.length ?? 0;
      cart.items.forEach(item=> {



        let occurance = this.cartItemsDetails.findIndex(arrItem=>{
          return arrItem.product.id === item.productId
         })


if(occurance !== -1){
this.cartItemsDetails[occurance].quantity + 1;
}else{
  let id = item.productId;
  this.productService.getProductById(id).subscribe(product => {
    this.cartItemsDetails.push({
      product: product,
      quantity: item.quantity
    });
  });
}
      });
    });
}

deleteCartItem(cartItem : CartItemsDetails ){

this.CartService.deleteCartItem(cartItem?.product?.id);
let index =  this.cartItemsDetails.findIndex(item=> cartItem.product.id === item.product.id);
if(index !== -1)
{this.cartItemsDetails.splice(index,1)
}
}
updateCartQuantity(event, cartItem){
  console.log(event.value)
this.CartService.setCartItem({productId: cartItem?.product?.id, quantity: event.value}, true)
}

ngOnDestroy(){
this.endSub$.next(this.cartItemsDetails);
this.endSub$.complete()
}

}
