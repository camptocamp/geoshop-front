import { Geometry } from "ol/geom";

export interface ISearchConfig {
  url: string;
  queryParamName: string;
  querySuffix: string;
  layers: string;
  providerType: string;
}

export interface ISearchResult {
  label: string;
  category: string;
  bbox: number[];
  geometry: Geometry;
}
