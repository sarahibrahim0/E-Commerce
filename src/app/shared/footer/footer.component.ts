import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ContentService } from '../../core/services/content.service';
import { SettingsService } from '../../core/services/settings.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Category, ContactInfo, PageContent, SiteSettings } from '../../core/models';
import { appLocale } from '../../core/utils/locale';

interface FooterLink {
  label: string;
  href: string;
  queryParams?: Record<string, string>;
}

interface FooterSection {
  heading: string;
  body?: string;
  links?: FooterLink[];
}

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
  ],
  contact: {
    email: 'support@shopstore.com',
    phone: '+1 (555) 123-4567',
    address: $localize`:@@footer.defaultAddress:123 Commerce Street, New York, NY 10001`,
    workingHours: $localize`:@@footer.defaultHours:Sat - Thu: 9:00 AM - 9:00 PM`,
    social: { facebook: 'https://facebook.com/example', instagram: 'https://instagram.com/example' },
  },
};

const CATEGORIES_HEADING = $localize`:@@footer.categoriesHeading:Categories`;

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  protected readonly content = signal<PageContent | null>(null);
  protected readonly settings = signal<SiteSettings | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly currentYear = new Date().getFullYear();

  private api = inject(ContentService);
  private settingsApi = inject(SettingsService);
  private categoriesApi = inject(CategoriesService);

  protected readonly tagline = computed(() => {
    const settings = this.settings();
    if (settings) {
      const about = appLocale() === 'ar' ? settings.footerAboutAr : settings.footerAboutEn;
      if (about) return about;
    }
    return this.content()?.tagline ?? '';
  });

  // Site settings win over the content page so the admin form drives the footer.
  protected readonly contact = computed<ContactInfo | null>(() => {
    const base = this.content()?.contact;
    const settings = this.settings();
    if (!settings) return base ?? null;

    const social = {
      facebook: settings.footerFacebook || base?.social?.facebook || '',
      instagram: settings.footerInstagram || base?.social?.instagram || '',
      twitter: settings.footerTwitter || base?.social?.twitter || '',
      whatsapp: settings.footerWhatsapp || base?.social?.whatsapp || '',
    };
    const merged: ContactInfo = {
      address: settings.footerAddress || base?.address || '',
      phone: settings.footerPhone || base?.phone || '',
      email: settings.footerEmail || base?.email || '',
      workingHours: settings.businessHours || base?.workingHours || '',
      social,
    };
    const hasContact = merged.address || merged.phone || merged.email || merged.workingHours;
    if (!hasContact && !Object.values(social).some(Boolean)) return base ?? null;
    return merged;
  });

  protected readonly footerSections = computed<FooterSection[]>(() => {
    const sections: FooterSection[] = [...(this.content()?.sections ?? [])];
    const links = this.categoryLinks();
    if (links.length) {
      sections.push({ heading: CATEGORIES_HEADING, links });
    }
    return sections;
  });

  ngOnInit(): void {
    forkJoin({
      page: this.api.getByKeyCached('footer', DEFAULT_FOOTER),
      settings: this.settingsApi.get().pipe(catchError(() => of(null))),
      categories: this.categoriesApi.list().pipe(catchError(() => of([] as Category[]))),
    }).subscribe(({ page, settings, categories }) => {
      this.content.set(page);
      this.settings.set(settings);
      this.categories.set(categories);
      this.loading.set(false);
    });
  }

// Keeps the order chosen in the admin form and hides categories that were later disabled.
private categoryLinks(): FooterLink[] {
    const selected = this.settings()?.footerCategories ?? [];
    if (!selected.length) return [];

    const byId = new Map(this.categories().map((category) => [category.id, category]));
    const links: FooterLink[] = [];
    for (const id of selected) {
      const category = byId.get(id);
      if (!category || category.isActive === false) continue;
      links.push({
        label: category.name,
        href: '/products',
        queryParams: { categories: category.id },
      });
    }
    return links;
  }

  protected isInternal(href: string): boolean {
    return href.startsWith('/');
  }
}
