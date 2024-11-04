import { TestBed } from '@angular/core/testing';

import { StoreService } from './store.service';
import { Store } from '@ngrx/store';
import { AppState } from '../_store';
import { of } from 'rxjs';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Store<AppState>, useClass: StoreMock}
      ],
    });
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
