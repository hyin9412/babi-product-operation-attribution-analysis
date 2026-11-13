import { EAlarmObjectType } from './monitorTypes';

export const PermissionAlarmObjectTypeOpts = (..._args: unknown[]) => [
  { label: '商品报警', value: EAlarmObjectType.Product },
  { label: '服务树报警', value: EAlarmObjectType.ServiceTree },
  { label: 'App报警', value: EAlarmObjectType.APP },
];
