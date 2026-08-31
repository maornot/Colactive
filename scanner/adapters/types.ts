export interface RawItem {
  externalRef?: string;
  title: string;
  summary?: string;
  procedureType?: string;
  budgetText?: string;
  deadlineAt?: Date;
  publishedAt?: Date;
  docsUrl: string;
}

export interface SourceAdapter {
  bodyName: string;
  sourceUrl: string;
  fetch(): Promise<RawItem[]>;
}
