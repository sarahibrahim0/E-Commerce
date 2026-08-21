import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  @Input({ required: true }) url = '';

  get pageTitle(): string {
    const path = this.url.split('?')[0];
    if (path.includes('product')) return 'Product Details';
    if (path.includes('order')) return 'Orders';
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'Home';
    return last.charAt(0).toUpperCase() + last.slice(1);
  }
}
