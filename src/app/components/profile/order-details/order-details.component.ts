import { state } from '@angular/animations';
import { Order } from './../../../interfaces/order';
import { Component, Output } from '@angular/core';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { OrdersService } from 'src/app/services/order/order.service';
import { BehaviorSubject, Observable, Observer, Subject, of } from 'rxjs';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent {

  id: string = ''
  order: Order;
  items: MenuItem[] | undefined;
  id$ : string
  myObservable : Observable<Order>
  myObserver : Observer<Order>

activeIndex: number = 0;

orderStatuss = {
  0: { label: 'pending', color: 'primary' },
  1: { label: 'processed', color: 'warning' },
  2: { label: 'shipped', color: 'warning' },
  3: { label: 'delivered', color: 'success' },
  4: { label: 'failed', color: 'danger' },
}

orderStatus ={
  0 : 'Pending',
  1 :'Processed',
  2: 'Shipped',
  3: 'Delivered',
  4: 'Failed'
  }

constructor(private ActivatedRoute: ActivatedRoute, private router: Router, private OrdersService: OrdersService, private MessageService: MessageService){
  // if (this.router.getCurrentNavigation() != null) {
  // console.log(this.router.getCurrentNavigation().extras.state)
  // const state = this.router.getCurrentNavigation().extras.state;
  // this.id = state['id'];}
  // console.log(this.id + 'iddd')
  }


ngOnInit(){
this.ActivatedRoute.params.subscribe({
  next: (params)=>{
    console.log(params)

    if(params['orderId']){
      let id = params['orderId']
      this.getOrderDetails(id);

    }
  }
})

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


private getOrderDetails(id: string){
  if(id){
    this.OrdersService.getOrderById(id).subscribe({
      next: (data)=>{
      this.order = data;

      },
    error: (error)=>{
      this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get Order` });

    }
      }

    )}}

  }