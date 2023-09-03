import { TestBed } from '@angular/core/testing';

import { UserAuthInterceptor } from './user-auth.interceptor';

describe('UserAuthInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UserAuthInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: UserAuthInterceptor = TestBed.inject(UserAuthInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
