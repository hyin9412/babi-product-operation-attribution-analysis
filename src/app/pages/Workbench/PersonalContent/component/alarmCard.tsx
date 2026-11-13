import { useMemo, useRef } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconRight } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Link } from '@byted-babi/babi-design';

import { AlarmRecordAgg } from 'APP/api-lib/platform/microservice/monitor';
import { AlarmListMap } from 'APP/pages/Workbench/constants';
import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';

import styles from '../index.module.less';

const AlarmCard = (props: { cardList: { label: string; value: string }[]; alarmData: AlarmRecordAgg[] }) => {
  const { cardList, alarmData } = props;
  const history = useHistory();

  const alarmCardRef = useRef<HTMLDivElement>(null);
  useModuleViewTrace(alarmCardRef, {
    module_name: i18n.t('k3577508929', {}, '待处理报警'),
  });
  useMouseEnterTrace(alarmCardRef, {
    module_name: i18n.t('k3577508929', {}, '待处理报警'),
  });

  const { alarmTotal, alarmDataMap } = useMemo(() => {
    let alarmTotal = 0;
    const alarmDataMap = alarmData?.reduce((prev, cur) => {
      alarmTotal += cur.alarm_record_agg_count || 0;
      prev[cur.entity_type] = cur;
      return prev;
    }, {} as Record<string, AlarmRecordAgg>);
    return { alarmTotal, alarmDataMap };
  }, [alarmData]);

  return (
    <div ref={alarmCardRef} className={styles.cardContent} style={{ marginBottom: '16px' }}>
      <div className={styles.alarmContentHeader}>
        {i18n.t('k3577508929', {}, '待处理报警')}
        <span className={styles.alarmContentHeaderTips}>{`${i18n.t(
          'k2991675147',
          { placeholder1: alarmTotal },
          '（共 {placeholder1} 个）',
        )}`}</span>
      </div>
      <div className={styles.alarmList}>
        {cardList?.map(item => {
          const { alarm_record_agg_count, start_bill_time, end_bill_time } = alarmDataMap[item.value] || {};
          return (
            <Link
              className={styles.alarmItem}
              key={item.value}
              onClick={() => {
                history.push(`${AlarmListMap[item.value].link}&bill_time=${start_bill_time},${end_bill_time}`);
                workbenchEventReport(
                  {
                    action: 'alarmCardClick',
                    context: `${i18n.t('k3769026643', { placeholder0: item.label }, '{placeholder0}报警')}`,
                  },
                  true,
                );
              }}
            >
              <div className={styles.alarmHeader}>
                <span className={styles.alarmTitle}>{item.label}</span>
                <IconRight className={styles.alarmArrow} />
              </div>
              <div className={styles.alarmCount}>{alarm_record_agg_count || 0}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AlarmCard;
