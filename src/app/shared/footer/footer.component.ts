import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { PageContent } from '../../core/models';

const DEFAULT_FOOTER: PageContent = {
  id: '',
  key: 'footer',
  title: 'ShopStore',
  tagline: $localize`:@@footer.defaultTagline:Transform your living spaces with our premium furniture collection. Quality craftsmanship at affordable prices.`,
  sections: [
    {
      heading: $localize`:@@footer.defaultQuickLinks:Quick Links`,
      links: [
        { label: $localize`:@@footer.defaultAbout:About Us`, href: '/about' },
        { label: $localize`:@@footer.defaultContact:Contact Us`, href: '/contact' },
        { label: $localize`:@@footer.defaultShopAll:Shop All`, href: '/products' },
        { label: $localize`:@@footer.defaultCategoriesLink:Categories`, href: '/categories' },
      ],
    },
    {
      heading: $localize`:@@footer.defaultCategories:Categories`,
      links: [
        { label: $localize`:@@footer.defaultLivingRoom:Living Room`, href: '/products' },
        { label: $localize`:@@footer.defaultBedroom:Bedroom`, href: '/products' },
        { label: $localize`:@@footer.defaultDiningRoom:Dining Room`, href: '/products' },
      ],
    },
  ],
  contact: {
    email: 'support@shopstore.com',
    phone: '+1 (555) 123-4567',
    address: $localize`:@@footer.defaultAddress:123 Commerce Street, New York, NY 10001`,
    workingHours: $localize`:@@footer.defaultHours:Sat - Thu: 9:00 AM - 9:00 PM`,
    social: { facebook: 'https://facebook.com/example', instagram: 'https://instagram.com/example' },
  },
};

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  protected readonly content = signal<PageContent | null>(null);
  protected readonly loading = signal(true);
  protected readonly currentYear = new Date().getFullYear();

  private api = inject(ContentService);

  ngOnInit(): void {
    this.api.getByKeyCached('footer', DEFAULT_FOOTER).subscribe({
      next: (page) => {
        this.content.set(page);
        this.loading.set(false);
      },
    });
  }

  protected isInternal(href: string): boolean {
    return href.startsWith('/');
  }
}