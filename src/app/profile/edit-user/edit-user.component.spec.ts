import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/stores/auth.store';
import { RegionStore } from '../../core/stores/region.store';
import { ToastService } from '../../shared/toast/toast.service';
import { EditUserComponent } from './edit-user.component';

describe('EditUserComponent', () => {
  const countries = [
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', currencyCode: 'EGP' },
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', currencyCode: 'USD' },
  ];

  it('loads country options, selects the saved country, and saves the selected code', async () => {
    const auth = {
      user: signal({
        id: 'user-1',
        name: 'Sara',
        email: 'sara@example.com',
        phone: '123456789',
        street: '',
        apartment: '',
        city: '',
        zip: '',
        country: 'Egypt',
        isAdmin: false,
      }),
      userId: signal('user-1'),
      userLoading: signal(false),
      loadUser: jasmine.createSpy().and.resolveTo(),
    };
    const api = { update: jasmine.createSpy().and.returnValue(of({})) };
    const region = {
      options: signal(countries),
      loading: signal(false),
      error: signal(null),
      ensureLoaded: jasmine.createSpy().and.resolveTo(),
    };

    TestBed.configureTestingModule({
      imports: [EditUserComponent],
      providers: [
        { provide: AuthStore, useValue: auth },
        { provide: AuthService, useValue: api },
        { provide: RegionStore, useValue: region },
        { provide: ToastService, useValue: { show: jasmine.createSpy() } },
      ],
    });

    const fixture = TestBed.createComponent(EditUserComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const select = fixture.nativeElement.querySelector('select[name="country"]') as HTMLSelectElement;

    expect(region.ensureLoaded).toHaveBeenCalled();
    expect(select.value).toBe('EG');
    expect(select.required).toBeTrue();
    expect(select.className).toContain('text-[#1f2937]');

    select.value = 'US';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.country()).toBe('US');
    await component.save();

    expect(api.update).toHaveBeenCalledWith('user-1', jasmine.objectContaining({ country: 'US' }));
  });
});
