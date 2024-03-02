import { TestBed } from '@angular/core/testing';

import { ApiNinjaService } from './api-ninja.service';

describe('ApiNinjaService', () => {
  let service: ApiNinjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiNinjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
