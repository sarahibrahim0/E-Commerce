import { LoginService } from './../../../services/login/login.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, NavigationStart, Route, Router } from '@angular/router';
import { Cart } from 'src/app/interfaces/cart';
import { Order, OrderItem } from 'src/app/interfaces/order';
import { CartService } from 'src/app/services/cart/cart.service';
import { OrdersService } from 'src/app/services/order/order.service';
import { UsersService } from 'src/app/services/user/user.service';
import * as countriesList from 'i18n-iso-countries'
import { BehaviorSubject, filter, timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Stripe } from '@stripe/stripe-js';
import { StripeService } from 'ngx-stripe';

declare function require(name:string);


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {


  constructor(    private router: Router,
    private usersService: UsersService,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private ordersService: OrdersService,
    private LoginService: LoginService,
    private MessageService: MessageService,
    private stripe: StripeService){
    }


  checkoutFormGroup: FormGroup;
  isSubmitted = false;
  orderItems: OrderItem [] = [];
  userId = '64004a943ec39500352b79ea';
  countries = [];
  countryName: string;
  userCountry : BehaviorSubject<any> = new BehaviorSubject<any>(null);
  error



  ngOnInit(): void {
    this.getCountries();
    this._initCheckoutForm();
    this._getCartItems();
    this.setPrevForm();


    if(localStorage.getItem('form')){
      this.getPrevForm()
    }

  }

  private _initCheckoutForm() {
    this.checkoutFormGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zip: ['', Validators.required],
      apartment: ['', Validators.required],
      street: ['', Validators.required],
      shippingAddress1 : ['', Validators.required],
      shippingAddress2 : ['', Validators.required],

    });
  }

  private _getCartItems() {
    const cart : Cart = this.cartService.getCart();
    this.orderItems = cart.items.map((item) => {
      return {
        product: item.productId,
        quantity: item.quantity
      };
    });
  }

  backToCart() {
    this.router.navigate(['/cart']);
  }

  get checkoutForm() {
    return this.checkoutFormGroup.controls;
  }




  placeOrder() {

  if(this.checkoutFormGroup.invalid){
    this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Please Enter Correct info`});

  }else{

    this.setPrevForm();
    if(!this.LoginService.getToken()){
        this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `You Must Log in To Continue`});
        timer(1600).subscribe(() => {
          this.router.navigate(['/login'])
        })

    }else{
      this.ordersService.createCheckoutSession(this.orderItems).subscribe({
        error: (err)=>{
                this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Something Went Wrong During Payment`});
        }
      })
    }
  }
  }


  private getCountries(){
    countriesList.registerLocale(require("i18n-iso-countries/langs/en.json"));
   this.countries = Object.entries(countriesList.getNames("en", {select: "official"})).map(country=>{
  return {
    id : country[0],
    name : country[1]
  }
    })
    }


    setPrevForm(){

        this.LoginService.$id.subscribe(id=>{
          if(id){
            this.usersService.getUserById(id).subscribe({
              next:(data) =>{
                const prevForm = {
                name: data?.name,
                 orderItems:  this.orderItems || this.checkoutFormGroup.controls['name'].value,
                 email: data?.email || this.checkoutFormGroup.controls['email'].value,
                 phone: data?.phone || this.checkoutFormGroup.controls['phone'].value,
                 city: data?.city || this.checkoutFormGroup.controls['city'].value,
                 country: data?.country || this.checkoutFormGroup.controls['country'].value,
                 zip: data?.zip || this.checkoutFormGroup.controls['zip'].value,
                 apartment: data?.apartment || this.checkoutFormGroup.controls['apartment'].value,
                 street: data?.street || this.checkoutFormGroup.controls['street'].value,
                 shippingAddress1: this.checkoutFormGroup.controls['shippingAddress1'].value,
                 shippingAddress2: this.checkoutFormGroup.controls['shippingAddress2'].value}


        const prevFormString = JSON.stringify(prevForm)
        localStorage.setItem('form', prevFormString);

             },
              error:(error)=> {
                // this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get User Info` });

              }
            })
            }
        })


    }

    getPrevForm (){
      const prevForm = localStorage.getItem('form');
      const prevFormParsed = JSON.parse(prevForm);
      this.checkoutFormGroup.controls['name'].setValue(prevFormParsed.name),
      this.checkoutFormGroup.controls['email'].setValue(prevFormParsed.email),
      this.checkoutFormGroup.controls['phone'].setValue(prevFormParsed.phone),
      this.checkoutFormGroup.controls['city'].setValue(prevFormParsed.city),
      this.checkoutFormGroup.controls['country'].setValue(prevFormParsed.country),
      this.checkoutFormGroup.controls['zip'].setValue(prevFormParsed.zip),
      this.checkoutFormGroup.controls['apartment'].setValue(prevFormParsed.apartment),
      this.checkoutFormGroup.controls['street'].setValue(prevFormParsed.street),
      this.checkoutFormGroup.controls['shippingAddress1'].setValue(prevFormParsed.shippingAddress1),
      this.checkoutFormGroup.controls['shippingAddress2'].setValue(prevFormParsed.shippingAddress2)
      // localStorage.removeItem('form');
    }



}
