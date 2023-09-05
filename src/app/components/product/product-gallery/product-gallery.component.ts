import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.component.html',
  styleUrls: ['./product-gallery.component.scss']
})
export class ProductGalleryComponent implements OnChanges {

  selectedImage : string;
  @Input() images : string[]

  ngOnInit(){

    //  this.images? this.selectedImage =this.images[0] : null;
    //  console.log(this.images)
  }

  ngOnChanges(){
     this.images? this.selectedImage =this.images[0] : null;

  }

  changeSelectedImage(image: string){
  this.selectedImage = image;
  }

  get imagesLength(){
return this.images?.length > 0;
  }

}
