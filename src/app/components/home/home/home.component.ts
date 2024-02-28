import { Component, HostBinding, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Category } from 'src/app/interfaces/category';
import { Product } from 'src/app/interfaces/product';
import { CategoriesService } from 'src/app/services/category/category.service';
import { ProductsServiceService } from './../../../services/product/product.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent {
  clicked: boolean = false;
  isVisible1 = false;
  isVisible0 = false;



  constructor(private MessageService: MessageService, private CategoryService : CategoriesService, private ProductsService : ProductsServiceService){}
  show(index){
    if(index === 0){
      this.isVisible0 = true;

    }else if(index === 1){
      this.isVisible1 = true;

    }
  }

  hide(index){
    if(index === 0){
      this.isVisible0 = false;

    }else if(index === 1){
      this.isVisible1 = false;

    }
  }
showToast(){
this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Added To Cart'})
}

categories: Category[];
products: Product[];
activeButton: number;
id: string = "64a58ffcb2120d003b2a90ce";
popular: Product[];
mostLiked: Product[];
las3Three : Product[];


ngOnInit(){
  this.CategoryService.getCategories().subscribe({
    next:(categories) =>{
      this.categories = categories;

    },
    error: (error)=>{
      console.log(error);
    }
  })

  this.getProducts(this.id, 0);
  this.getMostLiked()
}

getProducts(id: string , index: number)
{

  this.activeButton = index;
  this.id = id;
  this.ProductsService.getSingleCategoryproducts(this.id).subscribe({
  next : (products)=>{
    this.products =  products.slice(0,3) ;

  },
  error:(e)=>console.log(e)
 })

 this.getPopularPRoducts();

}


private getPopularPRoducts(){
  this.ProductsService.getSingleCategoryproducts('64a59059b2120d003b2a90d4').subscribe({
    next : (products)=>{
      this.popular =  products ;


    },
    error:(e)=>console.log(e)
   })
}


private getMostLiked(){

  this.ProductsService.getSingleCategoryproducts('64a58ffcb2120d003b2a90ce').subscribe({
    next : (products)=>{
      this.mostLiked =  products ;
      this.las3Three = this.mostLiked.slice(3,6);
      console.log(this.mostLiked)


    },
    error:(e)=>console.log(e)
   })

}
}
