import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./storefront/home/home.component').then((m) => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./storefront/product-list/product-list.component').then((m) => m.ProductListComponent) },
  { path: 'product/:id', loadComponent: () => import('./storefront/product-details/product-details.component').then((m) => m.ProductDetailsComponent) },
  { path: 'categories', loadComponent: () => import('./storefront/categories/categories.component').then((m) => m.CategoriesComponent) },
  { path: 'cart', canActivate: [authGuard], loadComponent: () => import('./storefront/cart/cart.component').then((m) => m.CartComponent) },
  { path: 'wishlist', canActivate: [authGuard], loadComponent: () => import('./storefront/wishlist/wishlist.component').then((m) => m.WishlistComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./storefront/checkout/checkout.component').then((m) => m.CheckoutComponent) },
  { path: 'order/success', loadComponent: () => import('./storefront/order-success/order-success.component').then((m) => m.OrderSuccessComponent) },
  { path: 'verify-email', loadComponent: () => import('./auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent) },
  { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent) },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      { path: '', loadComponent: () => import('./profile/user-data/user-data.component').then((m) => m.UserDataComponent) },
      { path: 'user/edit', loadComponent: () => import('./profile/edit-user/edit-user.component').then((m) => m.EditUserComponent) },
      { path: 'addresses', loadComponent: () => import('./profile/addresses/addresses.component').then((m) => m.AddressesComponent) },
      { path: 'orders', loadComponent: () => import('./profile/orders-list/orders-list.component').then((m) => m.OrdersListComponent) },
      { path: 'orders/:orderId', loadComponent: () => import('./profile/order-details/order-details.component').then((m) => m.OrderDetailsComponent) },
    ],
  },
  { path: 'about', loadComponent: () => import('./storefront/about/about.component').then((m) => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./storefront/contact/contact.component').then((m) => m.ContactComponent) },
  { path: '**', loadComponent: () => import('./storefront/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
