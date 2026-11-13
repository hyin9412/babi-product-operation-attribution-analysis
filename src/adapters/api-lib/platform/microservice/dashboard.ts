export interface RecentlyViewedDTO { route: string; url: string }
export interface SubcribeObjectDTO { entity_type: string; obj_cnt?: number; event_cnt?: number }
export interface BusinessActivityDTO { title?: string; type?: string; begin_time?: number; end_time?: number; need_process?: boolean; extra?: string; process_reason?: string; desc?: string }
export interface TodoItem { type: string; value?: number }
