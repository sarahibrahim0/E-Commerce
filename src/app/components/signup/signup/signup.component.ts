import { SignupService } from './../../../services/signup/signup.service';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {



  SignUpForm : FormGroup;
  error : string

  constructor(private formBuilder: FormBuilder,
    private SignupService: SignupService,
    private router: Router,
    private MessageService: MessageService ) { }

  ngOnInit(): void {
    this.initiateForm();
    console.log(this.signUpFormControls)
  }

  private initiateForm(){
    this.SignUpForm = this.formBuilder.group({
      email : ['',[ Validators.required , Validators.email]],
      password: ['', Validators.required],
      firstName : ['',[ Validators.required]],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      isAdmin: [false],
      apartment:[''],
      city:[''],
      zip:[''],
      country:['']
    })

  }

  // apartment: req.body.apartment,
  // city: req.body.city,
  // zip: req.body.zip,
  // country: req.body.country,
  // isAdmin: req.body.isAdmin,
  login(){

const signupForm = {
  "name":this.SignUpForm.controls["firstName"].value + this.SignUpForm.controls["firstName"].value ,
  "phone" : this.SignUpForm.controls["phone"].value,
  "password": this.SignUpForm.controls["password"].value,
  "email":this.SignUpForm.controls["email"].value,
  "isAdmin" : this.SignUpForm.controls["isAdmin"].value,
  "city" : this.SignUpForm.controls["city"].value,
  "zip": this.SignUpForm.controls["zip"].value,
  "apartment": this.SignUpForm.controls["apartment"].value,
  "country":this.SignUpForm.controls["country"].value
}

this.SignupService.signUp(signupForm).subscribe(

  {next:(user)=>
        {
        // this.loginService.setToken(user.token);
        this.MessageService.add({ severity: 'success', summary: 'Success', detail: `You Are Signed Up` });

        timer(1600).subscribe(() => {
          this.router.navigate(['/'])
        })


      },
      error:(error)=>{

        this.error = `Sorry, Couldn't Sign Up`
        this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Sign Up` });



   }})

   }


  clear(){
    this.error = null;
  }

  get signUpFormControls ()
  {
   return this.SignUpForm.controls
  }

}




