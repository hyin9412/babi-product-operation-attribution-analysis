export interface EntityDTO { id: number; name?: string; entity_id?: string; [key: string]: unknown }
export enum EntityStatusEnum { INVALID = 0, VALID = 1 }
export enum EntityTypeEnum { APP = 1, PRODUCT_LINE = 2, GOODS = 3, SECOND_PRODUCT_LINE = 4, PRODUCT = 5, SUB_PRODUCT = 6 }
