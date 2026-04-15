import { IConfig } from '@app/models/IConfig';
import { ISearchConfig } from '@app/models/ISearch';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ConfigService } from './config.service';
import { CoordinateSearchService } from './coordinate-search.service';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;
  let configServiceMock: ConfigService;
  let coordinateSearchServiceMock: CoordinateSearchService;

  beforeEach(() => {
    configServiceMock = {
      config: {
        apiUrl: '',
        mediaUrl: '',
        search: [],
        contact: {
          links: { conditions: '', tariffs: '', support: '' },
          phone: { label: '', number: '' },
          email: ''
        },
        map: {
          projection: { epsg: 'EPSG:2056', initialExtent: [0, 0, 0, 0] },
          defaultCenter: [0, 0],
          basemaps: [],
          constraints: [0, 0, 0, 0],
          resolutions: []
        },
        pageformats: [],
        oidcConfig: {},
        localAuthEnabled: true,
        appLogo: undefined,
        appLogo1: undefined
      } as IConfig,
      load: vi.fn().mockReturnValue(of({}))
    } as unknown as ConfigService;

    coordinateSearchServiceMock = {
      locale: 'fr-CH',
      stringCoordinatesToFeature: vi.fn().mockReturnValue(null)
    } as unknown as CoordinateSearchService;

    TestBed.configureTestingModule({
      providers: [
        SearchService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: configServiceMock },
        { provide: CoordinateSearchService, useValue: coordinateSearchServiceMock }
      ]
    });

    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('should return of([]) for empty query', () => {
      service.search('').subscribe(results => {
        expect(results).toEqual([]);
      });
    });

    it('should return of([]) for null query', () => {
      service.search(null as unknown as string).subscribe(results => {
        expect(results).toEqual([]);
      });
    });

    it('should return of([]) for undefined query', () => {
      service.search(undefined as unknown as string).subscribe(results => {
        expect(results).toEqual([]);
      });
    });

    it('should return of([]) if no search configs are present', () => {
      configServiceMock.config.search = undefined;
      service.search('test').subscribe(results => {
        expect(results).toEqual([]);
      });
    });

    it('should return of([]) if search configs array is empty', () => {
      configServiceMock.config.search = [];
      service.search('test').subscribe(results => {
        expect(results).toEqual([]);
      });
    });

    it('should skip provider if format is not found', () => {
      configServiceMock.config.search = [
        {
          url: 'http://example.com',
          queryParamName: 'q',
          providerType: 'unknown'
        } as ISearchConfig
      ];

      service.search('test').subscribe(results => {
        expect(results).toEqual([]);
      });
    });

    it('should perform query and map results correctly for geocoder provider', () => {
      const searchConfig: ISearchConfig = {
        url: 'http://geocoder.com',
        queryParamName: 'query',
        querySuffix: 'suffix=1',
        layersParamName: 'layers',
        layers: 'layer1,layer2',
        providerType: 'geocoder'
      };
      configServiceMock.config.search = [searchConfig];

      const mockGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 2] },
            properties: {
              label: 'Result 1',
              origin: 'Category 1',
              geom_st_box2d: 'BOX(1 2,3 4)'
            }
          }
        ]
      };

      service.search('test').subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].label).toBe('Result 1');
        expect(results[0].category).toBe('Category 1');
        expect(results[0].bbox).toEqual([1, 2, 3, 4]);
        expect(results[0].geometry).toBeDefined();
      });

      const req = httpMock.expectOne(request =>
        request.urlWithParams.includes('geocoder.com')
      );
      req.flush(mockGeoJson);
    });

    it('should perform query and map results correctly for mapfish provider', () => {
      const searchConfig: ISearchConfig = {
        url: 'http://mapfish.com',
        queryParamName: 'q',
        querySuffix: '',
        layersParamName: '',
        layers: '',
        providerType: 'mapfish'
      };
      configServiceMock.config.search = [searchConfig];

      const mockGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [5, 6] },
            properties: {
              label: 'Mapfish Result',
              layer_name: 'Mapfish Category',
              bbox: [5, 6, 7, 8]
            }
          }
        ]
      };

      service.search('test').subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].label).toBe('Mapfish Result');
        expect(results[0].category).toBe('Mapfish Category');
        expect(results[0].bbox).toEqual([5, 6, 7, 8]);
      });

      const req = httpMock.expectOne(request => request.urlWithParams.includes('mapfish.com'));
      req.flush(mockGeoJson);
    });

    it('should merge results from multiple providers', () => {
      configServiceMock.config.search = [
        {
          url: 'http://p1.com',
          queryParamName: 'q',
          providerType: 'geocoder'
        } as ISearchConfig,
        {
          url: 'http://p2.com',
          queryParamName: 'q',
          providerType: 'mapfish'
        } as ISearchConfig
      ];

      service.search('test').subscribe(results => {
        expect(results.length).toBe(2);
        expect(results[0].label).toBe('P1');
        expect(results[1].label).toBe('P2');
      });

      const req1 = httpMock.expectOne(request => request.urlWithParams.includes('p1.com'));
      req1.flush({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: { label: 'P1', origin: 'C1', geom_st_box2d: 'BOX(0 0,0 0)' }, geometry: { type: 'Point', coordinates: [0, 0] } }]
      });

      const req2 = httpMock.expectOne(request => request.urlWithParams.includes('p2.com'));
      req2.flush({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: { label: 'P2', layer_name: 'C2', bbox: [0, 0, 0, 0] }, geometry: { type: 'Point', coordinates: [0, 0] } }]
      });
    });

    it('should include coordinate result if coordinateSearchService returns a feature', () => {
      const searchConfig: ISearchConfig = {
        url: 'http://geocoder.com',
        queryParamName: 'q',
        providerType: 'geocoder'
      } as ISearchConfig;
      configServiceMock.config.search = [searchConfig];

      const coordFeature = new Feature({
        geometry: new Point([10, 20]),
        label: '10 / 20',
        origin: 'CoordOrigin',
        geom_st_box2d: 'BOX(10 20,10 20)'
      });
      coordinateSearchServiceMock.stringCoordinatesToFeature.mockReturnValue(coordFeature);

      service.search('10 20').subscribe(results => {
        // One from coordinateSearchService + one from mock response
        expect(results.length).toBe(2);
        expect(results.find(r => r.label === '10 / 20')).toBeDefined();
      });

      const req = httpMock.expectOne(request => request.urlWithParams.includes('geocoder.com'));
      req.flush({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: { label: 'Remote', origin: 'C', geom_st_box2d: 'BOX(0 0,0 0)' }, geometry: { type: 'Point', coordinates: [0, 0] } }]
      });
    });
  });
});
