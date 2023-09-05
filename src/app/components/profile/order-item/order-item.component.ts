import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Order, OrderItem } from 'src/app/interfaces/order';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent {
@Input() orderItem : OrderItem;
@Input() status: string
events: string[];



id: string;
order: Order;

items: MenuItem[] | undefined;

activeIndex: number = 0;

orderStatus  = {
  0:{ status: 'Pending',  color:'limegreen', label: 0 },
  1: {status: 'Processed',color: 'yellow', label: 1 },
  2: {status: 'Shipped', color:'yellow', label: 2} ,
  3: {status: 'Delivered',color: 'green', label:3} ,
  4: {status: 'Failed',color: 'red', label: 4} ,
 }
constructor(public messageService: MessageService){




}




ngOnInit() {

  console.log(this.status + this.orderStatus[this.status].status)
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

}}