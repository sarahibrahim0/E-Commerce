import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.component.html',
  styleUrls: ['./product-gallery.component.scss']
})
export class ProductGalleryComponent {

  selectedImage : string;
  @Input() images : string[]

  ngOnInit(){

     this.images? this.selectedImage =this.images[0] : null;
  }

  changeSelectedImage(image: string){
  this.selectedImage = image;
  }

  get imagesLength(){
return this.images?.length > 0;
  }

}
