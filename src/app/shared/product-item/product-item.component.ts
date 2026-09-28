import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../core/models';
import { effectivePrice } from '../../core/utils/price';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss',
})
export class ProductItemComponent {
  @Input() product!: Product;

  price(): number {
    return effectivePrice(this.product);
  }

  oldPrice(): number {
    return this.product.salePrice > 0 && this.product.salePrice < this.product.price ? this.product.price : 0;
  }

  discountPercent(): number {
    const oldPrice = this.oldPrice();
    return oldPrice > 0 ? Math.round(((oldPrice - effectivePrice(this.product)) / oldPrice) * 100) : 0;
  }
}
