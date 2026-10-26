import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { RegionStore } from '../../core/stores/region.store';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  const countries = [
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', currencyCode: 'EGP' },
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', currencyCode: 'USD' },
  ];

  let auth: {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    register: jasmine.Spy;
  };

  beforeEach(() => {
    auth = {
      loading: signal(false),
      error: signal(null),
      register: jasmine.createSpy().and.resolveTo(),
    };
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: auth },
        {
          provide: RegionStore,
          useValue: {
            options: signal(countries),
            loading: signal(false),
            error: signal(null),
            ensureLoaded: jasmine.createSpy().and.resolveTo(),
          },
        },
      ],
    });
  });

  it('requires a country and sends the selected country during registration', async () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.name.set('Sara');
    component.email.set('sara@example.com');
    component.phone.set('123456789');
    component.password.set('password123');
    component.confirm.set('password123');

    await component.submit();
    expect(auth.register).not.toHaveBeenCalled();
    expect(component.formError()).toBe('All fields are required.');

    const select = fixture.nativeElement.querySelector('select[name="country"]') as HTMLSelectElement;
    expect(select.required).toBeTrue();
    expect(select.className).toContain('text-[#1f2937]');
    select.value = 'US';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.country()).toBe('US');
    expect(component.phoneDialCode()).toBe('+1');
    await component.submit();

    expect(auth.register).toHaveBeenCalledWith({
      name: 'Sara',
      email: 'sara@example.com',
      phone: '123456789',
      phoneDialCode: '+1',
      password: 'password123',
      country: 'US',
    });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/verify-email']);
  });
});
