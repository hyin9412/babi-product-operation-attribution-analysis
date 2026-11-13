import React, { FC, useEffect, useMemo, useRef } from 'react';

import {
  globalStore,
  i18n,
  IamService,
  icon,
  initTea,
  isBoe,
  mobxReact,
  projectConfig,
  useMenuObservable,
  useUnifiedApplyAuth,
  // @ts-ignore
} from '@babi/tools';
import { Alert, Divider, Layout } from '@byted-babi/babi-design';
import classNames from 'classnames';

import { isAnalysisEmbedRoute } from 'APP/constants/page';
import { shouldAutoOpenApplyAuth } from 'TOOLS_COMPONENTS/UnifiedApplyAuthDrawer/urlParams';

import * as MenuDropdown from '../Dropdown';
import EnvTip from '../EnvTip';
// import * as PermissionModal from '../Permission';
import MenuSider from './Sider';
import TimeZone from './TimeZone';
import { CanvasWM } from './Watermark';

import styles from './index.less?module';

const isBeijing = new Date().getTimezoneOffset() === -480;
const { observer } = mobxReact;

const { Header } = Layout;
const TITLE = getTitle();
const canVisibleI18n = projectConfig.FeatGrayMap?.CanVisibleI18n;

function getTitle() {
  if (isBoe) {
    return (
      <div style={{ width: '100%', color: '#fff', textAlign: 'center', fontSize: '30px' }}>
        BABI
        <span style={{ color: '#ee4d38', paddingLeft: 10 }}>boe</span>
      </div>
    );
  }
  return (
    <div className={styles['layout-title']}>
      <img style={{ height: '24px' }} src={icon.newTitle}></img>
      <Divider style={{ height: '8px', marginLeft: '8px', marginRight: '8px' }} type='vertical' />
      <span style={{ color: '#42464E', fontSize: '13px' }}>
        {i18n.t('make_business_more_targeted__efficient__and_intelligent', {}, '让经营有目标、更高效、更智能')}
      </span>
    </div>
  );
}

const Page: FC = (): JSX.Element | null => {
  const notificationConfig = useMemo(() => projectConfig.notificationConfig, []);
  const isEmbedRoute = isAnalysisEmbedRoute();
  const { open: openApplyAuthDrawer } = useUnifiedApplyAuth();
  // const [activePermissionKey, setActivePermissionKey] = useState<string>('');
  const userNameRef = useRef<string>('');
  const [menuState] = useMenuObservable(); // 观察菜单栏展开状态

  const configInitTea = async () => {
    try {
      const data = await IamService.getUserAcls({
        only_direct: true,
        include_role_names: 'babi.cost_manager.cn,owner',
        user: window.__user.username,
      });
      initTea({ byteTreeRoles: data });
    } catch (error) {
      initTea();
    } finally {
      window.TEA.event('initial_side_menu_collapsed', { collapsed: menuState });
    }
  };

  // const applyPermission = (key: string) => {
  //   setActivePermissionKey(key);
  // };

  // const cancelApplyPermission = () => {
  //   setActivePermissionKey('');
  // };

  const setWatermark = ({ userName, hiddenWmBgImg }: any) => {
    if (userName !== userNameRef.current) {
      try {
        CanvasWM({
          content: userName,
          hiddenWmBgImg,
        });
      } catch (e) {
        console.error(e);
      }
      userNameRef.current = userName;
    }
  };

  useEffect(() => {
    // init埋点
    configInitTea();
    setWatermark({
      userName: `${window.__user.nickname}    ${window.__user.username}`,
      hiddenWmBgImg: window.__hiddenWm,
    });
  }, []);

  useEffect(() => {
    // 放在全局布局层处理，确保普通页面和嵌入页面的直达链接都能打开申请权限抽屉。
    if (shouldAutoOpenApplyAuth(window.location.search)) {
      openApplyAuthDrawer();
    }
  }, [openApplyAuthDrawer]);

  function getNotificationFromTCC(jsonConfig) {
    const config = jsonConfig || {};
    if (config && config.visible && config.content) {
      return <Alert type={config.type || 'warning'} content={config.content} />;
    }
  }

  return (
    <Layout className={globalStore.fullscreen ? classNames(styles.container, styles.fullscreen) : styles.container}>
      {window._babi_load_error_page || isEmbedRoute ? null : (
        <>
          <div className={styles['layout-navbar']}>
            <Header className={styles.navbar} style={isBoe ? { backgroundColor: '#333232', color: 'white' } : {}}>
              <EnvTip />
              <div className={styles.left}>
                <div className={styles.logo}>{TITLE}</div>
                {/* <Roles /> */}
                <div className={styles.notice}>{getNotificationFromTCC(notificationConfig)}</div>
                {!isBeijing && <TimeZone />}
              </div>
              <ul className={styles.right}>
                <li>
                  <MenuDropdown.Operation />
                </li>
                <li>
                  <MenuDropdown.Flow />
                </li>
                <li>
                  <MenuDropdown.Permission />
                </li>
                <li>
                  <MenuDropdown.SubscriptionMenu />
                </li>
                <li>
                  <MenuDropdown.Docs />
                </li>
                <li>
                  <MenuDropdown.Export />
                </li>
                <li>
                  <MenuDropdown.Notice />
                </li>
                {canVisibleI18n && (
                  <li>
                    <MenuDropdown.I18N />
                  </li>
                )}
                <li>
                  <MenuDropdown.User user={window.__user} />
                </li>
              </ul>
            </Header>
          </div>
          <MenuSider />
          {/* <PermissionModal.ServiceTree
            visible={activePermissionKey === 'serviceTree'}
            onCancel={cancelApplyPermission}
          /> */}
        </>
      )}
    </Layout>
  );
};

export default observer(Page);
