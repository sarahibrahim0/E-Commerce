import { StripeService } from 'ngx-stripe';
import { Observable, switchMap } from 'rxjs';
import { Order, OrderItem } from'../../interfaces/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const orderStatus = {
  'Pending': "0" ,
   'Processed': "1" ,
  'Shipped' :"2" ,
   'Delivered': "3" ,
   'Failed':"4" ,
 }

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient, private StripeService : StripeService) { }

  api = `${environment.apiUrl}orders`

  postOrder(order: Order) : Observable<Order> {

    let newOrder = {... order , status : orderStatus[order.status] }
    console.log(newOrder)
    return this.http.post<Order>(`${this.api}`, order);
  }

  getOrders() : Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.api}/${id}`);
  }

  deleteOrder(id: string): Observable<Order> {
    return this.http.delete<Order>(`${this.api}/${id}`);
  }

  editOrder(id: string , order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.api}/${id}`, order);
  }



  editOrderStatus(orderId : string , orderStatus : any) : Observable<Order>
  {
        return this.http.put<Order>(`${this.api}/${orderId}`, orderStatus);
  }

  createCheckoutSession( orderItems: OrderItem[])
  {
    return this.http.post(`https://dashboard-pnlv.onrender.com/api/v1/orders/create-checkout-session`, orderItems).pipe(switchMap((session :{id:string }) => this.StripeService.redirectToCheckout({sessionId: session['id']})))
}


getUserOrders(userID: string): Observable<Order[]>
{
return this.http.get<Order[]>(`${this.api}/getuserorders/${userID}`);
}


}
