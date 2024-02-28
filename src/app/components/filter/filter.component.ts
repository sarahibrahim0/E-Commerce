import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChange, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Category } from 'src/app/interfaces/category';
import { Product } from 'src/app/interfaces/product';
import { ProductsServiceService } from 'src/app/services/product/product.service';
import { ColorPickerModule } from 'primeng/colorpicker';




@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [ FormsModule, CommonModule, BrowserModule, ColorPickerModule
],


  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {



constructor(private productService : ProductsServiceService ){}

  @Input('categories') categories : Category[];

  @Input('range') range : string = 'Range';

  @Input('type') Type : string = 'Type';
  @Input('color') color : string = 'Color';



  // @Output('priceRangeEmitter')  priceRangeEmitter = new EventEmitter<number[]>();


  // @Output('type')  type = new EventEmitter<string>();
  // @Output('colorFilter')  colorFilter = new EventEmitter<string>();

  @Output('filter')  filter = new EventEmitter<{}>();
  @Output('clear')  clear = new EventEmitter<boolean>();





  toggle :boolean = false
  toggle0 :boolean = false
  toggleColor : boolean = false
  Products: Product[]



  selected : Category

  priceRange =
   { '100$ to 200$' : {min: 100 , max : 200},
    '200$ to 300$' : {min: 200 , max : 300},
    '300$ to 400$' : {min: 300 , max : 400},
    '400$ to 500$' : {min: 400 , max : 500},
    '500$ to 600$' : {min: 500 , max : 600},
    '600$ to 700$' : {min: 600 , max : 700}}


    getObjectKeys(obj: any): string[] {
      return Object.keys(obj);
    }


  toggleIcon(type){

switch(type){

  case('price'):
  this.toggle0 = !this.toggle0;
  break;
  case('category'):
  this.toggle = !this.toggle;
  break;
  case('color'):
  this.toggleColor = !this.toggleColor;
  break;

  default:
  console.log("Error in switch")

}


}


setType0(range : string){
  this.range = range;
  // this.priceRangeEmitter.emit([this.priceRange[range].min, this.priceRange[range].max]);
  // this.minRange.emit(this.priceRange[range].min)
}

setColor(color){
  this.color = color;
  console.log(this.color)
  // this.colorFilter.emit(this.color);
}

clearFilter(){

  this.range = "Range";
  this.Type = "Type";
  this.color = "Color";
  this.selected = null;
  this.getProducts();
  this.clear.emit(true);

}

  setType(category){
    this.Type  = category.name;
    this.selected = category
    // this.type.emit(category.id)

  }

  ngOnInit(){
    this.getProducts()

  }

  private getProducts ( ){
    this.productService.getProducts().subscribe({
      next:(data) => {

        let productsFiltered = data.filter(product=> product.color !== undefined)
        this.Products =  [...new Set(productsFiltered)];




      },
      error: (error)=>{
        console.log(error)
      },


    })
  }


  onFilter(){
    let query : {category: Category , color: string , minPrice: number , maxPrice: number}
    this.clear.emit(false)
    let color
    let category
    if(this.color !== "Color" && this.color !== undefined){
      color = this.color
    }

    if(this.selected){
      category = this.selected
    }

    let minPrice
    let maxPrice
    if(this.priceRange[this.range]){
      minPrice = this.priceRange[this.range]?.min
      maxPrice = this.priceRange[this.range]?.max

    }

    // if(this.priceRange[this.range] !== undefined ){
    //   query.minPrice = this.priceRange[this.range].min;

    //   query.maxPrice = this.priceRange[this.range].max;



    // }
    // if(this.color !== undefined  || "Color"){
    //   query['color']= this.color
    // }

    this.filter.emit({minPrice: minPrice, maxPrice: maxPrice , color : color , category: category});

  }


}

