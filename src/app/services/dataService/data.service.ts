import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }


  private paramsSource = new BehaviorSubject<string>(null);
  currentParams = this.paramsSource.asObservable();




  changeParams(params: string) {
    this.paramsSource.next(params);
  }
}
