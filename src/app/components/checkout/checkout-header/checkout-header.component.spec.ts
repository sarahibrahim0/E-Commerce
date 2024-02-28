import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutHeaderComponent } from './checkout-header.component';

describe('CheckoutHeaderComponent', () => {
  let component: CheckoutHeaderComponent;
  let fixture: ComponentFixture<CheckoutHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckoutHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
