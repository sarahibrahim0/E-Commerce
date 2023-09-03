import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header/header.component';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './components/header/nav/nav/nav.component';
import { SearchComponent } from './components/header/search/search.component';
import { HomeComponent } from './components/home/home/home.component';
import { BannerComponent } from './components/home/banner/banner/banner.component';
import { CategoriesComponent } from './components/home/categories/categories/categories.component';
import { FeaturedProductsComponent } from './components/home/featured-products/featured-products/featured-products.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductItemComponent } from './components/product/product-item/product-item.component';
import { FooterComponent } from './components/home/footer/footer.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { CheckboxModule } from 'primeng/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ProductDetailsComponent } from './components/product/product-details/product-details.component';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProductGalleryComponent } from './components/product/product-gallery/product-gallery.component';
import { CartComponent } from './components/cart/cart/cart.component';
import { OrderComponent } from './components/order/order/order.component';
import { CartIconComponent } from './components/cart/cart-icon/cart-icon.component';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CheckoutComponent } from './components/checkout/checkout/checkout.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { userInterceptor } from './interceptor/user-auth.interceptor';
import { ThankyouComponent } from './components/thankyou/thankyou/thankyou.component';
import { isLoggedGuard, loginGuard } from './guards/login.guard';
import { LoginComponent } from './components/login/login/login.component';
import { SignupComponent } from './components/signup/signup/signup.component';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from '../environments/environment';
import { ErrorComponent } from './components/error/error.component';
import { PaginatorModule } from 'primeng/paginator';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { MenuModule } from 'primeng/menu';
import { UserDataComponent } from './components/profile/user-data/user-data.component';
import { OrdersListComponent } from './components/profile/orders-list/orders-list.component';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { EditUserComponent } from './components/profile/edit-user/edit-user.component';
import { TableModule } from 'primeng/table';
import { OrderDetailsComponent } from './components/profile/order-details/order-details.component';
import { OrderItemComponent } from './components/profile/order-item/order-item.component';
import { TimelineModule } from 'primeng/timeline';
import { MenubarModule } from 'primeng/menubar';
import { StepsModule } from 'primeng/steps';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    SearchComponent,
    HomeComponent,
    BannerComponent,
    CategoriesComponent,
    FeaturedProductsComponent,
    ProductItemComponent,
    FooterComponent,
    ProductListComponent,
    ProductDetailsComponent,
    ProductGalleryComponent,
    CartComponent,
    OrderComponent,
    CartIconComponent,
    CheckoutComponent,
    ThankyouComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent,
    ProfileComponent,
    UserDataComponent,
    OrdersListComponent,
    EditUserComponent,
    OrderDetailsComponent,
    OrderItemComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ButtonModule,
    HttpClientModule,
    CommonModule,
    RouterModule,
    CheckboxModule,
    FormsModule,
    RatingModule,
    InputNumberModule,
    BadgeModule,
    ToastModule,
    ReactiveFormsModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule    ,
    PaginatorModule,
   MenubarModule,
    CardModule,
    FieldsetModule,
    TableModule,
TimelineModule,
MenuModule,
StepsModule,
NgxPaginationModule,
NgxStripeModule.forRoot(environment.stripe.publicKey),
MatMenuModule
  ],
  providers: [MessageService, ConfirmationService, loginGuard,

    {provide: HTTP_INTERCEPTORS, useClass: userInterceptor ,  multi: true},


  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
