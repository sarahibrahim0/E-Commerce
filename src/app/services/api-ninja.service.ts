import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiNinjaService {

  private apiKey = "wDQCCYl+dVS7n5EXRZsEEQ==Ciih5uJrCKKLcuMt"; // Replace with your actual API key


  constructor(private http : HttpClient) { }

  getCitiesByCountry(countryCode: string) {

  }
}
