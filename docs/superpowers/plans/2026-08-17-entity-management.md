# Entity Management — Admin Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** CRUD list/detail/form pages for all 8 entities (Products, Categories, Orders, Coupons, Users, Reviews, Content, Roles) with table features (sorting, filtering, pagination), bulk operations, and permission-based visibility.

**Architecture:** Shared base table component, entity-specific list/detail/form components. PrimeNG DataTable + Dialog for inline editing. Signals for state.

**Repo:** `D:\admin-dashboard-v2`

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/app/shared/table/base-table.component.ts` | Reusable data table wrapper |
| Create | `src/app/shared/table/table-column.ts` | Column definition interface |
| Create | `src/app/shared/confirm-dialog/confirm-dialog.component.ts` | Reusable confirm dialog |
| Create | `src/app/shared/bulk-actions/bulk-actions.component.ts` | Bulk action bar |
| Create | `src/app/core/services/entity.service.ts` | Base CRUD service |
| Create | `src/app/admin/pages/products/products-list.component.ts` | Products list |
| Create | `src/app/admin/pages/products/product-detail.component.ts` | Product detail |
| Create | `src/app/admin/pages/products/product-form.component.ts` | Product create/edit form |
| Create | `src/app/admin/pages/products/products.routes.ts` | Product routes |
| Create | `src/app/admin/pages/categories/categories-list.component.ts` | Categories list |
| Create | `src/app/admin/pages/categories/category-form.component.ts` | Category form |
| Create | `src/app/admin/pages/categories/categories.routes.ts` | Category routes |
| Create | `src/app/admin/pages/orders/orders-list.component.ts` | Orders list |
| Create | `src/app/admin/pages/orders/order-detail.component.ts` | Order detail |
| Create | `src/app/admin/pages/orders/orders.routes.ts` | Order routes |
| Create | `src/app/admin/pages/coupons/coupons-list.component.ts` | Coupons list |
| Create | `src/app/admin/pages/coupons/coupon-form.component.ts` | Coupon form |
| Create | `src/app/admin/pages/coupons/coupons.routes.ts` | Coupon routes |
| Create | `src/app/admin/pages/users/users-list.component.ts` | Users list |
| Create | `src/app/admin/pages/users/user-detail.component.ts` | User detail |
| Create | `src/app/admin/pages/users/user-form.component.ts` | User form |
| Create | `src/app/admin/pages/users/users.routes.ts` | User routes |
| Create | `src/app/admin/pages/reviews/reviews-list.component.ts` | Reviews list |
| Create | `src/app/admin/pages/reviews/reviews.routes.ts` | Review routes |
| Create | `src/app/admin/pages/content/content-list.component.ts` | Content list |
| Create | `src/app/admin/pages/content/content-form.component.ts` | Content form |
| Create | `src/app/admin/pages/content/content.routes.ts` | Content routes |
| Create | `src/app/admin/pages/roles/roles-list.component.ts` | Roles list |
| Create | `src/app/admin/pages/roles/role-form.component.ts` | Role form |
| Create | `src/app/admin/pages/roles/roles.routes.ts` | Role routes |
| Modify | `src/app/app.routes.ts` | Add entity routes |

---

## Task 1: Base Table + Services + Shared Components

**Files:**
- Create: `src/app/shared/table/base-table.component.ts`
- Create: `src/app/shared/table/table-column.ts`
- Create: `src/app/shared/confirm-dialog/confirm-dialog.component.ts`
- Create: `src/app/shared/bulk-actions/bulk-actions.component.ts`
- Create: `src/app/core/services/entity.service.ts`

- [ ] **Step 1: Create table column interface**

`src/app/shared/table/table-column.ts`:
```typescript
export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterOptions?: { label: string; value: any }[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => string;
}
```

- [ ] **Step 2: Create base table component**

`src/app/shared/table/base-table.component.ts`:
```typescript
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn } from './table-column';

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div class="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event); searchChange.emit($event)"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500" />
          @if (selectedIds().length > 0) {
            <span class="text-sm text-slate-500">{{ selectedIds().length }} selected</span>
          }
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              @if (selectable) {
                <th class="w-10 px-4 py-3">
                  <input type="checkbox" (change)="toggleAll($event)" />
                </th>
              }
              @for (col of columns; track col.field) {
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  [style.width]="col.width"
                  [class.cursor-pointer]="col.sortable"
                  (click)="col.sortable && toggleSort(col.field)">
                  <div class="flex items-center gap-1">
                    {{ col.header }}
                    @if (col.sortable && sortField() === col.field) {
                      <span>{{ sortDir() === 'asc' ? '▲' : '▼' }}</span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track row.id) {
              <tr
                class="border-b border-slate-100 hover:bg-slate-50"
                [class.bg-indigo-50]="selectedIds().includes(row.id)">
                @if (selectable) {
                  <td class="px-4 py-3">
                    <input
                      type="checkbox"
                      [checked]="selectedIds().includes(row.id)"
                      (change)="toggleSelect(row.id)" />
                  </td>
                }
                @for (col of columns; track col.field) {
                  <td class="px-4 py-3 text-sm text-slate-700" [class.text-center]="col.align === 'center'" [class.text-right]="col.align === 'right'">
                    @if (col.format) {
                      {{ col.format(row[col.field], row) }}
                    } @else {
                      {{ row[col.field] }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns.length + (selectable ? 1 : 0)" class="px-4 py-8 text-center text-sm text-slate-500">
                  No data found
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <span class="text-sm text-slate-500">
          Showing {{ (currentPage() - 1) * pageSize() + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }}
        </span>
        <div class="flex items-center gap-1">
          <button
            (click)="currentPage.set(currentPage() - 1); pageChange.emit(currentPage())"
            [disabled]="currentPage() <= 1"
            class="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">
            Previous
          </button>
          @for (p of visiblePages(); track p) {
            <button
              (click)="currentPage.set(p); pageChange.emit(p)"
              [class.bg-indigo-600]="p === currentPage()"
              [class.text-white]="p === currentPage()"
              class="rounded px-3 py-1 text-sm hover:bg-slate-100">
              {{ p }}
            </button>
          }
          <button
            (click)="currentPage.set(currentPage() + 1); pageChange.emit(currentPage())"
            [disabled]="currentPage() >= totalPages()"
            class="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BaseTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data = signal<any[]>([]);
  @Input() totalCount = signal(0);
  @Input() selectable = false;
  @Input() pageSize = signal(10);

  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ field: string; dir: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() rowClick = new EventEmitter<any>();

  searchQuery = signal('');
  sortField = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  selectedIds = signal<string[]>([]);

  protected readonly Math = Math;

  get totalPages(): () => number {
    return () => Math.ceil(this.totalCount() / this.pageSize());
  }

  get visiblePages(): () => number[] {
    return () => {
      const total = this.totalPages();
      const current = this.currentPage();
      const pages: number[] = [];
      const start = Math.max(1, current - 2);
      const end = Math.min(total, current + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    };
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ field: this.sortField(), dir: this.sortDir() });
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
    this.selectionChange.emit(this.selectedIds());
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? this.data().map((r) => r.id) : []);
    this.selectionChange.emit(this.selectedIds());
  }

  clearSelection(): void {
    this.selectedIds.set([]);
    this.selectionChange.emit([]);
  }
}
```

- [ ] **Step 3: Create confirm dialog**

`src/app/shared/confirm-dialog/confirm-dialog.component.ts`:
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              (click)="cancel.emit()"
              class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              (click)="confirm.emit()"
              class="rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
```

- [ ] **Step 4: Create bulk actions bar**

`src/app/shared/bulk-actions/bulk-actions.component.ts`:
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BulkAction {
  label: string;
  icon: string;
  action: string;
  confirmMessage?: string;
}

@Component({
  selector: 'app-bulk-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (selectedCount > 0) {
      <div class="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2">
        <span class="text-sm font-medium text-indigo-700">{{ selectedCount }} selected</span>
        @for (action of actions; track action.action) {
          <button
            (click)="actionClick.emit(action)"
            class="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <i [class]="action.icon + ' mr-1'"></i>{{ action.label }}
          </button>
        }
        <button
          (click)="clearSelection.emit()"
          class="ml-auto text-xs text-indigo-600 hover:text-indigo-800">
          Clear
        </button>
      </div>
    }
  `,
})
export class BulkActionsComponent {
  @Input() selectedCount = 0;
  @Input() actions: BulkAction[] = [];
  @Output() actionClick = new EventEmitter<BulkAction>();
  @Output() clearSelection = new EventEmitter<void>();
}
```

- [ ] **Step 5: Create entity service (base CRUD)**

`src/app/core/services/entity.service.ts`:
```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class EntityService {
  private http = inject(HttpClient);

  list<T>(endpoint: string, params?: Record<string, string>): Observable<T[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) httpParams = httpParams.set(key, value);
      });
    }
    return this.http.get<T[]>(`${environment.apiUrl}${endpoint}`, { params: httpParams });
  }

  get<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}/${id}`);
  }

  create<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${endpoint}`, body);
  }

  update<T>(endpoint: string, id: string, body: any): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${endpoint}/${id}`, body);
  }

  delete(endpoint: string, id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}${endpoint}/${id}`);
  }

  count(endpoint: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}${endpoint}/get/count`);
  }

  bulkDelete(endpoint: string, ids: string[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}${endpoint}/bulk-delete`, { ids });
  }

  bulkUpdate(endpoint: string, ids: string[], update: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}${endpoint}/bulk-update`, { ids, update });
  }
}
```

- [ ] **Step 6: Verify build**

```bash
npx ng build --configuration development
```

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/ src/app/core/services/entity.service.ts
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add base table, confirm dialog, bulk actions, entity service"
```

