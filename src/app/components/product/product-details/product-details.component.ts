import { CartService } from './../../../services/cart/cart.service';
import { Product } from './../../../interfaces/product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsServiceService } from 'src/app/services/product/product.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  product: Product;
  endSub$ : Subject<any> = new Subject();
  productQuantity: number = 1;


  constructor(private ProductsServiceService: ProductsServiceService,
     private ActivatedRoute: ActivatedRoute,
     private MessageService: MessageService,
     private CartService: CartService,
     private router: Router){

  }

  ngOnInit(){
    this.ActivatedRoute.params.subscribe((params)=>
     { if(params['id']){
        this.getProductById(params['id']);
      }}
    )
  }
  private getProductById(id: string){
  this.ProductsServiceService.getProductById(id).pipe(takeUntil(this.endSub$)).subscribe({
    next : (data)=>{
      this.product = data;},
    error:(err)=>console.log('Error getting products:', err),
  })
  }


  addToCartAndBuy(){
    this.addToCart();
    this.router.navigate(['/checkout'])
  }

addToCart(){
  this.CartService.setCartItem({
    productId: this.product.id,
    quantity: this.productQuantity
  }, false)
  this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Added To Cart'})
}
  ngOnDestroy(): void {
      this.endSub$.next(0);
      this.endSub$.complete()

  }
}
