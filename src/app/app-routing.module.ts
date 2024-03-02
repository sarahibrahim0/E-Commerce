import { CanActivateFn } from '@angular/router';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { ErrorComponent } from './components/error/error.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { CategoriesComponent } from './components/home/categories/categories/categories.component';
const routes: Routes = [
  {path: '', component:HomeComponent},
  {path: 'products', component:ProductListComponent},
  {path: 'about', component:AboutComponent},
  {path: 'contact', component:ContactComponent},
  {path: 'products', component:ProductListComponent},
  {path: 'product/:id', component:ProductDetailsComponent},
  {path: 'categories', component:CategoriesComponent},
  {path: 'cart', component:CartComponent , canActivate: [isLoggedGuard] },
  {path: 'checkout', component:CheckoutComponent , canActivate: [isLoggedGuard]},
  {path: 'https://65e290b27dacf15320f978dc--merry-ganache-664652.netlify.app/order/success', component:ThankyouComponent},
  {path: 'login', component:LoginComponent},
  {path: 'register', component:SignupComponent},
  {path: 'error', component:SignupComponent},
  {path: 'profile', component:ProfileComponent ,  children: [
    { path: '', component: UserDataComponent},
    { path: 'user/edit', component: EditUserComponent},
    { path: 'orders', component: OrdersListComponent },
    { path:'orders/:orderId' , component :OrderDetailsComponent}

 ] , canActivate : [isLoggedGuard] },

{path:'**' , component : ErrorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
