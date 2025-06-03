import { Geometry } from "ol/geom";

export interface ISearchConfig {
  url: string;
  queryParamName: string;
  querySuffix: string;
  layers: string;
  providerType: string;
}

/*
export const nameOfCategoryForGeocoder: { [prop: string]: string; } = { // TODO this should be translated
  zipcode: 'Ortschaftenverzeichnis PLZ',
  gg25: 'Gemeinden',
  Gemeindegrenzen: 'Gemeinden',
  district: 'Bezirke',
  kantone: 'Kantone',
  gazetteer: 'OEV Haltestellen',
  address: 'Adressen',
  Adressen: 'Adressen',
  parcel: 'Parzellen',
};
*/
export interface ISearchResult {
  label: string;
  category: string;
  bbox: number[];
  geometry: Geometry;
}
