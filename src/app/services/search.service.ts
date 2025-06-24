import { Injectable } from "@angular/core";
import { ConfigService } from "./config.service";
import { HttpClient } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { Geometry } from "ol/geom";
import { CoordinateSearchService } from "./coordinate-search.service";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import WKT from "ol/format/WKT";
import { ISearchConfig, ISearchResult } from "@app/models/ISearch";

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
  private readonly wktFormatter = new WKT();
  private readonly searchResultFormat = new Map<string, (f: Feature<Geometry>) => ISearchResult>([
    ['geocoder', (f: Feature<Geometry>) => <ISearchResult>{
      label: f.get("label"),
      category: f.get('origin') ?? 'Allgemein',
      bbox: parseBox(<string>f.get('geom_st_box2d')),
      geometry: f.getGeometry()
    }],
    ['mapfish', (f: Feature<Geometry>) => <ISearchResult>{
      label: f.get("label"),
      category: f.get('layer_name') ?? 'Allgemein',
      bbox: f.get('bbox'),
      geometry: f.getGeometry()
    }]
  ]);

  constructor(
    private readonly configService: ConfigService,
    private readonly coordinateSearchService: CoordinateSearchService,
    private readonly httpClient: HttpClient,
  ) {

  }

  public search(query: string): Observable<ISearchResult[]> {
    if (!query || query.length === 0 || typeof query !== 'string') {
      return of([]);
    }
    const searchConfig = this.configService.config?.search;
    if (!searchConfig) {
      return of([]);
    }
    const resultFormat = this.searchResultFormat.get(searchConfig.providerType);
    if (!resultFormat) {
      return of([]);
    }
    return this.performQuery(query, searchConfig).pipe(map(result => result.map(resultFormat)))
  }

  private performQuery(query: string, config: ISearchConfig) {
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
