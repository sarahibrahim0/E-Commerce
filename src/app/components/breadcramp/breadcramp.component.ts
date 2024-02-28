import { Component, Input } from '@angular/core';
import { Data, Router } from '@angular/router';
import { DataService } from './../../services/dataService/data.service';

@Component({
  selector: 'app-breadcramp',
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
      this.id = id)
  }


}
