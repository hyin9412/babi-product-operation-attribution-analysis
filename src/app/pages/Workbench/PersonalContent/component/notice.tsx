import { useRef, useState } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconRight } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { NotificationDetailDrawer, useNoticeObservable } from '@babi/tools';
import { Divider, Link, Typography } from '@byted-babi/babi-design';
import dayjs from 'dayjs';

import { AnnouncementDetail } from 'APP/api-lib/platform/microservice/announcement';
import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import { announcementTypesEn } from 'PAGES/Notice/constant';

import styles from '../index.module.less';
const Notice = (props: { noticeList: AnnouncementDetail[]; closeCallback: () => void }) => {
  const { noticeList, closeCallback } = props;
  const [noticeInfo, setNoticeInfo] = useState<AnnouncementDetail>();
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [, changeStatus] = useNoticeObservable();
  const history = useHistory();

  const noticeRef = useRef<HTMLDivElement>(null);
  useModuleViewTrace(noticeRef, {
    module_name: i18n.t('k2241560246', {}, '重要通知'),
  });
  useMouseEnterTrace(noticeRef, {
    module_name: i18n.t('k2241560246', {}, '重要通知'),
  });

  return (
    <div
      ref={noticeRef}
      className={styles.cardContent}
      title={i18n.t('k2241560246', {}, '重要通知')}
      style={{ marginBottom: '16px' }}
    >
      <div className={styles.viewMoreHeader}>
        <div className={styles.title}>{i18n.t('k2241560246', {}, '重要通知')}</div>
        <Link
          onClick={() => {
            history.push('/finance/notice/');
            workbenchEventReport(
              {
                action: 'noticeClick',
                context: i18n.t('Read_more', {}, '查看更多'),
              },
              true,
            );
          }}
          className={styles.viewMore}
        >
          <span>{i18n.t('Read_more', {}, '查看更多')}</span>
          <IconRight className={styles.viewMoreIcon} />
        </Link>
      </div>
      <div className={styles.notificationList}>
        {noticeList?.map(item => (
          <div
            className={styles.notificationItem}
            onClick={() => {
              workbenchEventReport(
                {
                  action: 'noticeClick',
                  context: i18n.t('k2241889108', {}, '查看通知'),
                },
                true,
              );
            }}
            key={item.id}
          >
            <div
              className={`${!item.read_status ? styles.hasIcon : styles.typeText}`}
              onClick={() => {
                setNoticeVisible(true);
                setNoticeInfo(item);
              }}
            >
              <span>{announcementTypesEn[item.label]?.slice(0, 2) || '-'}</span>
              <Divider className={styles.divider} type='vertical' />
              <Typography.Paragraph
                style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
                ellipsis={{ rows: 1, showTooltip: true, wrapper: 'span' }}
              >
                {item.title || '-'}
              </Typography.Paragraph>
            </div>
            <div className={styles.notificationDate}>
              {item.start_time ? dayjs(item.start_time).format('YYYY-MM-DD') : '-'}
            </div>
          </div>
        ))}
      </div>
      {noticeInfo && (
        <NotificationDetailDrawer
          visible={noticeVisible}
          setVisible={setNoticeVisible}
          info={noticeInfo}
          closeCallback={() => {
            changeStatus();
            closeCallback();
          }}
        />
      )}
    </div>
  );
};

export default Notice;
