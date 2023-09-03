import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Order } from 'src/app/interfaces/order';
import { User } from 'src/app/interfaces/user';
import { LoginService } from 'src/app/services/login/login.service';
import { UsersService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss']
})
export class UserDataComponent {


  constructor(private UsersService: UsersService, private LoginService: LoginService) { }
  user: User;
  id



  userOrders: Order[] = []


  items: MenuItem[] | undefined;

  ngOnInit() {

    this.getUser();


  }

  private getUser() {

    this.LoginService.$id.subscribe(id => {
      this.id = id
    })
    if (this.id) {
      this.UsersService.getUserById(this.id).subscribe({
        next: (data) => {
          this.user = data;
          this.items = [{
            label: `Hello ${this.user?.name}`,

            items: [
              {
                label: 'Profile',
                icon: 'pi pi-fw pi-user',
                routerLink: '/profile/user'
              },
              {
                label: 'Orders',
                icon: 'pi pi-fw pi-shopping-bag',
                routerLink: '/profile/orders'
              }
            ]
          }];

        },
        error: (error) => console.log('Error getting user:', error)
      })
    }
  }


}
