import FrameLayout from './frame-layout';
import Workbench from './pages/Workbench';
import { recordRouteChange, resourceUrlMapMenu } from './pages/Workbench/utils';
import pageStyle from './public/component/Page/layout.less?module';
import { projectConfig, useMenuObservable } from '@babi/tools';
import { useEffect } from 'react';

// References: modified from template shell — allow the new PRD analysis page in the existing content outlet.
export const BabiWorkspaceShell = ({ children }: { children?: React.ReactNode }) => {
  const [collapse] = useMenuObservable();

  const fillMenuMap = (menus: any[]) => {
    menus.forEach(menu => {
      if (menu.ResourceUrl) {
        // References: modified from template menu lookup — live menu URLs mix trailing slashes; preserve recent-visit lookup in both forms.
        const route = menu.ResourceUrl.replace(/\/$/, '');
        resourceUrlMapMenu[route] = menu;
        resourceUrlMapMenu[`${route}/`] = menu;
      }
      if (menu.Children?.length) fillMenuMap(menu.Children);
    });
  };
  fillMenuMap(projectConfig.allMenus || []);
  // References: modified from template shell — retain the existing historical recent-visit label without inventing a visible online sidebar entry.
  resourceUrlMapMenu['/finance/flow/list/'] = { MenuName: '工单列表', Icon: 'IconVerticalRectTask' };

  useEffect(() => {
    window._babi_pre_interface.allMenus = projectConfig.allMenus;
    recordRouteChange();
  }, []);

  return (
    <>
      <FrameLayout />
      <div className={pageStyle.container}>
        <div
          style={{
            background: '#fff',
            position: 'relative',
            padding: collapse ? '48px 0px 0px 68px' : '48px 0px 0px 200px',
            transition: 'padding .2s cubic-bezier(0.34, 0.69, 0.1, 1)',
            zIndex: 1,
            minHeight: '100vh',
          }}
        >
          <div id='layout-content' className={pageStyle.content}>
            <div style={{ width: '100%', flex: 1 }}>
              {children || <Workbench />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
