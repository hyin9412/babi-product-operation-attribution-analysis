import React from 'react';

import { i18n, permissionExpiryCount, useUnifiedApplyAuth } from '@babi/tools';
import { Dropdown, Menu } from '@byted-babi/babi-design';

import { history } from 'APP/app';

import styles from './index.less?module';

// 二级产品线权限申请角色列表（为兼容其他模块的依赖导出，尽管当前菜单未直接使用）
export const SecondProductlineRoles = {
  first_product_owner: i18n.t('secondary_product_line_owner', {}, '二级产品线负责人'),
  first_product_finance_bp: i18n.t('level_2_product_line_finance_bp', {}, '二级产品线财务BP'),
  first_product_hrbp: i18n.t('secondary_product_line_hrbp_2', {}, '二级产品线HRBP'),
  volc_first_product_hc_owner: i18n.t('level_2_product_line_human_interface_person', {}, '二级产品线人力接口人'),
};

const PermissionDropdown = (): JSX.Element => {
  const { open } = useUnifiedApplyAuth();
  const [expiryCount, setExpiryCount] = React.useState<number | undefined>();

  // 检查并刷新权限续期提示的状态
  const checkExpiryDate = async () => {
    try {
      const cnt = await permissionExpiryCount();
      setExpiryCount(cnt);
    } catch (e) {
      // ignore
    }
  };

  React.useEffect(() => {
    // 首次挂载时先拉一次数据
    checkExpiryDate();

    // 监听业务侧派发的续期刷新事件
    const handler = () => {
      checkExpiryDate();
    };

    window.addEventListener('permissionExpiryRefresh', handler);

    return () => {
      window.removeEventListener('permissionExpiryRefresh', handler);
    };
  }, []);

  return (
    <div className={styles.menuItem} id='perm-hint-container'>
      <Dropdown
        trigger='hover'
        droplist={
          <Menu className={styles.dropdownWrapper} style={{ width: 'auto' }}>
            <Menu.Item
              key='myAuth'
              onClick={() => {
                window.TEA.event('click_navbar', {
                  title: i18n.t('Permissions', {}, '权限'),
                  value: i18n.t('my_permissions', {}, '我的权限'),
                });
                history.push('/finance/auth');
              }}
              className={styles.permission}
            >
              <span style={{ marginRight: 8 }}>{i18n.t('my_permissions', {}, '我的权限')}</span>
              {expiryCount > 0 && (
                <div className={styles.roleTag}>
                  {i18n.t('k1535802081', { expiryCount: expiryCount }, '{expiryCount}个权限待续期')}
                </div>
              )}
            </Menu.Item>
            <Menu.Item key='apply-unified' onClick={() => open()}>
              {i18n.t('apply_for_permission', {}, '申请权限')}
            </Menu.Item>
          </Menu>
        }
      >
        <div className={styles.permission}>
          {i18n.t('rights_management', {}, '权限管理')}
          {expiryCount > 0 && (
            <div className={styles.roleTag} style={{ marginBottom: 26 }}>
              {i18n.t('renew_short', {}, '续')}
            </div>
          )}
        </div>
      </Dropdown>
    </div>
  );
};

export default PermissionDropdown;
