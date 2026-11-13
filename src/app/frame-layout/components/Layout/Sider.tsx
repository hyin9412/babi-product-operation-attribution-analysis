import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  appPerformance,
  i18n,
  Link,
  RenderMenuIcon,
  TailorMenuCategoryEnum,
  useMenuObservable,
  usePages,
  //@ts-ignore
} from '@babi/tools';
import { Layout, Switch } from '@byted-babi/babi-design';
import { XSideMenu } from '@tod-m/materials';
import { useLocation } from 'react-router-dom';

import '@tod-m/materials/es/XSideMenu/style/index.less';
import styles from './index.less?module';

const Sider = Layout.Sider;

const navbarHeight = 48;

function SiderMenu(): JSX.Element {
  // References: modified from toutiao-fe-vcloud-finance/apps/web/src/app/frame-layout/components/Layout/Sider.tsx.
  // Match the verified online workspace default (permission-filtered menu); use the prototype's hash location.
  const location = useLocation();
  const [isOpenAll, setIsOpenAll] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>();
  const [menuState, toggle] = useMenuObservable(); // 观察菜单栏展开状态
  const { myMenus, getMenuListByPath } = usePages(TailorMenuCategoryEnum.SIDER);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    const crumbMenus = getMenuListByPath(location.pathname);
    return crumbMenus.length > 0 ? crumbMenus.map(menu => String(menu.Id)) : [];
  });
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const crumbMenus = getMenuListByPath(location.pathname);
    return crumbMenus.length > 0 ? crumbMenus.map(menu => String(menu.Id)) : [];
  });

  const collapsed = useMemo(() => menuState, [menuState]);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  // References: copied from toutiao-fe-vcloud-finance/apps/web/src/app/frame-layout/components/Layout/Sider.tsx:28-49 — same 68px collapsed width as XSideMenu and the content gutter.
  const menuWidth = useMemo(() => (collapsed && !isHovered ? 68 : 200), [collapsed, isHovered]);
  const collapsedRef = useRef(collapsed);

  // 发布菜单栏最新状态
  const toggleCollapse = () => {
    if (isHovered) {
      setIsHovered(false);
    } else {
      toggle();

      window.TEA.event('click_side_menu_collapsed', { pre_collapsed: collapsed });
    }
  };

  const switchMenu = val => {
    setIsOpenAll(val);
  };

  const onClickSubMenu = (_1: string, openKeys: string[]) => {
    setOpenKeys(openKeys);
  };

  const handleMouseLeave = () => {
    if (isHovered) {
      setIsHovered(false);
    }
  };

  const transformMenu = (menus: any[] = [], collapsed, isOpenAll = false) => {
    const filterFn = (info: any) => {
      if (isOpenAll) {
        return info.IsVisible;
      }
      return info.HasPermission && info.IsVisible;
    };
    return menus.filter(filterFn).map(info => {
      const isFolder = !info.ResourceUrl;
      const visibleChildren =
        isFolder && info.Children?.length ? transformMenu(info.Children, collapsed && !isHovered, isOpenAll) : [];
      const starlingName = info.StarlingKey ? i18n.t(info.StarlingKey, {}, info.MenuName) : info.MenuName;
      const iconStyle = collapsed && !isHovered ? styles['menu-item-icon-collapsed'] : styles['menu-item-icon'];

      if (isFolder) {
        return {
          key: info.Id,
          text: info.MenuName,
          display: (
            <span
              className={styles['menu-item-content']}
              style={{
                height: '36px',
                color: 'black',
                marginLeft: info.Level == 2 && visibleChildren.length > 0 ? '-5px' : '0',
              }}
            >
              {info.Icon && <span className={iconStyle}>{RenderMenuIcon(info.Icon)}</span>}
              <span style={info.Icon ? { color: 'black' } : { color: 'black' }}>{starlingName}</span>
            </span>
          ),
          children: visibleChildren.length ? visibleChildren : { key: 'null', text: '', display: <></> },
        };
      }
      const isIndex = info.Level === 1 && !!info.ResourceUrl;
      const renderMenuItem = (isIndex: boolean) => {
        switch (isIndex) {
          case true:
            return (
              <div
                onClick={() => {
                  appPerformance.routerLoad({}, info);

                  window.TEA.event('click_sidebar', {
                    title: info.MenuName,
                    value: info.MenuName,
                  });
                }}
              >
                <Link
                  to={info.ResourceUrl}
                  replace={false}
                  appRouter={false}
                  style={
                    collapsed && !isHovered
                      ? { display: 'flex', alignSelf: 'flex-end' }
                      : { display: 'block', width: '110%', height: '36px' }
                  }
                  className={styles['menu-item-content']}
                >
                  {info.Icon && <span className={iconStyle}>{RenderMenuIcon(info.Icon)}</span>}
                  <span>{starlingName}</span>
                </Link>
              </div>
            );
          default:
            return (
              <div
                onClick={() => {
                  appPerformance.routerLoad({}, info);

                  window.TEA.event('click_sidebar', {
                    title: info.MenuName,
                    value: info.MenuName,
                  });
                }}
              >
                <Link
                  to={info.ResourceUrl}
                  replace={false}
                  appRouter={false}
                  style={{ marginLeft: info.Level == 3 ? '16px' : '0', display: 'block', width: '110%' }}
                  className={styles['menu-item-content']}
                >
                  {info.Icon && <span className={iconStyle}>{RenderMenuIcon(info.Icon)}</span>}
                  {starlingName}
                </Link>
              </div>
            );
        }
      };

      return {
        key: info.Id,
        text: info.MenuName,
        display: renderMenuItem(isIndex),
      };
    });
  };

  const handleMouseEnter = () => {
    if (collapsedRef.current === true) {
      setIsHovered(true);
    }
  };

  // References: modified from toutiao-fe-vcloud-finance/apps/web/src/app/frame-layout/components/Layout/Sider.tsx:178-209.
  // Preserve hover expansion; remove listeners on cleanup and synchronize selection with HashRouter navigation.
  useEffect(() => {
    const target = menuRef.current?.querySelectorAll('.tod-side-menu-menus-wrapper');
    collapsedRef.current = collapsed;
    target?.forEach(element => element.addEventListener('mouseenter', handleMouseEnter));
    return () => target?.forEach(element => element.removeEventListener('mouseenter', handleMouseEnter));
  }, [collapsed]);

  useEffect(() => {
    const activeKeys = getMenuListByPath(location.pathname).map(menu => String(menu.Id));
    setOpenKeys(activeKeys);
    setSelectedKeys(activeKeys);
  }, [location.pathname, getMenuListByPath]);

  return (
    <Sider
      className={styles['layout-sider']}
      width={menuWidth}
      collapsed={collapsed && !isHovered}
      trigger={null}
      collapsible
      breakpoint='xl'
      style={{ width: menuWidth, paddingTop: navbarHeight }}
      ref={menuRef}
      onCollapse={() => {}}
    >
      <div className={styles['menu-wrapper']} onMouseLeave={handleMouseLeave}>
        <XSideMenu
          className={styles['menu-xSiderMenu']}
          menuProps={{
            selectedKeys: selectedKeys,
            openKeys: openKeys,
            ellipsis: false,
            collapse: collapsed && !isHovered,
            onClickSubMenu: onClickSubMenu,
            tooltipProps: { disabled: true },
          }}
          menuOptions={transformMenu(myMenus, collapsed && !isHovered, isOpenAll)}
          showOverview={false}
          onClickCollapseBtn={toggleCollapse}
          onCollapse={() => {}}
        />
        {(!collapsed || isHovered) && (
          <div className={styles['switch-btn']}>
            <span className={styles['switch-btn-label']}>{i18n.t('All_Menu', {}, '全部菜单')}</span>
            <Switch onChange={switchMenu} size='small' checked={isOpenAll} />
          </div>
        )}
      </div>
    </Sider>
  );
}

export default SiderMenu;
