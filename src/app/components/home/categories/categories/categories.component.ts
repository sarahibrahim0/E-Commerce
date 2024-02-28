import { CategoriesService } from 'src/app/services/category/category.service';
import { Category } from './../../../../interfaces/category';
import { Component, NgModule, OnInit, OnDestroy } from '@angular/core';
import{ takeUntil, Subject }from 'rxjs'
import { ProductsServiceService } from 'src/app/services/product/product.service';
import { Product } from 'src/app/interfaces/product';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  categories: Category[] = [];
  error: string = '';
  products : Product[]
  endSub$ : Subject<any> = new Subject();
  min


  constructor(private CategoryService: CategoriesService, private productService: ProductsServiceService){}

  ngOnInit(){
    this.getCategories();
    this.getProducts()
  }

  private getProducts ( ){
    this.productService.getProducts().subscribe({
      next:(data) => {this.products = data

        console.log(this.products)

      },
      error: (error)=>{
        console.log(error)
      },


    })
  }

  private getCategories()
  {
    this.CategoryService.getCategories().pipe(takeUntil(this.endSub$)).subscribe({
      next:(data) =>{
        console.log(data)

      this.categories = data;
      },
      error:(error)=>{
        this.error = error;
      }
    })
  }



  getValues(event){

    let query = {};
    let category
    let color
    let min
    let max
    if(event.category){
      category = event.category
      console.log(category);
    }
    if(event.minPrice){
      min =event.minPrice
      console.log(min);


    }

    if(event.maxPrice){
      max =event.maxPrice
      console.log(max);


    }
    if(event.color){
      color= event.color
      console.log(color);

    }

    this.productService.filterProducts(min, max, category?.id, color).subscribe({

      next : (data)=>{
        this.products= data;
        console.log(data)
      }
    })

  }




  ngOnDestroy(){
    this.endSub$.next(0);
    this.endSub$.complete()
  }


  // getRange(range : number[]){

  //   this.filterPriceRange(range[0] , range[1]);

  // }


  // getType (id: string){

  //   this.filterCategory(id);

  // }



clear(event){
  if(event)
{this.getProducts();
}}

}
