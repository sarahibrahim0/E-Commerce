import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private MessageService: MessageService){}

showToast(){
this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Added To Cart'})
}
}