---

## Task 2: Products Management

**Files:**
- Create: `src/app/admin/pages/products/products-list.component.ts`
- Create: `src/app/admin/pages/products/product-detail.component.ts`
- Create: `src/app/admin/pages/products/product-form.component.ts`
- Create: `src/app/admin/pages/products/products.routes.ts`

- [ ] **Step 1: Create products list**

`src/app/admin/pages/products/products-list.component.ts`:
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

interface Product {
  id: string;
  name: string;
  price: number;
  category: { id: string; name: string } | string;
  countInStock: number;
  isFeatured: boolean;
  rating: number;
}

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Products</h2>
        <a routerLink="new" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Add Product
        </a>
      </div>

      <app-bulk-actions
        [selectedCount]="selectedIds().length"
        [actions]="bulkActions"
        (actionClick)="handleBulkAction($event)"
        (clearSelection)="table?.clearSelection()" />

      <app-base-table
        #table
        [columns]="columns"
        [data]="products"
        [totalCount]="totalCount"
        [selectable]="true"
        (searchChange)="onSearch($event)"
        (sortChange)="onSort($event)"
        (pageChange)="onPage($event)"
        (selectionChange)="selectedIds.set($event)"
        (rowClick)="router.navigate(['/admin/products', $event.id])" />
    </div>

    <app-confirm-dialog
      [open]="showDeleteDialog()"
      title="Delete Product"
      message="Are you sure you want to delete this product?"
      (confirm)="deleteProduct()"
      (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class ProductsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);

  products = signal<Product[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'price', header: 'Price', sortable: true, format: (v) => `$${v?.toFixed(2)}` },
    { field: 'category', header: 'Category', sortable: true, format: (v) => typeof v === 'object' ? v?.name : v || '-' },
    { field: 'countInStock', header: 'Stock', sortable: true },
    { field: 'rating', header: 'Rating', sortable: true, format: (v) => `${v?.toFixed(1)} ★` },
    { field: 'isFeatured', header: 'Featured', sortable: true, format: (v) => v ? 'Yes' : 'No' },
  ];

  bulkActions: BulkAction[] = [
    { label: 'Delete', icon: 'pi pi-trash', action: 'delete', confirmMessage: 'Delete selected products?' },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.entityService.list<Product>('products').subscribe((data) => {
      this.products.set(data);
      this.totalCount.set(data.length);
    });
  }

  onSearch(query: string): void {
    if (query) {
      this.entityService.list<Product>('products', { name: query }).subscribe((data) => {
        this.products.set(data);
        this.totalCount.set(data.length);
      });
    } else {
      this.loadProducts();
    }
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.products()].sort((a, b) => {
      const aVal = a[event.field as keyof Product];
      const bVal = b[event.field as keyof Product];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.products.set(sorted);
  }

  onPage(page: number): void {
    // TODO: server-side pagination
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete') {
      // TODO: bulk delete
    }
  }

  deleteProduct(): void {
    if (this.deleteId) {
      this.entityService.delete('products', this.deleteId).subscribe(() => {
        this.loadProducts();
        this.showDeleteDialog.set(false);
        this.deleteId = null;
      });
    }
  }
}
```

- [ ] **Step 2: Create product form**

`src/app/admin/pages/products/product-form.component.ts`:
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Edit' : 'New' }} Product</h2>

      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name</label>
          <input [(ngModel)]="form.name" name="name" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Description</label>
          <textarea [(ngModel)]="form.description" name="description" rows="3" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Price</label>
            <input [(ngModel)]="form.price" name="price" type="number" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Stock</label>
            <input [(ngModel)]="form.countInStock" name="countInStock" type="number" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Brand</label>
            <input [(ngModel)]="form.brand" name="brand" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Color</label>
            <input [(ngModel)]="form.color" name="color" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Category ID</label>
          <input [(ngModel)]="form.category" name="category" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="form.isFeatured" name="isFeatured" class="rounded" />
            <span class="text-sm font-medium text-slate-700">Featured</span>
          </label>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Image</label>
          <input type="file" (change)="onFileSelect($event)" accept="image/*" class="mt-1 w-full text-sm" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/products'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);

  isEdit = signal(false);
  saving = signal(false);
  productId = '';

  form = {
    name: '',
    description: '',
    price: 0,
    countInStock: 0,
    brand: '',
    color: '',
    category: '',
    isFeatured: false,
  };

  imageFile: File | null = null;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.isEdit.set(true);
      this.entityService.get<any>('products', this.productId).subscribe((p) => {
        this.form = {
          name: p.name || '',
          description: p.description || '',
          price: p.price || 0,
          countInStock: p.countInStock || 0,
          brand: p.brand || '',
          color: p.color || '',
          category: typeof p.category === 'object' ? p.category?.id : p.category || '',
          isFeatured: p.isFeatured || false,
        };
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.imageFile = input.files[0];
  }

  submit(): void {
    this.saving.set(true);
    const formData = new FormData();
    Object.entries(this.form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });
    if (this.imageFile) formData.append('image', this.imageFile);

    const req = this.isEdit()
      ? this.entityService.http.put(`${environment.apiUrl}products/${this.productId}`, formData)
      : this.entityService.http.post(`${environment.apiUrl}products`, formData);

    req.subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: () => this.saving.set(false),
    });
  }
}
```

