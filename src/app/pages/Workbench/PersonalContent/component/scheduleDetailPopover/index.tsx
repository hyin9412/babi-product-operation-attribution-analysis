import { ReactNode } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconAlarmClock } from '@arco-design/iconbox-react-babi';
import { IconInfoCircle } from '@arco-design/iconbox-react-ve-o-design';
import { IconSort } from '@arco-design/web-react/icon';
import { i18n } from '@babi/tools';
import { checkIsProd } from '@babi/tools';
import { Button, Divider, RichTextEditor, Trigger } from '@byted-babi/babi-design';
import { formatTime } from '@src/util/utils';

import { BusinessActivityDTO } from 'APP/api-lib/platform/microservice/dashboard';
import { activityTypeMapFn } from 'APP/pages/Workbench/constants';
import { workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import { formatEditorValue } from 'PAGES/Workbench/utils';

import styles from './index.module.less';

interface IScheduleDetail {
  data: BusinessActivityDTO & {
    babi_url: string;
  };
  children?: ReactNode;
}

export const ScheduleDetailPopover = (props: IScheduleDetail) => {
  const { data, children } = props;
  const { title, begin_time, type, end_time, process_reason, desc, babi_url, need_process } = data || {};
  const history = useHistory();

  const openSchedule = () => {
    history.push(babi_url);

    workbenchEventReport(
      {
        action: 'activityPopoverClick',
        context: activityTypeMapFn()[type]?.name,
      },
      true,
    );
  };

  return (
    <Trigger
      className={styles.schedulePopover}
      classNames='zoomInFadeOut'
      boundaryDistance={{ top: 80 }}
      trigger='hover'
      position='right'
      popupAlign={{ right: -50 }}
      mouseEnterDelay={200}
      mouseLeaveDelay={200}
      popup={() => (
        <div className={styles.popoverContainer}>
          <div className={styles.popoverHeader}>
            <div className={styles.popoverTitle}>{title}</div>
            <div className={styles.popoverDate}>
              <IconAlarmClock className={styles.popoverDateIcon} />
              <span>{`${formatTime(begin_time, 'MM-DD HH:mm:ss')} ~ ${formatTime(end_time, 'MM-DD HH:mm:ss')}`}</span>
              {need_process && (
                <>
                  <Divider className={styles.divider} type='vertical' />
                  <div className={styles.activityRemainTag}>{i18n.t('k2177823539', {}, '待我处理')}</div>
                </>
              )}
            </div>
          </div>
          {process_reason && (
            <>
              <div className={styles.popoverDescriptionTitle}>
                <IconInfoCircle className={styles.popoverDescriptionTitleIcon} />
                {i18n.t('k3925245900', {}, '待我处理原因')}
              </div>
              <div className={styles.reasonContainer}>
                {process_reason?.split('\n').map(item => (
                  <div className={styles.reasonItem} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className={styles.popoverDescriptionTitle}>
            <IconSort className={styles.popoverDescriptionTitleIcon} />
            {i18n.t('k2344561301', {}, '活动详情')}
          </div>
          <div className={styles.popoverContent}>
            <RichTextEditor
              env={checkIsProd() ? 'online' : 'boe'}
              editable={false}
              className={styles.popoverDescription}
              value={formatEditorValue(desc)}
              customToolbarId='scheduleDetailPopover-toolbarId'
            ></RichTextEditor>
          </div>

          <div className={styles.popoverFooter}>
            <Button type='primary' onClick={openSchedule}>
              {i18n.t('k1916016080', {}, '参加此活动')}
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </Trigger>
  );
};
