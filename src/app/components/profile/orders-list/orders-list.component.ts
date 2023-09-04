import { MessageService } from 'primeng/api';
import { Product } from './../../../interfaces/product';
import { LoginService } from 'src/app/services/login/login.service';
import { OrdersService } from 'src/app/services/order/order.service';
import { Component, Input } from '@angular/core';
import { Order, OrderItem } from 'src/app/interfaces/order';
import { Router, ActivatedRoute } from '@angular/router';
import { state } from '@angular/animations';



@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent {
p: number = 1;
id:string
orderList: OrderItem [] = []
orderProducts: any = []
ordersArr : Order[] = []
finalList = [];
orderStatus = {
  'Pending': 'limegreen' ,
  'Processed': 'yellow' ,
  'Shipped': 'yellow' ,
  'Delivered': 'green' ,
  'Failed': 'red' ,
}




constructor(private ActivatedRoute: ActivatedRoute, private OrdersService: OrdersService, private LoginService: LoginService, private router: Router,private MessageService: MessageService){}

ngOnInit(){
  this.getUserOrders();

}

private getUserOrders(){
  this.LoginService.$id.subscribe(id=>{
    this.id = id
  })
  if(this.id)
{  this.OrdersService.getUserOrders(this.id).subscribe({
  next:(orders)=>{
    let count
    let prodArr = []
    orders.forEach(order=>{

this.ordersArr.push(order)
      order.orderItems.forEach(item=>{

        this.orderList.push(item);


      })


      count = this.orderList.reduce((accumulator, value, index) => {
        accumulator[value.product.id] = accumulator[value.product.id] + value.quantity  || value.quantity;
         prodArr.push(value.product)
        return accumulator;
      }, {});

    })

    console.log(this.ordersArr)

    for(let item in count){
      const ele : Product = prodArr.find(ele=> ele.id === item);
      this.orderProducts.push({product: ele, quantity: count[item]});

    }

  },
  error :(err)=>{
    this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get Orders` });

  },
})
}
}

 private elementCount(arr, element){
  return arr.filter((currentElement) => currentElement == element).length;
 };

 viewOrder(id: string){
//   console.log(id)
// this.router.navigate(['/profile/orders/:${id}'])
 }
}
