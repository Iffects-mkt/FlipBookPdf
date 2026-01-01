
export interface PDFPageData {
  pageIndex: number;
  imageUrl: string;
  width: number;
  height: number;
}

export enum ViewMode {
  SINGLE = 'portrait',
  DOUBLE = 'landscape'
}

export interface FlipbookConfig {
  width: number;
  height: number;
  usePortrait: boolean;
  startPage: number;
}
