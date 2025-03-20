import { vi } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { StoreService } from './store.service';
import { Store } from '@ngrx/store';
import { AppState } from '../_store';
import { of } from 'rxjs';

class StoreMock {
  select =  vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
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
