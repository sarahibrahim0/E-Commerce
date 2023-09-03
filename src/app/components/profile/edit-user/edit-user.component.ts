import { LoginService } from 'src/app/services/login/login.service';
import { MessageService } from 'primeng/api';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/user/user.service';
import { Router } from '@angular/router';
import { OrderItem } from 'src/app/interfaces/order';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';

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

  }

  private _initCheckoutForm() {
    this.checkoutFormGroup = this.formBuilder.group({
      name: [this.user?.name, ],
      email: [this.user?.email],
      password:[this.user?.password],
      phone: [this.user?.phone],
      city: [this.user?.city ],
      country: [this.user?.country, ],
      zip: [this.user?.zip ],
      apartment: [this.user?.apartment],
      street: [this.user?.street ],
      isAdmin:[this.user?.isAdmin]


    });
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
      password:this.checkoutFormGroup.get("password").value,
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
