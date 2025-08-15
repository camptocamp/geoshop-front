import { Extent } from 'ol/extent';
import {IPageFormat} from './IConfig';

export interface IManualEntryDialogData {
  activeTab: number;

  // Page format
  selectedPageFormatScale: number;
  pageFormatScales: number[];
  selectedPageFormat: IPageFormat;
  pageFormats: IPageFormat[];
  PageFormatRotation: number;
  rotationPageFormat: number;

  // Bounding box
  extent: Extent;
  constraints: Extent;
}
