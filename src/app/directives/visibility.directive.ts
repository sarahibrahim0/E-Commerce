import { Directive } from '@angular/core';
import {  HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appVisibility]',
  standalone: true
})
export class VisibilityDirective {

  constructor() { }

  @HostBinding('style.visibility') visibility = 'hidden';
  @HostBinding('style.opacity') opacity = '0';

  @HostListener('mouseenter', ['event'])
  onMouseEnter(event){
this.visibility='visible';
this.opacity = '1'
  }

  @HostListener('mouseleave', ['event']) onMouseLeave(event) {
    this.visibility = 'hidden';
    this.opacity = '0'
  }

}
