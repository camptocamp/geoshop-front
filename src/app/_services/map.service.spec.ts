import { vi } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { MapService } from './map.service';
import { provideHttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../_store';
import { of } from 'rxjs';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

class ConfigServiceMock {
  public config = {
    initialExtent: [0, 0, 1, 1],
    pageformats: [{ name: "", height: 1, width: 1 }],
  }
}

describe('MapServiceTest', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { queryParamMap: of() }},
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: Store<AppState>, useClass: StoreMock }
      ],
    });
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
