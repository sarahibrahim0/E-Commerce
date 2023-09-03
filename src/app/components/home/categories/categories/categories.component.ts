import { CategoriesService } from 'src/app/services/category/category.service';
import { Category } from './../../../../interfaces/category';
import { Component, NgModule, OnInit, OnDestroy } from '@angular/core';
import{ takeUntil, Subject }from 'rxjs'
import { ProductsServiceService } from 'src/app/services/product/product.service';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  categories: Category[] = [];
  error: string = '';
  endSub$ : Subject<any> = new Subject();

  constructor(private CategoryService: CategoriesService, private productService: ProductsServiceService){}

  ngOnInit(){
    this.getCategories();
  }

  getCategories()
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

  ngOnDestroy(){
    this.endSub$.next(0);
    this.endSub$.complete()
  }

}
