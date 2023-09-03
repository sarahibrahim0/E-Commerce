import { CartService } from 'src/app/services/cart/cart.service';
import { timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LoginService } from 'src/app/services/login/login.service';
import { OrdersService } from './../../../services/order/order.service';
import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { OrderItem } from 'src/app/interfaces/order';
import { Cart } from 'src/app/interfaces/cart';
import { Order } from '@stripe/stripe-js';
@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent {

  constructor(private OrdersService: OrdersService, private LoginService: LoginService,
    private MessageService: MessageService, private router: Router, private CartService:CartService){}

    orderItems : Order;
    id : string


  ngOnInit(){
  this.postOrders();

  }

  getOrders(){
    const orders = localStorage.getItem('form');
    const orderParsed = JSON.parse(orders);
    this.id = localStorage.getItem('id');
    this.orderItems = {...orderParsed , user:  this.id };
  }


  postOrders(){
    this.getOrders()
  console.log(this.orderItems)
    this.OrdersService.postOrder(this.orderItems).subscribe({
      next :(data)=>{
        this.CartService.emptyCart();
        this.LoginService.$token.subscribe(t=>{
          console.log(t)
        })
        this.LoginService.$id.subscribe(id=> console.log(id))
      },
      error: (err)=>{
        this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Couldn't Order Now, try again!`});

      }
    })


 }

  }


