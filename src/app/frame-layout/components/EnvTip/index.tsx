import React, { useRef } from 'react';
import Draggable from 'react-draggable';

import { IconWarn } from '@arco-design/iconbox-react-babi';
import { checkIsPre, checkIsProd, i18n } from '@babi/tools';
import { useSize } from '@byted/hooks';

import { CanaryType } from '../../enums';

const grayIdMap = {
  boe: 2338510,
  ppe: 2350836,
  online: 2338544,
};

const EnvTip = () => {
  const [, size] = useSize(document.body);
  const eleRef = useRef<HTMLDivElement>();

  const rightLimit = Math.max(size.width, 1200) - 662 - (eleRef.current?.clientWidth || 0);

  const { env, canary, extra, envName } = window.gfdatav1 ?? {};

  const canaryType = extra?.canaryType ?? CanaryType.UnKnown;

  const getRegion = () => {
    if (location.hostname === 'localhost' || !window.gfdatav1) {
      return i18n.t('local', {}, '本地');
    }
    // BOE
    if (env === 'boe') {
      if (canary === 0) {
        return i18n.t('offline_boe_return', {}, '线下 BOE 回归');
      }
      if (canary === grayIdMap.boe) {
        return i18n.t('k325662423', {}, '灰度 BOE 回归');
      }
      return i18n.t('offline_test_test', {}, '线下 TEST 测试');
    }
    if (checkIsPre()) {
      return i18n.t('offline_pre_test', {}, '线下 PRE 测试');
    }
    // PPE
    if (canaryType === CanaryType.Test) {
      if (canary === grayIdMap.ppe) {
        return i18n.t('k754676264', {}, '灰度 PPE 测试');
      }
      if (canary !== 0) {
        return i18n.t('online_ppe_test', {}, '线上 PPE 测试');
      }
    }
    return i18n.t(
      'non_online_environment__non_existing_environment__please_operate_with_caution',
      {},
      '非线上环境，非已有环境，请谨慎操作',
    );
  };

  // 线上 & 线上灰度不需要获取环境信息
  // 线上非小流量环境 + 正式小流量全部隐藏
  // canaryType !== CanaryType.Test 过滤掉线上测试小流量，也就是 ppe
  const isHide = checkIsProd() && (canary === 0 || canary === grayIdMap.online || canaryType !== CanaryType.Test);

  if (isHide) {
    return null;
  }

  return (
    <Draggable axis='x' defaultPosition={{ x: 410, y: 2 }} bounds={{ left: 0, right: rightLimit }}>
      <div
        ref={eleRef}
        style={{
          backgroundColor: '#fef8eb',
          cursor: 'move',
          height: 44,
          padding: '0 12px',
          position: 'absolute',
          zIndex: 9999,
          borderRadius: 4,
          color: 'rgba(0, 0, 0, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <IconWarn useCurrentColor={false} style={{ width: 16, height: 16, marginRight: 6 }} />
          <span style={{ fontWeight: 500, fontSize: 16 }}>
            {i18n.t('current_environment_', {}, '当前环境：')}
            <span>{getRegion()}</span>
          </span>
          <span style={{ marginLeft: 12 }}>
            {i18n.t('front_end_resources_', {}, '前端资源：')}
            {canary ? (
              <a href={`https://deploy.bytedance.net/channel/${canary}/deploy`}>
                {envName !== 'boe' && envName !== 'prod' ? envName : canary}
              </a>
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>
    </Draggable>
  );
};

export default EnvTip;
