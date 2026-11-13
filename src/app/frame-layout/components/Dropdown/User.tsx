import React, { useEffect, useState } from 'react';

import {
  BABI_USER_CURRENT_ROLE,
  checkIsPre,
  i18n,
  PermissionService,
  projectConfig,
  //@ts-ignore
} from '@babi/tools';
import { useMounted } from '@byted/hooks';
import { Avatar, Button, Dropdown, Menu, Message, Modal, SelectBlock, Switch } from '@byted-babi/babi-design';

import tccAPI from 'APP/public/api/v3/common/tcc';
import SearchIcon from 'APP/public/component/SmartWord/SearchIcon';

// import { observer } from 'mobx-react';
// import { AutoTipController } from 'APP/component/AutoTip/autotip';
// import { OperatingSystem, OS } from 'APP/util/os';
import styles from './index.less?module';

const service = checkIsPre() ? 'data.babi.platform_pre' : 'data.babi.platform';

export function selectFilterOption(inputValue, option) {
  const iv = String(inputValue).toLowerCase();
  return (
    String(option.props.value).toLowerCase().indexOf(iv) >= 0 ||
    String(option.props.children).toLowerCase().indexOf(iv) >= 0
  );
}
interface SelectOption {
  value: string;
  label: string;
}

// const AutoTip = observer(() => {
//   const value = AutoTipController.status.get();
//   const handleChange = () => {
//     if (value) {
//       AutoTipController.dispose();
//       return;
//     }

//     AutoTipController.start();
//   };

//   return (
//     <div
//       style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//       }}
//     >
//       <span>
//         <span>{i18n.t('entry', {}, '词条')}</span>
//         {OS === OperatingSystem.Macintosh && <span className={styles.keybind}>⌘K + T</span>}
//       </span>
//       <span>
//         <Switch checked={value} onChange={handleChange} />
//       </span>
//     </div>
//   );
// });

