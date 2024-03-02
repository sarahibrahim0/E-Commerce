import { Component, Input } from '@angular/core';
import { Data, Router, RouterModule } from '@angular/router';
import { DataService } from './../../services/dataService/data.service';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-breadcramp',
  standalone:true,
  imports:[BrowserModule, RouterModule],

  templateUrl: './breadcramp.component.html',
  styleUrl: './breadcramp.component.scss'
})
export class BreadcrampComponent {
  constructor( private DataService: DataService){}

  page:string  = '';
  @Input('url') url : string
  id: string

  ngOnInit(){
    this.DataService.currentParams.subscribe(id=>
    {  console.log(id)
      this.id = id})
  }


}
