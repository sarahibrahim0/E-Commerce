import { Observable } from 'rxjs';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsServiceService {

  constructor(private http: HttpClient) { }

  api = `${environment.apiUrl}products`

  postProduct(product : FormData) : Observable<Product> {
    return this.http.post<Product>(`${this.api}`, product);
  }

  getProducts(selectedCategories?: string[]): Observable<Product[]> {
    let params = new HttpParams()
    if (selectedCategories) {
      params = params.append('categories', selectedCategories.join(','))
  }
  return this.http.get<Product[]>(`${this.api}`,{ params} );
    }
    getSingleCategoryproducts(id?: string): Observable<Product[]> {
      let params = new HttpParams()
      if (id) {
      params = params.append('categories', id)
      }

      return this.http.get<Product[]>('http://localhost:3000/api/v1/products', { params: params });
    }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.api}/${id}`);
  }

  editProduct(id: string , product: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product);
  }

  getFeaturedProducts(count: number) : Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/get/featured/${count}`);
  }
}
