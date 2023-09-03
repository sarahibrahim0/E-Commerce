import { getLocaleCurrencyCode } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Cart, CartItem, CartItemsDetails } from 'src/app/interfaces/cart';




@Injectable({
  providedIn: 'root'
})

export class CartService {

  cartSub$ : BehaviorSubject<Cart> = new BehaviorSubject(this.getCart());

  constructor( ) { }
  ngOnInit(){
    this.initialCartLocalStorage()
  }

  getCart(){
    const  localCart : string = localStorage.getItem('cart');
    const cart : Cart= JSON.parse(localCart);
    return cart;
  }

  initialCartLocalStorage(){
  const cart = this.getCart()
  if(!cart){
    const initialCart = {
      items: []
    }
    const CartStringified = JSON.stringify(initialCart);
    localStorage.setItem('cart', CartStringified);
  }
  }



  setCartItem (cartItem : CartItem, updateQuantity? : boolean) : Cart
  {
    const cart = this.getCart();
      const checkCartItem = cart.items.find(item=> item.productId === cartItem.productId);
    if(checkCartItem){
    cart.items.map(item=>
      {
        if(item.productId === cartItem.productId){
          if(updateQuantity){
            item.quantity = cartItem.quantity;
          }else{
            item.quantity = item.quantity + cartItem.quantity;
          }
      }
      return item;

    }

      )
    }else{
      cart.items.push(cartItem);
    }


    const CartStringified = JSON.stringify(cart);
    localStorage.setItem('cart',CartStringified );
    this.cartSub$.next(cart);
    return cart;


  }

  emptyCart() {
    const intialCart = {
      items: []
    };
    const intialCartJson = JSON.stringify(intialCart);
    localStorage.setItem("cart", intialCartJson);
    this.cartSub$.next(intialCart);
    localStorage.removeItem('orderItems')
  }


  deleteCartItem(productId : string){
    const cart = this.getCart();
    const newCart = cart.items.filter((item) => item.productId !== productId);
    cart.items = newCart;
    const cartJsonString = JSON.stringify(cart);
    localStorage.setItem('cart', cartJsonString);
    console.log(cart + 'delete')
    this.cartSub$.next(cart);
    console.log(cart +'cart sub')
}
}
