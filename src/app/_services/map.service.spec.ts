import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../_store';
import { of } from 'rxjs';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {provide: Store<AppState>, useClass: StoreMock}
      ],
    });
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
