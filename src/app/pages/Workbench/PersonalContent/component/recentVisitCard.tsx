import { useRef } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconOtherResourceConfig, IconPageEmpty } from '@arco-design/iconbox-react-babi';
import { i18n } from '@babi/tools';
import { RenderMenuIcon } from '@babi/tools';
import { Link, Typography } from '@byted-babi/babi-design';

import { RecentlyViewedDTO } from 'APP/api-lib/platform/microservice/dashboard';
import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import { resourceUrlMapMenu } from 'PAGES/Workbench/utils';

import styles from '../index.module.less';
const RecentVisitCard = (props: { data: RecentlyViewedDTO[] }) => {
  const { data } = props;
  const recentVisitCardRef = useRef<HTMLDivElement>(null);
  const history = useHistory();

  useModuleViewTrace(recentVisitCardRef, {
    module_name: i18n.t('k744994021', {}, '最近访问'),
  });
  useMouseEnterTrace(recentVisitCardRef, {
    module_name: i18n.t('k744994021', {}, '最近访问'),
  });

  const empty = () => {
    return (
      <div className={styles.recentVisitsEmpty}>
        <IconPageEmpty style={{ fontSize: '48px' }} />
        <div className={styles.budgetText}>{i18n.t('k1283758259', {}, '暂无访问记录')}</div>
      </div>
    );
  };
  return (
    <div ref={recentVisitCardRef} className={styles.cardContent} style={{ marginBottom: '16px' }}>
      <div className={styles.recentVisitsTitle}>{i18n.t('k744994021', {}, '最近访问')}</div>
      <div className={styles.recentVisits}>
        {data?.length > 0
          ? data?.map(item => {
              return (
                <Link
                  onClick={() => {
                    history.push(item.url);
                    workbenchEventReport(
                      {
                        action: 'recentVisitClick',
                        context: i18n.t('k744994021', {}, '最近访问'),
                        name: resourceUrlMapMenu[item.route]?.MenuName,
                      },
                      true,
                    );
                  }}
                  className={styles.visitItem}
                  key={item.route}
                >
                  <div className={styles.visitIcon}>
                    {RenderMenuIcon(resourceUrlMapMenu[item.route]?.Icon) ?? <IconOtherResourceConfig />}
                  </div>

                  <Typography.Ellipsis showTooltip className={styles.visitText}>
                    {resourceUrlMapMenu[item.route]?.MenuName}
                  </Typography.Ellipsis>
                </Link>
              );
            })
          : empty()}
      </div>
    </div>
  );
};

export default RecentVisitCard;
