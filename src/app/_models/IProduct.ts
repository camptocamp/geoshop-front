
import { IMetadata, IMetadataSummary } from './IMetadata';

export interface IProduct {
  id: number;
  url?: string;
  label: string;
  status?: string;
  provider?: string;
  order?: number;
  thumbnail_link?: string;
  /** Metadata url */
  metadata?: string;
  group?: unknown;
  /** Pricing url */
  pricing?: string;
  /** Use only in the app to facilitate */
  metadataObject?: IMetadata;
  metadataSummary?: IMetadataSummary
}
