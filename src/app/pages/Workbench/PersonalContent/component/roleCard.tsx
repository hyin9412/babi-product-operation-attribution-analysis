import { useRef } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconRight } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Link } from '@byted-babi/babi-design';

import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';

import styles from '../index.module.less';
export interface RoleData {
  expiry: number;
  all: number;
}
const RoleCard = (props: { roleData: RoleData }) => {
  const { roleData } = props;
  const history = useHistory();
  const roleCardRef = useRef<HTMLDivElement>(null);
  useModuleViewTrace(roleCardRef, {
    module_name: i18n.t('my_permissions', {}, '我的权限'),
  });
  useMouseEnterTrace(roleCardRef, {
    module_name: i18n.t('my_permissions', {}, '我的权限'),
  });
  return (
    <div ref={roleCardRef} className={styles.cardContent} style={{ marginBottom: '16px' }}>
      <div className={styles.roleContentHeader}>{i18n.t('my_permissions', {}, '我的权限')}</div>
      <div className={styles.roleList}>
        <Link
          className={styles.roleItem}
          onClick={() => {
            history.push('/finance/auth/?expirdOnly=true');
            workbenchEventReport(
              {
                action: 'roleCardClick',
                context: i18n.t('k3851054427', {}, '即将过期权限'),
              },
              true,
            );
          }}
        >
          <div className={styles.roleHeader}>
            <span className={styles.roleTitle}>{i18n.t('k3851054427', {}, '即将过期权限')}</span>
            {!!roleData.expiry && <div className={styles.roleTag}>{i18n.t('k201877106', {}, '待续期')}</div>}
            <IconRight className={styles.roleArrow} />
          </div>
          <div className={styles.roleCount}>{roleData.expiry || 0}</div>
        </Link>

        <Link
          className={styles.roleItem}
          onClick={() => {
            history.push('/finance/auth/?expirdOnly=false');
            workbenchEventReport(
              {
                action: 'roleCardClick',
                context: i18n.t('my_permissions', {}, '我的权限'),
              },
              true,
            );
          }}
        >
          <div className={styles.roleHeader}>
            <span className={styles.roleTitle}>{i18n.t('my_permissions', {}, '我的权限')}</span>
            <IconRight className={styles.roleArrow} />
          </div>
          <div className={styles.roleCount}>{roleData.all || 0}</div>
        </Link>
      </div>
    </div>
  );
};

export default RoleCard;