- [ ] **Step 3: Create product routes**

`src/app/admin/pages/products/products.routes.ts`:
```typescript
import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./products-list.component').then((m) => m.ProductsListComponent) },
  { path: 'new', loadComponent: () => import('./product-form.component').then((m) => m.ProductFormComponent) },
  { path: ':id', loadComponent: () => import('./product-detail.component').then((m) => m.ProductDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./product-form.component').then((m) => m.ProductFormComponent) },
];
```

- [ ] **Step 4: Verify build**

```bash
npx ng build --configuration development
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/pages/products/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add products list, form, and routes"
```

---

## Task 3: Categories Management

**Files:**
- Create: `src/app/admin/pages/categories/categories-list.component.ts`
- Create: `src/app/admin/pages/categories/category-form.component.ts`
- Create: `src/app/admin/pages/categories/categories.routes.ts`

- [ ] **Step 1: Create categories list**

`src/app/admin/pages/categories/categories-list.component.ts`:
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Categories</h2>
        <a routerLink="new" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Add Category
        </a>
      </div>

      <app-base-table
        [columns]="columns"
        [data]="categories"
        [totalCount]="totalCount"
        (sortChange)="onSort($event)"
        (rowClick)="router.navigate(['/admin/categories', $event.id, 'edit'])" />
    </div>

    <app-confirm-dialog
      [open]="showDeleteDialog()"
      title="Delete Category"
      message="Are you sure you want to delete this category?"
      (confirm)="deleteCategory()"
      (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CategoriesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);

  categories = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'icon', header: 'Icon' },
    { field: 'color', header: 'Color', format: (v) => v || '-' },
  ];

  ngOnInit(): void {
    this.entityService.list<any>('categories').subscribe((data) => {
      this.categories.set(data);
      this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.categories()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.categories.set(sorted);
  }

  deleteCategory(): void {
    if (this.deleteId) {
      this.entityService.delete('categories', this.deleteId).subscribe(() => {
        this.entityService.list<any>('categories').subscribe((data) => {
          this.categories.set(data);
          this.totalCount.set(data.length);
        });
        this.showDeleteDialog.set(false);
        this.deleteId = null;
      });
    }
  }
}
```

- [ ] **Step 2: Create category form**

`src/app/admin/pages/categories/category-form.component.ts`:
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Edit' : 'New' }} Category</h2>

      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name</label>
          <input [(ngModel)]="form.name" name="name" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Icon</label>
          <input [(ngModel)]="form.icon" name="icon" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Color</label>
          <input [(ngModel)]="form.color" name="color" type="color" class="mt-1 h-10 w-full rounded-md border border-slate-300" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/categories'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);

  isEdit = signal(false);
  saving = signal(false);
  categoryId = '';

  form = { name: '', icon: '', color: '' };

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    if (this.categoryId) {
      this.isEdit.set(true);
      this.entityService.get<any>('categories', this.categoryId).subscribe((c) => {
        this.form = { name: c.name, icon: c.icon || '', color: c.color || '' };
      });
    }
  }

  submit(): void {
    this.saving.set(true);
    const req = this.isEdit()
      ? this.entityService.update('categories', this.categoryId, this.form)
      : this.entityService.create('categories', this.form);
    req.subscribe({
      next: () => this.router.navigate(['/admin/categories']),
      error: () => this.saving.set(false),
    });
  }
}
```

- [ ] **Step 3: Create category routes**

`src/app/admin/pages/categories/categories.routes.ts`:
```typescript
import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./categories-list.component').then((m) => m.CategoriesListComponent) },
  { path: 'new', loadComponent: () => import('./category-form.component').then((m) => m.CategoryFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./category-form.component').then((m) => m.CategoryFormComponent) },
];
```

- [ ] **Step 4: Verify build**

```bash
npx ng build --configuration development
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/pages/categories/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add categories list, form, and routes"
```

---

## Task 4: Orders Management

**Files:**
- Create: `src/app/admin/pages/orders/orders-list.component.ts`
- Create: `src/app/admin/pages/orders/order-detail.component.ts`
- Create: `src/app/admin/pages/orders/orders.routes.ts`

- [ ] **Step 1: Create orders list with status filter**

`src/app/admin/pages/orders/orders-list.component.ts`:
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [BaseTableComponent, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Orders</h2>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="statusFilter" (ngModelChange)="filterByStatus()" class="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <app-base-table
        [columns]="columns"
        [data]="orders"
        [totalCount]="totalCount"
        (sortChange)="onSort($event)"
        (rowClick)="router.navigate(['/admin/orders', $event.id])" />
    </div>
  `,
})
export class OrdersListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);

  orders = signal<any[]>([]);
  totalCount = signal(0);
  statusFilter = '';

  columns: TableColumn[] = [
    { field: 'id', header: 'Order ID', width: '120px', format: (v) => v?.slice(-8) },
    { field: 'user', header: 'Customer', format: (v) => v?.name || v?.email || '-' },
    { field: 'totalPrice', header: 'Total', sortable: true, format: (v) => `$${v?.toFixed(2)}` },
    { field: 'status', header: 'Status', sortable: true, format: (v) => v },
    { field: 'paymentStatus', header: 'Payment', format: (v) => v },
    { field: 'dateOrdered', header: 'Date', sortable: true, format: (v) => new Date(v).toLocaleDateString() },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.entityService.list<any>('orders').subscribe((data) => {
      this.orders.set(data);
      this.totalCount.set(data.length);
    });
  }

  filterByStatus(): void {
    this.loadOrders();
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.orders()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.orders.set(sorted);
  }
}
```

- [ ] **Step 2: Create order detail**

`src/app/admin/pages/orders/order-detail.component.ts`:
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-4xl space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Order {{ order()?.id?.slice(-8) }}</h2>
        <button (click)="router.navigate(['/admin/orders'])" class="text-sm text-indigo-600 hover:text-indigo-800">← Back to Orders</button>
      </div>

      @if (order()) {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Order Info -->
          <div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="text-lg font-semibold text-slate-900">Order Info</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Status</span>
                <select [(ngModel)]="newStatus" (ngModelChange)="updateStatus()" class="rounded border border-slate-300 px-2 py-1 text-sm">
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="flex justify-between"><span class="text-slate-500">Payment</span><span>{{ order()?.paymentStatus }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Total</span><span class="font-medium">${{ order()?.totalPrice?.toFixed(2) }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Date</span><span>{{ order()?.dateOrdered | date:'medium' }}</span></div>
            </div>
          </div>

          <!-- Shipping -->
          <div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="text-lg font-semibold text-slate-900">Shipping</h3>
            <div class="space-y-2 text-sm">
              <div><span class="text-slate-500">Customer:</span> {{ order()?.user?.name }}</div>
              <div><span class="text-slate-500">Phone:</span> {{ order()?.phone }}</div>
              <div><span class="text-slate-500">Address:</span> {{ order()?.shippingAddress1 }}</div>
              <div><span class="text-slate-500">City:</span> {{ order()?.city }}</div>
              <div><span class="text-slate-500">Country:</span> {{ order()?.country }}</div>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="rounded-lg border border-slate-200 bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold text-slate-900">Items</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th class="pb-2">Product</th>
                <th class="pb-2">Quantity</th>
                <th class="pb-2">Price</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order()?.orderItems || []; track item.id) {
                <tr class="border-b border-slate-100">
                  <td class="py-2">{{ item.product?.name }}</td>
                  <td class="py-2">{{ item.quantity }}</td>
                  <td class="py-2">${{ (item.product?.price * item.quantity)?.toFixed(2) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);

  order = signal<any>(null);
  newStatus = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('orders', id).subscribe((o) => {
      this.order.set(o);
      this.newStatus = o.status;
    });
  }

  updateStatus(): void {
    if (this.newStatus !== this.order()?.status) {
      this.entityService.update('orders', this.order()!.id, { status: this.newStatus }).subscribe((updated) => {
        this.order.set(updated);
      });
    }
  }
}
```

- [ ] **Step 3: Create order routes**

`src/app/admin/pages/orders/orders.routes.ts`:
```typescript
import { Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./orders-list.component').then((m) => m.OrdersListComponent) },
  { path: ':id', loadComponent: () => import('./order-detail.component').then((m) => m.OrderDetailComponent) },
];
```

- [ ] **Step 4: Verify build + commit**

```bash
npx ng build --configuration development
git add src/app/admin/pages/orders/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add orders list, detail, and routes"
```

---

## Task 5: Coupons, Users, Reviews, Content, Roles

> This task creates the remaining 5 entity pages following the same patterns as Tasks 2–4. Each entity gets a list component, form/detail as needed, and routes.

**Files:**
- Create: `src/app/admin/pages/coupons/coupons-list.component.ts`
- Create: `src/app/admin/pages/coupons/coupon-form.component.ts`
- Create: `src/app/admin/pages/coupons/coupons.routes.ts`
- Create: `src/app/admin/pages/users/users-list.component.ts`
- Create: `src/app/admin/pages/users/user-detail.component.ts`
- Create: `src/app/admin/pages/users/user-form.component.ts`
- Create: `src/app/admin/pages/users/users.routes.ts`
- Create: `src/app/admin/pages/reviews/reviews-list.component.ts`
- Create: `src/app/admin/pages/reviews/reviews.routes.ts`
- Create: `src/app/admin/pages/content/content-list.component.ts`
- Create: `src/app/admin/pages/content/content-form.component.ts`
- Create: `src/app/admin/pages/content/content.routes.ts`
- Create: `src/app/admin/pages/roles/roles-list.component.ts`
- Create: `src/app/admin/pages/roles/role-form.component.ts`
- Create: `src/app/admin/pages/roles/roles.routes.ts`

- [ ] **Step 1: Create Coupons** (list + form + routes)
- [ ] **Step 2: Create Users** (list + detail + form + routes)
- [ ] **Step 3: Create Reviews** (list + routes)
- [ ] **Step 4: Create Content** (list + form + routes)
- [ ] **Step 5: Create Roles** (list + form with permissions + routes)
- [ ] **Step 6: Verify build**
- [ ] **Step 7: Commit**

Follow the exact same patterns as Products/Categories/Orders above. Key differences:
- **Coupons:** `code`, `type` (percent/fixed), `value`, `maxUses`, `active`, `validFrom`, `validUntil`
- **Users:** `name`, `email`, `phone`, address fields, `isAdmin`, `role` (select from roles API)
- **Reviews:** Read-only list (no create/edit), shows `user`, `product`, `rating`, `comment`
- **Content:** `key`, `title`, `subtitle`, `sections[]` (dynamic add/remove), `contact` object
- **Roles:** `name`, `permissions[]` (checkboxes from permissions list API), `isDefault`

---

## Task 6: Wire Routes into App + Update Sidebar

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/admin/layout/sidebar.component.ts`

- [ ] **Step 1: Update app.routes.ts**

Add child routes under the admin shell:

```typescript
{
  path: 'admin',
  canActivate: [adminGuard],
  loadComponent: () => import('./admin/layout/admin-shell.component').then((m) => m.AdminShellComponent),
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadComponent: () => import('./admin/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
    { path: 'products', loadChildren: () => import('./admin/pages/products/products.routes').then((m) => m.PRODUCT_ROUTES) },
    { path: 'categories', loadChildren: () => import('./admin/pages/categories/categories.routes').then((m) => m.CATEGORY_ROUTES) },
    { path: 'orders', loadChildren: () => import('./admin/pages/orders/orders.routes').then((m) => m.ORDER_ROUTES) },
    { path: 'coupons', loadChildren: () => import('./admin/pages/coupons/coupons.routes').then((m) => m.COUPON_ROUTES) },
    { path: 'users', loadChildren: () => import('./admin/pages/users/users.routes').then((m) => m.USER_ROUTES) },
    { path: 'reviews', loadChildren: () => import('./admin/pages/reviews/reviews.routes').then((m) => m.REVIEW_ROUTES) },
    { path: 'content', loadChildren: () => import('./admin/pages/content/content.routes').then((m) => m.CONTENT_ROUTES) },
    { path: 'roles', loadChildren: () => import('./admin/pages/roles/roles.routes').then((m) => m.ROLE_ROUTES) },
  ],
},
```

- [ ] **Step 2: Verify all sidebar links work**

- [ ] **Step 3: Verify build**

```bash
npx ng build --configuration development
```

- [ ] **Step 4: Commit**

```bash
git add src/app/app.routes.ts src/app/admin/layout/sidebar.component.ts
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: wire entity routes and update sidebar navigation"
```

---

## Task 7: Full Build Verification

- [ ] **Step 1: Production build**

```bash
npx ng build --configuration production
```

- [ ] **Step 2: Run all tests**

```bash
npx ng test --watch=false
```

- [ ] **Step 3: Verify dev server**

```bash
npx ng serve
```

- [ ] **Step 4: Final commit if needed**

```bash
git add .
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "chore: final entity management verification"
```
