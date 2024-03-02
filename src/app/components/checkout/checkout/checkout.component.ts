import { LoginService } from './../../../services/login/login.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Cart } from 'src/app/interfaces/cart';
import { OrderItem } from 'src/app/interfaces/order';
import { CartService } from 'src/app/services/cart/cart.service';
import { OrdersService } from 'src/app/services/order/order.service';
import { UsersService } from 'src/app/services/user/user.service';
import * as countriesList from 'i18n-iso-countries'
import { BehaviorSubject, filter, timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/interfaces/user';
import { Product } from './../../../interfaces/product';
import { ProductsServiceService } from './../../../services/product/product.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ApiNinjaService } from './../../../services/api-ninja.service';

declare function require(name: string);


export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phoneNumberPattern = /^[0-9 ]{11}$/; // Matches 12 digits or spaces
    const isValid = phoneNumberPattern.test(control.value);
    return isValid ? null : { invalidPhoneNumber: true };
  };
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {


  constructor(private router: Router,
    private usersService: UsersService,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private ordersService: OrdersService,
    private LoginService: LoginService,
    private MessageService: MessageService,
    private ProductsServiceService: ProductsServiceService,
    private ApiNinjaService: ApiNinjaService,
    private stripe: StripeService) {
  }


  checkoutFormGroup: FormGroup;
  isSubmitted = false;
  orderItems: OrderItem[] = [];
  userId = '64004a943ec39500352b79ea';
  countries = [];
  countryName: string;
  userCountry: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  error
  api = environment.apiUrl;
  cart: Cart
  user: User;
  singleProduct: Product
  cities


  ngOnInit(): void {

    this._getUser();
    this.getCountries();
    this._initCheckoutForm();
    this._getCartItems();

    this.checkoutFormGroup.get('country').valueChanges.subscribe(val => {
      console.log(`Name has been changed to: ${val}`);
      this.getCities(val);
    });

  }

  private getCities(val){
    countriesList.registerLocale(require("i18n-iso-countries/langs/en.json"));
    // this.countryName = this.checkoutFormGroup.controls['country'].value;

const  isoCode = countriesList.getAlpha2Code(val, "en");
console.log(isoCode)
this.ApiNinjaService.getCitiesByCountry(isoCode).subscribe((data: any) => {
  console.log(data)
  this.cities = data
});

console.log(this.cities)

  }

  private _getUser() {
    this.LoginService.$id.subscribe(id => {
      if (id) {
        this.usersService.getUserById(id).subscribe({
          next: (data) => {
            this.user = data;
            this.getPrevForm();


          }
        })
      }
    })
  }
  private _initCheckoutForm() {

    console.log('form')
    this.checkoutFormGroup = this.formBuilder.group({
      name: [this.user?.name, Validators.required],
      email: [this.user?.email, [Validators.email, Validators.required]],
      phone: [this.user?.phone,[ Validators.required , phoneNumberValidator()]],
      city: [this.user?.city, Validators.required],
      country: [this.user?.country, Validators.required],
      zip: [this.user?.zip, Validators.required],
      apartment: [this.user?.apartment, Validators.required],
      street: [this.user?.street, Validators.required],
      shippingAddress1: ['', Validators.required],
      shippingAddress2: ['', Validators.required],

    });


  }

  private _getCartItems() {
    const cart: Cart = this.cartService.getCart();
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

    if (this.checkoutFormGroup.invalid) {
      this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Please enter all the info` });

    } else {


      if (!this.LoginService.getToken()) {


        const prevForm = {
          name: this.checkoutFormGroup.controls['name'].value,
          email: this.checkoutFormGroup.controls['email'].value,
          phone: this.checkoutFormGroup.controls['phone'].value,
          city: this.checkoutFormGroup.controls['city'].value,
          country: this.checkoutFormGroup.controls['country'].value,
          zip: this.checkoutFormGroup.controls['zip'].value,
          apartment: this.checkoutFormGroup.controls['apartment'].value,
          street: this.checkoutFormGroup.controls['street'].value,
          shippingAddress1: this.checkoutFormGroup.controls['shippingAddress1'].value,
          shippingAddress2: this.checkoutFormGroup.controls['shippingAddress2'].value
        }


        const prevFormString = JSON.stringify(prevForm)
        localStorage.setItem('previousForm', prevFormString);

        this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `You Must Log in To Continue` });
        timer(1600).subscribe(() => {
          this.router.navigate(['/login'])
        })

      } else {
        this.setPrevForm();
        this.ordersService.createCheckoutSession(this.orderItems).subscribe({
          error: (err) => {
            this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Something Went Wrong During Payment` });
          }
        })
      }
    }
  }


  private getCountries() {
    countriesList.registerLocale(require("i18n-iso-countries/langs/en.json"));
    this.countries = Object.entries(countriesList.getNames("en", { select: "official" })).map(country => {
      return {
        id: country[0],
        name: country[1]
      }
    });


console.log(this.countries)

  }


  setPrevForm() {
    const prevForm = {
      name: this.checkoutFormGroup.controls['name'].value,
      orderItems: this.orderItems,
      email: this.checkoutFormGroup.controls['email'].value,
      phone: this.checkoutFormGroup.controls['phone'].value,
      city: this.checkoutFormGroup.controls['city'].value,
      country: this.checkoutFormGroup.controls['country'].value,
      zip: this.checkoutFormGroup.controls['zip'].value,
      apartment: this.checkoutFormGroup.controls['apartment'].value,
      street: this.checkoutFormGroup.controls['street'].value,
      shippingAddress1: this.checkoutFormGroup.controls['shippingAddress1'].value,
      shippingAddress2: this.checkoutFormGroup.controls['shippingAddress2'].value
    }
    const prevFormString = JSON.stringify(prevForm)
    localStorage.setItem('form', prevFormString);
  }

  getPrevForm() {
    let prevForm;
    let prevFormParsed
    if (localStorage.getItem('previousForm')) {
      prevForm = localStorage.getItem('previousForm');
      prevFormParsed = JSON.parse(prevForm);

    }
    else {
      prevFormParsed = this.user;
    }
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
  }

}
