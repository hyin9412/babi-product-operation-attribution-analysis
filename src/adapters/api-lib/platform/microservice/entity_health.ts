export interface ListEntityHealthItem { entity_id?: string | number; entity_name?: string; problem_count?: number; top_entity_id?: string | number; site_id?: string }
export interface TrendDetail { date?: string | number; dimension?: string; value?: string }
export enum EstimateCycleTypeEnum { Month = 1, QuarterOrHalfYear = 2 }
export enum IndicatorSourceEnum { SourceBabi = 1, SourceOfficialWebsite = 2 }
