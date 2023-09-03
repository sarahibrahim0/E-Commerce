import { state } from '@angular/animations';
import { Order } from './../../../interfaces/order';
import { Component, Output } from '@angular/core';
import { Route, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { OrdersService } from 'src/app/services/order/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent {

  id: string;
  order: Order;
  items: MenuItem[] | undefined;

activeIndex: number = 0;

orderStatus ={
 'Pending' : 0,
 'Processed':1 ,
 'Shipped':2,
 'Delivered':3,
 'Failed': 4
}

constructor(private router: Router, private OrdersService: OrdersService, private MessageService: MessageService){
  if (this.router.getCurrentNavigation() != null) {
  console.log(this.router.getCurrentNavigation().extras.state)
  const state = this.router.getCurrentNavigation().extras.state;
  this.id = state['id'];}
// this.id= '64d4d12e114eab33d05fcad8'
  }


ngOnInit(){
this.getOrderDetails();

this.items = [
  {
      label: 'Pending',
  },
  {
      label: 'Processed',
  },
  {
      label: 'Shipped',
  },
  {
      label: 'Delivered',
  },
  {
    label: 'Failed'
  }
];
}


private getOrderDetails(){
  if(this.id){
    this.OrdersService.getOrderById(this.id).subscribe({
      next: (data)=>{console.log(data)
      this.order = data;
      },
    error: (error)=>{
      this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get Order` });

    }
      }



    )}}


  }