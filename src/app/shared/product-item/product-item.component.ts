import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { RegionStore } from '../../core/stores/region.store';
import { effectivePrice } from '../../core/utils/price';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss',
})
export class ProductItemComponent {
  @Input() product!: Product;

  private region = inject(RegionStore);

  price(): string {
    return this.region.format(effectivePrice(this.product));
  }

  oldPriceRaw(): number {
    return this.product.salePrice > 0 && this.product.salePrice < this.product.price ? this.product.price : 0;
  }

  oldPrice(): string {
    return this.oldPriceRaw() > 0 ? this.region.format(this.product.price) : '';
  }

  discountPercent(): number {
    const oldPrice = this.oldPriceRaw();
    return oldPrice > 0 ? Math.round(((oldPrice - effectivePrice(this.product)) / oldPrice) * 100) : 0;
  }
}
