import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiNinjaService {
  private apiUrl = 'https://api.api-ninjas.com/v1/city';

  private apiKey = "wDQCCYl+dVS7n5EXRZsEEQ==Ciih5uJrCKKLcuMt"; // Replace with your actual API key


  constructor(private http : HttpClient) { }

  getCitiesByCountry(countryCode: string) {
    const url = `${this.apiUrl}?country=${countryCode}&limit=1000`; // Adjust limit as needed
    return this.http.get(url, { headers: { 'X-Api-Key': this.apiKey } });
  }
}
