import { useRef } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconPageEmpty } from '@arco-design/iconbox-react-babi';
import { i18n } from '@babi/tools';
import { Link } from '@byted-babi/babi-design';

import { SubcribeObjectDTO } from 'APP/api-lib/platform/microservice/dashboard';
import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import { SubscriptionMap } from 'PAGES/Workbench/constants';

import styles from '../index.module.less';
const SubscriptionCard = (props: { data: SubcribeObjectDTO[] }) => {
  const { data } = props;
  const history = useHistory();

  const subscriptionCardRef = useRef<HTMLDivElement>(null);

  useModuleViewTrace(subscriptionCardRef, {
    module_name: i18n.t('k709304727', {}, '我的订阅'),
  });
  useMouseEnterTrace(subscriptionCardRef, {
    module_name: i18n.t('k709304727', {}, '我的订阅'),
  });

  const empty = () => {
    return (
      <div className={styles.recentVisitsEmpty}>
        <IconPageEmpty style={{ fontSize: '48px' }} />
        <div className={styles.budgetText}>{i18n.t('k709446496', {}, '暂无订阅')}</div>
      </div>
    );
  };
  return (
    <div ref={subscriptionCardRef} className={styles.cardContent} style={{ marginBottom: '16px' }}>
      <div className={styles.recentVisitsTitle}>
        {i18n.t('k709304727', {}, '我的订阅')}
        <div id='workbenchPersonalGuideStep4'></div>
      </div>
      <div className={styles.subscriptions}>
        {data?.length > 0
          ? data?.map(item => {
              return (
                <Link
                  key={item.entity_type}
                  className={styles.subscriptionItem}
                  onClick={() => {
                    history.push('/finance/product/subscription/');
                    workbenchEventReport(
                      {
                        action: 'subscriptionClick',
                        context: i18n.t('k709304727', {}, '我的订阅'),
                        name: SubscriptionMap[item.entity_type],
                      },
                      true,
                    );
                  }}
                >
                  <div className={styles.subscriptionDataItem}>
                    <div className={styles.dataLabel}>{i18n.t('subscriber', {}, '订阅对象')}</div>
                    <div className={styles.dataValue}>{SubscriptionMap[item.entity_type] || '-'}</div>
                  </div>
                  <div className={styles.subscriptionDataItem}>
                    <div className={styles.dataLabel}>{i18n.t('k3704239413', {}, '订阅商品数')}</div>
                    <div className={styles.dataValue}>{item?.obj_cnt || 0}</div>
                  </div>
                  <div className={styles.subscriptionDataItem}>
                    <div className={styles.dataLabel}>{i18n.t('k3432474543', {}, '订阅事件数')}</div>
                    <div className={styles.dataValue}>{item?.event_cnt || 0}</div>
                  </div>
                </Link>
              );
            })
          : empty()}
      </div>
    </div>
  );
};

export default SubscriptionCard;
