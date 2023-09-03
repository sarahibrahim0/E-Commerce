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

orderStatus ={
'Pending' : 0,
'Processed':1 ,
'Shipped':2,
'Delivered':3,
'Failed': 4
}

constructor(public messageService: MessageService){




}




ngOnInit() {
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