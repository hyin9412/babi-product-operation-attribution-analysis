import { useMemo, useRef } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconRight } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Actions, authInstance, Resource } from '@babi/tools';
import { Link } from '@byted-babi/babi-design';

import { TodoItem } from 'APP/api-lib/platform/microservice/dashboard';
import { ApprovalListMap } from 'APP/pages/Workbench/constants';
import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';

import styles from '../index.module.less';

const ApprovalCard = (props: { approvalData: TodoItem[]; cloudFlowTotal: number }) => {
  const { approvalData, cloudFlowTotal } = props;
  const history = useHistory();

  const approvalNumMap = useMemo(() => {
    return approvalData.reduce((pre, cur) => {
      pre[cur.type] = cur.type === 'approval' ? cloudFlowTotal : cur.value;
      return pre;
    }, {} as Record<string, number>);
  }, [approvalData, cloudFlowTotal]);

  const approvalCardRef = useRef<HTMLDivElement>(null);
  useModuleViewTrace(approvalCardRef, {
    module_name: i18n.t('work_order_pending_approval', {}, '待审批工单'),
  });
  useMouseEnterTrace(approvalCardRef, {
    module_name: i18n.t('work_order_pending_approval', {}, '待审批工单'),
  });

  const hasBudgetPermission = authInstance.auth({
    resource: Resource.budgetAreaBudgetSource,
    id: '*',
    action: Actions.costRead,
  });
  const cardList = useMemo(() => {
    return Object.keys(ApprovalListMap).filter(item => {
      if (item === 'budget_approval') {
        return hasBudgetPermission;
      }
      return true;
    });
  }, [hasBudgetPermission]);

  const total = useMemo(() => {
    return cardList.reduce((pre, cur) => {
      return pre + (approvalNumMap[cur] || 0);
    }, 0);
  }, [approvalNumMap, cardList]);

  return (
    <div ref={approvalCardRef} className={styles.cardContent} style={{ marginBottom: '16px' }}>
      <div className={styles.approvalContentHeader}>
        {i18n.t('work_order_pending_approval', {}, '待审批工单')}
        <span className={styles.alarmContentHeaderTips}>{`${i18n.t(
          'k3590462203',
          { total: total },
          '（共 {total} 个）',
        )}`}</span>
      </div>
      <div className={styles.approvalList}>
        {cardList.map(key => {
          const { name, link } = ApprovalListMap[key];
          return (
            <Link
              className={styles.approvalItem}
              key={key}
              onClick={() => {
                history.push(link);
                workbenchEventReport(
                  {
                    action: 'approvalCardClick',
                    context: name,
                  },
                  true,
                );
              }}
            >
              <div className={styles.approvalHeader}>
                <span className={styles.approvalTitle}>{name}</span>
                <IconRight className={styles.approvalArrow} />
              </div>
              <div className={styles.approvalCount}>{approvalNumMap[key] || 0}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalCard;
