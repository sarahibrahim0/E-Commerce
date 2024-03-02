import { OrdersService } from 'src/app/services/order/order.service';
import { LoginService } from 'src/app/services/login/login.service';
import { UsersService } from './../../../services/user/user.service';
import { Component } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { Order } from 'src/app/interfaces/order';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(private UsersService: UsersService, private LoginService: LoginService, private OrdersService: OrdersService,
    private MessageService: MessageService){}
user: User;
id



userOrders: Order[] = []


  items: MenuItem[] | undefined;
  secItems :  MenuItem[] | undefined;
  ngOnInit() {

      this.getUser();


  }

  private getUser(){

    this.LoginService.$id.subscribe(id=>{ this.id = id
    })
    if(this.id){
      this.UsersService.getUserById(this.id).subscribe({
        next:(data) =>{ this.user = data;
          this.items = [{
            label: `Hello, ${this.user?.name}`,

            items: [
              {
                  label: 'Profile',
                  icon: 'pi pi-fw pi-user',
                  routerLink: '/profile'}
              // },
              // {
              //     label: 'Orders',
              //     icon: 'pi pi-fw pi-shopping-bag',
              //     routerLink:'/profile/orders'
              // }
          ]}];
          this.getUserOrders(this.id);

       },
        error:(error)=>{
          this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get User Info` });

        }
      })
      }
}

private getUserOrders(id:string){
  this.OrdersService.getUserOrders(id).subscribe({
    next:(data) =>{ this.userOrders = data
    if(this.userOrders.length !== 0){
      this.secItems =  [{
        label: `Hello, ${this.user?.name}`,

        items: [
          {
              label: 'Profile',
              icon: 'pi pi-fw pi-user',
              routerLink: '/profile'
          },
          {
              label: 'Orders',
              icon: 'pi pi-fw pi-shopping-bag',
              routerLink:'/profile/orders'
          }
      ]}];
    }
   },
    error:(error)=>{
      this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get User Orders` });

    }
  })
}



}