const UserMenu = (props: any): JSX.Element => {
  const [smartWordEnabled, setSmartWordEnabled] = useState<boolean>(
    window.localStorage.getItem('BABI_SMART_WORD') === 'true',
  );
  const [smartWordVisible, setSmartWordVisible] = useState<boolean>(false);

  const canSwitchRoles = projectConfig.FeatGrayMap.CanSwitchRoles;

  const { user } = props;
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  const [selectLoading, setSelectLoading] = useState<boolean>(true);

  async function initSwitch() {
    try {
      const agentConfig = await tccAPI.getStaticConfig({
        service,
        key: 'babi_agent',
      });
      const smartWordVisibleValue = agentConfig?.smart_word_visible || false;
      setSmartWordVisible(smartWordVisibleValue);

      if (smartWordVisibleValue && !window.localStorage.getItem('BABI_SMART_WORD')) {
        window.localStorage.setItem('BABI_SMART_WORD', 'true');
        setSmartWordEnabled(true);
      }
    } catch {
      setSmartWordVisible(false);
    }
  }

  useEffect(() => {
    initSwitch();
  }, []);

  function logout() {
    window.bytecloudLogout();
  }

  function clickLogout() {
    Modal.confirm({
      title: i18n.t('logout_c', {}, '退出确认'),
      content: i18n.t('are_you_sure_logout', {}, '确定要退出登录吗？'),
      onOk: logout,
    });
  }

  const onChangeSmartWord = (checked: boolean) => {
    setSmartWordEnabled(checked);
    window.localStorage.setItem('BABI_SMART_WORD', checked.toString());

    window?.TEA?.event('smart_word', {
      title: 'switch',
      content: checked,
    });
  };

  const name = (
    <span>
      <Avatar
        size={28}
        style={{
          position: 'relative',
          marginLeft: '8px',
          marginRight: '8px',
          cursor: 'pointer',
        }}
      >
        <img src={user.picture} draggable='false' />
      </Avatar>
      {/* <span>{user.nickname}</span> */}
    </span>
  );

  // 获取用户列表
  const listSelectRoles = async () => {
    try {
      setSelectLoading(true);
      const data = await PermissionService.ListSelectRoles();
      setSelectOptions(data.map(info => ({ value: info.role, label: info.name })));
      return data;
    } catch (error) {
      console.error(error);
    } finally {
      setSelectLoading(false);
    }
  };

  const onVisibleChange = async (visible: boolean) => {
    if (!visible) {
      return;
    }
    listSelectRoles();
  };

  const switchRoles = async () => {
    try {
      const roles = selectKeys;
      // if (!selectKeys.length) {
      //   roles = selectOptions.map(option => option.value);
      // }
      await PermissionService.SelectRole({
        roles,
      });
      localStorage.setItem(
        BABI_USER_CURRENT_ROLE,
        JSON.stringify(selectOptions.filter(option => roles.includes(option.value))),
      );
      Message.success({
        content: i18n.t('the_switch_was_successful__the_page_is_being_refreshed___', {}, '切换成功，正在刷新页面...'),
        duration: 500,
        onClose() {
          window.location.reload();
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const checkLastSelectRoles = async () => {
    try {
      const data = await listSelectRoles();
      const keys = data.reduce((acc, cur) => {
        cur.select && acc.push(cur.role);
        return acc;
      }, []);
      setSelectKeys(keys);
    } catch (error) {
      console.error(error);
    }
  };

  useMounted(() => {
    canSwitchRoles && checkLastSelectRoles();
  });

  return (
    <div className={styles.menuItem} key='name'>
      <Dropdown
        onVisibleChange={onVisibleChange}
        droplist={
          <Menu
            className={styles.dropdownWrapper}
            style={canSwitchRoles ? { width: 300 } : {}}
            onClickMenuItem={key => {
              return key !== 'smartWord';
            }}
          >
            <div className={styles.userInfo}>
              <img alt='avatar' src={user.picture} style={{ width: '43px', height: '43px', borderRadius: '50%' }} />
              <div>
                <div>{user.nickname}</div>
                <p style={canSwitchRoles ? { width: 200 } : {}}>{user.email}</p>
              </div>
            </div>
            {canSwitchRoles && (
              <Menu.SubMenu
                key='switch-role'
                className={styles.switch}
                style={{ justifyContent: 'center' }}
                title={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <SelectBlock
                      style={canSwitchRoles ? { width: 200 } : { width: 143 }}
                      size='small'
                      loading={selectLoading}
                      value={selectKeys}
                      options={selectOptions}
                      triggerProps={{
                        style: { zIndex: 100 },
                        autoAlignPopupMinWidth: true,
                        autoAlignPopupWidth: false,
                        position: 'bl',
                      }}
                      mode='multiple'
                      placeholder={i18n.t('All', {}, '全部')}
                      onChange={setSelectKeys}
                      allowClear={true}
                    ></SelectBlock>
                    <Button type='primary' size='small' onClick={switchRoles}>
                      {i18n.t('switch_roles', {}, '切换角色')}
                    </Button>
                  </span>
                }
              ></Menu.SubMenu>
            )}
            {smartWordVisible && (
              <Menu.Item key='smartWord'>
                <div style={{ display: 'flex' }}>
                  <span style={{ display: 'inline-block', lineHeight: '28px' }}>
                    <SearchIcon />
                  </span>
                  <span>{i18n.t('k1014357158', {}, '选词查询')}</span>
                  <Switch
                    checked={smartWordEnabled}
                    onChange={onChangeSmartWord}
                    style={{ marginLeft: 'auto', marginTop: 6 }}
                  />
                </div>
              </Menu.Item>
            )}
            {/* <Menu.Item key='autotip' className={styles.quit}>
              <AutoTip />
            </Menu.Item> */}
            <Menu.Item key='logout' className={styles.quit} onClick={clickLogout}>
              {i18n.t('Log_out', {}, '退出登陆')}
            </Menu.Item>
          </Menu>
        }
        position='br'
        trigger='click'
      >
        <span className={styles.dropdown}>{name}</span>
      </Dropdown>
    </div>
  );
};

export default UserMenu;
