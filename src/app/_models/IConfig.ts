import { OpenIdConfiguration } from "angular-auth-oidc-client";
import { ISearchConfig } from "./ISearch";

export interface IBasemap {
  id: string;
  label: string;
  description: string;
  thumbUrl: string;
  matrixSet: string;
  format: string;
}

// TODO it look like thie interface is never used -> remove it or use it!
export interface IConfig {
  apiUrl: string;
  mediaUrl: string;
  baseMapUrl: string;
  search: ISearchConfig;
  contact: {
    links: { conditions: string; tariffs: string; };
    phone: { label: string; number: string };
    email: string;
  };

  basemaps: Array<IBasemap>;
  initialCenter: number[];
  initialExtent: number[];
  resolutions: number[];
  epsg: string;
  pageformats: Array<IPageFormat>;
  oidcConfig: OpenIdConfiguration;
  localAuthEnabled: boolean;
  noBillingForFreeOrder?: boolean;
  appLogo: {
    path: string;
    alt: string;
  } | undefined;}

export interface IPageFormat {
  name: string;
  height: number;
  width: number;
}
