import { i18n } from '@babi/tools';

import styles from './index.less?module';
export default function SubscriptionMenu() {
  return (
    <div className={styles.menuItem} key='subscription'>
      <a className={styles.hover} href={`/finance/product/subscription`} target='_blank' rel='noopener noreferrer'>
        {i18n.t('k2168938341', {}, '订阅管理')}
      </a>
    </div>
  );
}
