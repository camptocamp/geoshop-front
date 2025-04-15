import {IPageFormat} from './IConfig';

export interface IManualEntryDialogData {
  selectedPageFormatScale: number;
  pageFormatScales: number[];
  selectedPageFormat: IPageFormat;
  pageFormats: IPageFormat[];
  PageFormatRotation: number;
  rotationPageFormat: number;
  activeTab: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}
