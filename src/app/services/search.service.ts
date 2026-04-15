import { ISearchConfig, ISearchResult } from "@app/models/ISearch";
import { ConfigService } from "@app/services/config.service";
import { CoordinateSearchService } from "@app/services/coordinate-search.service";

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import {map, forkJoin, Observable, of} from "rxjs";

function parseBox(box: string) {
  const match = box.match(/BOX\(([^ ]+) ([^,]+),([^ ]+) ([^)]+)\)/);
  if (!match) {
    throw new Error(`Invalid BOX format: ${box}`);
  }
  return match.map(Number).slice(1);
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly geoJsonFormatter = new GeoJSON();
  private readonly searchResultFormat = new Map<string, (f: Feature<Geometry>) => ISearchResult>([
    ['geocoder', (f: Feature<Geometry>) => ({
      label: f.get("label"),
      category: f.get('origin'),
      bbox: parseBox(f.get('geom_st_box2d') as string),
      geometry: f.getGeometry()
    }) as ISearchResult],
    ['mapfish', (f: Feature<Geometry>) => ({
      label: f.get("label"),
      category: f.get('layer_name'),
      bbox: f.get('bbox'),
      geometry: f.getGeometry()
    }) as ISearchResult]
  ]);

  constructor(
    private readonly configService: ConfigService,
    private readonly coordinateSearchService: CoordinateSearchService,
    private readonly httpClient: HttpClient,
  ) {

  }

  /**
   * Executes a search potentially across multiple configured search providers.
   *
   * - Provides a unified search entry point for the application.
   * - Aggregates search results from various search endpoints as defined in the application configuration.
   * - Automatically attempts to interpret the query as coordinates and includes it as a result if valid.
   *
   * @param query The search string entered by the user.
   * @returns An Observable emitting an array of {@link ISearchResult} objects.
   */
  public search(query: string): Observable<ISearchResult[]> {
    if (!query || query.length === 0 || typeof query !== 'string') {
      return of([]);
    }
    const searchConfigs: ISearchConfig[] | undefined = this.configService.config?.search;
    if (!searchConfigs || searchConfigs.length === 0) {
      return of([]);
    }
    const resultsObservables: Observable<ISearchResult[]>[] = searchConfigs.map(searchConfig => {
      const resultFormat = this.searchResultFormat.get(searchConfig.providerType);
      if (!resultFormat) {
        return of([]);
      }
      return this.performQuery(query, searchConfig).pipe(
        map(result => result.map(resultFormat))
      );
    });

    return forkJoin(resultsObservables).pipe(
      map((resultsArray: ISearchResult[][]) => {
        return resultsArray.flat()
      })
    )
  }

  private performQuery(query: string, config: ISearchConfig): Observable<Feature<Geometry>[]> {
    const coordinateResult = this.coordinateSearchService.stringCoordinatesToFeature(query);
    const url = new URL(config.url);
    url.searchParams.append(config.queryParamName, query);
    const layersParamName: string = config.layersParamName;
    const layers: string = config.layers;
    if (layersParamName && layersParamName.length > 0 && layers && layers.length > 0) {
      url.searchParams.append(layersParamName, layers)
    }
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
