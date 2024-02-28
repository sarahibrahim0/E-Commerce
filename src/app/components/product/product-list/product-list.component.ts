import { CategoriesService } from './../../../services/category/category.service';
import { Product } from './../../../interfaces/product';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Category } from 'src/app/interfaces/category';
import { ProductsServiceService } from 'src/app/services/product/product.service';
import { ActivatedRoute, Route, Router } from '@angular/router'
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  p: number = 1;
products: Product[] = [];
categories: Category[] = [];
endSub$ : Subject<any> = new Subject();
activeButton: number;
inputId
checked: string[] = [];
id: string = "64a58ffcb2120d003b2a90ce";

  constructor(
  private productService: ProductsServiceService,
  private CategoriesService: CategoriesService,
  private ActivatedRoute : ActivatedRoute,
  private Router: Router,
  private MessageService: MessageService
  ){



  }
  ngOnInit(){

    this.CategoriesService.getCategories().subscribe({
      next:(categories) =>{
        this.categories = categories;

      },
      error: (error)=>{
        console.log(error);
      }
    })

this.getProductss(this.id, 0)

// this.ActivatedRoute.params.subscribe(params=>{
//   if(params['id']) {
//    this.getProducts([params['id']]);
//    console.log('finish')
//   }else {
//    this.getProducts();
//  }
//  this.getCategories()

//    }
  //  )
  }


  // private getProducts(id? : string[]){
  //   this.productService.getProducts(id).subscribe({
  //     next : (data)=>{this.products = data
  //     console.log(data)},
  //     error:(err)=>console.log('Error getting products:', err),
  //   })
  // }
  private getCategories(){
    this.CategoriesService.getCategories().pipe(takeUntil(this.endSub$)).subscribe({
      next : (data)=>{this.categories = data},
      error:(err)=>console.log('Error getting categories:', err),
    })
  }

  selectCategory(){
    console.log(this.checked)
    this.productService.getProducts(this.checked).pipe(takeUntil(this.endSub$)).subscribe({
      next : (data)=>{this.products = data},
      error:(err)=>console.log('Error getting categories:', err),

  })

  }

  ngOnDestroy(){
    this.endSub$.next(0);
    this.endSub$.complete();
  }

  showToast(){
    this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Added To Cart' })
}

getProductss(id: string , index: number)
{

  this.activeButton = index;
  this.id = id;
  this.productService.getSingleCategoryproducts(this.id).subscribe({
  next : (products)=>{
    this.products =  products

  },
  error:(e)=>console.log(e)
 })


}

}
