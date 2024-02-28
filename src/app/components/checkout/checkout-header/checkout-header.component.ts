import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout-header',
  standalone: true,
  imports: [BrowserModule , RouterModule],
  templateUrl: './checkout-header.component.html',
  styleUrl: './checkout-header.component.scss'
})
export class CheckoutHeaderComponent {

}
