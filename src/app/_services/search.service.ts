import { Injectable } from "@angular/core";
import { ConfigService } from "./config.service";
import { HttpClient } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { Geometry } from "ol/geom";
import { CoordinateSearchService } from "./coordinate-search.service";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import { ISearchConfig } from "../_models/ISearch";


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly geoJsonFormatter = new GeoJSON();

  constructor(
    private readonly configService: ConfigService,
    private readonly coordinateSearchService: CoordinateSearchService,
    private readonly httpClient: HttpClient,
  ) {

  }

  public search(query: string): Observable<Feature<Geometry>[]> {
    if (!query || query.length === 0 || typeof query !== 'string') {
      return of([]);
    }
    const searchConfig = this.configService.config?.search;
    if (!searchConfig) {
      return of([]);
    }

    switch (searchConfig.providerType) {
      case 'geocoder':
        return this.searchGeocoder(query, searchConfig);
      case 'mapfish':
        return this.searchMapFish(query, searchConfig);
    }
    return of([]);
  }

  private searchMapFish(query: string, config: ISearchConfig) {
    const coordinateResult = this.coordinateSearchService.stringCoordinatesToFeature(query);
    const url = new URL(config.url);
    url.searchParams.append(config.queryParamName, query);
    url.search += `&${config.querySuffix}`;
    return this.httpClient.get(url.toString()).pipe(
      map((featureCollectionData) => {
        const featureCollection = this.geoJsonFormatter.readFeatures(featureCollectionData);
        if (coordinateResult) {
          featureCollection.push(coordinateResult);
        }
        return featureCollection;
      })
    );
  }

  private searchGeocoder(query: string, config: ISearchConfig) {
    const coordinateResult = this.coordinateSearchService.stringCoordinatesToFeature(query);
    const url = new URL(config.url);
    url.searchParams.append(config.queryParamName, query);
    url.search += `&${config.querySuffix}`;
    return this.httpClient.get(url.toString()).pipe(
      map((featureCollectionData) => {
        const featureCollection = this.geoJsonFormatter.readFeatures(featureCollectionData);
        if (coordinateResult) {
          featureCollection.push(coordinateResult);
        }
        return featureCollection;
      })
    );
  }
}
