import { TestBed } from '@angular/core/testing';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { CustomIconService } from './custom-icon.service';

describe('CustomIconService', () => {
  let service: CustomIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
      ],
      providers: [
        MatIconRegistry,
        DomSanitizer
      ]
    });
    service = TestBed.inject(CustomIconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
