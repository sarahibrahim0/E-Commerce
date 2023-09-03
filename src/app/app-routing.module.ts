import { OrderItemComponent } from './components/profile/order-item/order-item.component';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './components/home/categories/categories/categories.component';
import { ProductItemComponent } from './components/product/product-item/product-item.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { HomeComponent } from './components/home/home/home.component';
import { ProductDetailsComponent } from './components/product/product-details/product-details.component';
import { CartComponent } from './components/cart/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout/checkout.component';
import { ThankyouComponent } from './components/thankyou/thankyou/thankyou.component';
import { isLoggedGuard } from './guards/login.guard';
import { LoginComponent } from './components/login/login/login.component';
import { SignupComponent } from './components/signup/signup/signup.component';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { OrdersListComponent } from './components/profile/orders-list/orders-list.component';
import { EditUserComponent } from './components/profile/edit-user/edit-user.component';
import { UserDataComponent } from './components/profile/user-data/user-data.component';
import { OrderDetailsComponent } from './components/profile/order-details/order-details.component';

const routes: Routes = [
  {path: '', component:HomeComponent},
  {path: 'products', component:ProductListComponent},
  {path: 'products/:id', component:ProductListComponent},
  {path: 'product/:id', component:ProductDetailsComponent},
  {path: 'category/:id', component:ProductListComponent},
  {path: 'cart', component:CartComponent},
  {path: 'checkout', component:CheckoutComponent, canActivate:[isLoggedGuard]},
  {path: 'success', component:ThankyouComponent},
  {path: 'login', component:LoginComponent},
  {path: 'register', component:SignupComponent},
  {path: 'error', component:SignupComponent},
  {path: 'profile', component:ProfileComponent ,  children: [
    { path: '', component: UserDataComponent},
    { path: 'user/edit', component: EditUserComponent},
    { path: 'orders', component: OrdersListComponent},
    { path:'orders/:orderId' , component :OrderDetailsComponent}
 ]},




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
