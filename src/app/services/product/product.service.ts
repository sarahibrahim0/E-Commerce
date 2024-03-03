import { Observable, max } from 'rxjs';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product } from '../../interfaces/product';
import { Category } from 'src/app/interfaces/category';

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

      // dashboard-pnlv.onrender.com

      return this.http.get<Product[]>('https://dashboard-pnlv.onrender.com/api/v1/products', { params: params });
    }


    filterProducts(minPrice?: number, maxPrice? : number, categoryId? : string, color?: string): Observable<Product[]> {
      let params = new HttpParams()


      // }
      if(categoryId){
        params = params.append('categories', categoryId )


      }

           if (minPrice) {
            params = params.append('minPrice', minPrice )

      }

      if(maxPrice){
        params = params.append('maxPrice', maxPrice )
      }

      if(color){
        params = params.append('color', color )

      }


console.log(params)

      //

      return this.http.get<Product[]>('https://dashboard-pnlv.onrender.com/api/v1/products', { params: params });
    }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.api}/${id}`);
  }

  editProduct(id: string , product: FormData | any): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product);
  }

  getFeaturedProducts(count: number) : Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/get/featured/${count}`);
  }
}
