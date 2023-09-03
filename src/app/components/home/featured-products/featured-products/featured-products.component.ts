import { ProductsServiceService } from './../../../../services/product/product.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';
import { Product } from 'src/app/interfaces/product';

@Component({
  selector: 'app-featured-products',
  templateUrl: './featured-products.component.html',
  styleUrls: ['./featured-products.component.scss']
})

export class FeaturedProductsComponent implements OnInit, OnDestroy {

  endSub$ : Subject<any> = new Subject();
  error !: string;
  @Output() addProductToCart = new EventEmitter();

  constructor(private ProductsServiceService: ProductsServiceService){}

  products: Product[] = [];

  ngOnInit(){
    this.getFeaturedProducts();
  }

  addToCart(){
  this.addProductToCart.emit()
  }
  private getFeaturedProducts(){
    this.ProductsServiceService.getFeaturedProducts(4).pipe(takeUntil(this.endSub$)).subscribe({
      next:(data) =>{
        this.products = data;
        console.log(data)
      },
      error:(error)=>{
        this.error = error;
      }
    })
  }

  ngOnDestroy(): void {
      this.endSub$.next(0);
      this.endSub$.complete();
  }

}
