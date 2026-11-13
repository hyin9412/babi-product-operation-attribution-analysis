import React, { useEffect } from 'react';

import {
  i18n,
  useNoticeObservable,
  //@ts-ignore
} from '@babi/tools';
import { Badge } from '@byted-babi/babi-design';

import { platformServiceClient } from 'APP/api-lib/platform/microservice/bytedance_babi_platform_service';
import { history } from 'APP/app';

import styles from './index.less?module';

export default function NoticeMenu(): JSX.Element {
  const [dot, setDot] = React.useState<boolean>(false);
  const [status] = useNoticeObservable();

  const getNoticeStatus = async () => {
    try {
      const { data } = await platformServiceClient.HavingNotReadAnnouncement({}, { messageError: false });
      setDot(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getNoticeStatus();
  }, [status]);

  return (
    <div className={styles.menuItem} key='notice'>
      <span
        className={`${styles.hover} ${styles.dropdown}`}
        onClick={() => {
          history.push('/finance/notice');
        }}
      >
        <Badge dot={dot} count={dot ? 6 : 0} offset={[2, -2]} dotStyle={{ boxShadow: 'none' }}>
          <span style={{ position: 'relative' }}>{i18n.t('Announcement', {}, '公告')}</span>
        </Badge>
      </span>
    </div>
  );
}
