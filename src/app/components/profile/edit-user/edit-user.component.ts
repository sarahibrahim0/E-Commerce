import { LoginService } from 'src/app/services/login/login.service';
import { MessageService } from 'primeng/api';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/user/user.service';
import { Router } from '@angular/router';
import { OrderItem } from 'src/app/interfaces/order';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as countriesList from 'i18n-iso-countries'

declare function require(name: string);


export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phoneNumberPattern = /^[0-9 ]{11}$/; // Matches 12 digits or spaces
    const isValid = phoneNumberPattern.test(control.value);
    return isValid ? null : { invalidPhoneNumber: true };
  };
}

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {


  constructor(    private router: Router,
    private UsersService: UsersService,
    private formBuilder: FormBuilder,
    private LoginService: LoginService,
    private MessageService: MessageService,
    ){
    }


  checkoutFormGroup: FormGroup;
  isSubmitted = false;
  orderItems: OrderItem [] = [];
  countries = [];
  countryName: string;
  userCountry : BehaviorSubject<any> = new BehaviorSubject<any>(null);
  error
id: string;
user: User


  ngOnInit(): void {
    this.getUser();
    this._initCheckoutForm();
    this.getCountries()
  }

  private _initCheckoutForm() {
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
      isAdmin: ['false'],


    });
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


  get checkoutForm() {
    return this.checkoutFormGroup.controls;
  }


  private getUser(){

    this.LoginService.$id.subscribe(id=>{ this.id = id
    })
    if(this.id){
      console.log(this.id);
      this.UsersService.getUserById(this.id).subscribe({
        next:(data) =>{ this.user = data;

         this._initCheckoutForm();

       },
        error:(error)=> {
          this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Get User Info` });

        }
      })
      }
}


editUserInfo(){


  if(this.checkoutFormGroup.invalid){
    this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Please Enter Correct info`});

  }else{

    let user = {
      name : this.checkoutFormGroup.get("name").value ,
      email : this.checkoutFormGroup.get("email").value,
      // password:this.checkoutFormGroup.get("password").value,
      phone: this.checkoutFormGroup.get("phone").value,
      city: this.checkoutFormGroup.get("city").value,
      country: this.checkoutFormGroup.get("country").value,
      zip: this.checkoutFormGroup.get("zip").value,
      apartment: this.checkoutFormGroup.get("apartment").value,
      street: this.checkoutFormGroup.get("street").value,
      isAdmin: this.checkoutFormGroup.get("isAdmin").value


    }
    this.UsersService.editUser(this.user.id, user).subscribe({
      next: (data)=>{
        this.MessageService.add({ severity: 'success', summary: 'Success', detail: `Profile Has Been Updated` });

      },
      error: (error)=>{
        this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Profile Has Not Been Updated`});

      }

    })
    console.log(this.user.id);
    console.log(user)


  }

}







}
