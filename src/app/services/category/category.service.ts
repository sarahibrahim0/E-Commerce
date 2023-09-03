import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../../interfaces/category';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

api = `${environment.apiUrl}categories`

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}`);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.api}/${id}`);
  }

  postCategories(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.api}`, category);
  }

  deleteCategories(id: string): Observable<Category> {
    return this.http.delete<Category>(`${this.api}/${id}`);
  }

  editCategories( id : string , category:Category): Observable<Category> {
    return this.http.put<Category>(`${this.api}/${id}`, category);
  }


}
