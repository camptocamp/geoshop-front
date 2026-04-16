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
   * Executes a search across multiple configured search providers and aggregates the results.
   *
   * Maps each configured search provider to a query, executes them in parallel using `forkJoin`,
   * and flattens the results into a single array of {@link ISearchResult} objects.
   *
   * @param query - The search string entered by the user. Can be a text search or coordinates.
   * @returns An Observable emitting an aggregated array of {@link ISearchResult} objects.
   *          If the query is invalid or no providers are configured, an empty array is emitted.
   */
  public search(query: string): Observable<ISearchResult[]> {
    const searchConfigs: ISearchConfig[] | undefined = this.configService.config?.search;
    if (typeof query !== 'string' || !query.trim() || !searchConfigs?.length) {
      return of([]);
    }
    const resultsObservables: Observable<ISearchResult[]>[] = searchConfigs
      .map(searchConfig => {
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
    if (layersParamName && layers) {
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
