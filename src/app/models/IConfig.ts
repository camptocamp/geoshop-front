import { OpenIdConfiguration } from "angular-auth-oidc-client";
import { Extent } from "ol/extent";

export interface IBasemap {
  id: string;
  label: string;
  description: string;
  thumbUrl: string;
  matrixSet: string;
  format: string;
}

export interface ISearchConfig {
  url: string;
  queryParamName: string;
  querySuffix: string;
  layers: string;
  providerType: string;
}

export interface IMapConfig {
  projection: {
      epsg: string;
      initialExtent: Extent;
  }
  defaultCenter: number[];
  basemaps: IBasemap[];
  constraints: Extent;
  resolutions: number[];
}

// TODO it look like thie interface is never used -> remove it or use it!
export interface IConfig {
  apiUrl: string;
  mediaUrl: string;
  baseMapUrl: string;
  search: ISearchConfig;
  contact: {
    links: { conditions: string; tariffs: string; support: string;};
    phone: { label: string; number: string };
    email: string;
  };
  map: IMapConfig;
  pageformats: IPageFormat[];
  oidcConfig: OpenIdConfiguration;
  localAuthEnabled: boolean;
  noBillingForFreeOrder?: boolean;
  appLogo: {
    path: string;
    alt: string;
  } | undefined;
  appLogo1: {
    path: string;
    alt: string;
  } | undefined;

}

export interface IPageFormat {
  name: string;
  height: number;
  width: number;
}
