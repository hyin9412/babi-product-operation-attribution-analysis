import { useRef } from 'react';

import { IconClipboardText, IconRight } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Link, Typography } from '@byted-babi/babi-design';

import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';

import styles from '../index.module.less';

export interface HelpCenterInfo {
  docs?: [{ name: string; url: string }];
  helpCenterUrl?: string;
}

const HelpCenter = (props: { helpCenterInfo: HelpCenterInfo }) => {
  const { helpCenterInfo } = props;
  const helpCenterRef = useRef<HTMLDivElement>(null);
  useModuleViewTrace(helpCenterRef, {
    module_name: i18n.t('help_center', {}, '帮助中心'),
  });
  useMouseEnterTrace(helpCenterRef, {
    module_name: i18n.t('help_center', {}, '帮助中心'),
  });
  return (
    <div ref={helpCenterRef} className={styles.cardContent} style={{ marginBottom: '16px' }}>
      <div className={styles.viewMoreHeader}>
        <div className={styles.title}>{i18n.t('help_center', {}, '帮助中心')}</div>
        <Link
          target='_blank'
          href={helpCenterInfo?.helpCenterUrl}
          className={styles.viewMore}
          onClick={() => {
            workbenchEventReport(
              {
                action: 'helpCenterClick',
                context: i18n.t('Read_more', {}, '查看更多'),
              },
              true,
            );
          }}
        >
          <span>{i18n.t('Read_more', {}, '查看更多')}</span>
          <IconRight className={styles.viewMoreIcon} />
        </Link>
      </div>

      <div className={styles.helpList}>
        {helpCenterInfo?.docs?.map(item => (
          <div className={styles.helpItem} key={item?.name}>
            <IconClipboardText className={styles.helpIcon} />
            <Link
              target='_blank'
              href={item?.url}
              style={{ display: 'inline-block', width: '100%' }}
              onClick={() => {
                workbenchEventReport(
                  {
                    action: 'helpCenterClick',
                    context: i18n.t('k2481049231', {}, '查看文档'),
                  },
                  true,
                );
              }}
            >
              <Typography.Ellipsis showTooltip className={styles.helpText}>
                {item.name}
              </Typography.Ellipsis>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCenter;
