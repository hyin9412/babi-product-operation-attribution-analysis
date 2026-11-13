import React, { useEffect, useState } from 'react';

import { checkIsPre } from '@babi/tools';
import { get } from '@byted/babi_request';

import { AnnouncementDetail } from 'APP/api-lib/platform/microservice/announcement';
import { platformServiceClient } from 'APP/api-lib/platform/microservice/bytedance_babi_platform_service';
import { TodoItem } from 'APP/api-lib/platform/microservice/dashboard';
import { AlarmRecordAgg } from 'APP/api-lib/platform/microservice/monitor';
import { permissionServiceClient } from 'APP/api-lib/platform/permission/permission_service';
import tccAPI from 'APP/public/api/v3/common/tcc';
import { useGetMonitorGrayConfig } from 'PAGES/MonitorAlarm/hooks/useConfig';
import { PermissionAlarmObjectTypeOpts } from 'PAGES/MonitorAlarmManage/MonitorManage/constants';
import { getCloudDomain } from 'PAGES/Workbench/utils';

import OperationAndSuggest, { PRODUCT_RESOURCE_TYPE } from '../component/OperationAndSuggest';
import AlarmCard from './component/alarmCard';
import ApprovalCard from './component/approvalCard';
import HelpCenter, { HelpCenterInfo } from './component/helpCenter';
import Notice from './component/notice';
import RoleCard, { RoleData } from './component/roleCard';

import styles from './index.module.less';

/**
 * 工作台右侧内容组件
 * 包含：重要通知、待处理报警、待审批工单、我的角色、帮助中心
 */
const RightContent: React.FC = () => {
  const [helpCenterInfo, setHelpCenterInfo] = useState<HelpCenterInfo>({});
  const [noticeList, setNoticeList] = useState<AnnouncementDetail[]>([]);
  const [approvalData, setApprovalData] = useState<TodoItem[]>([]);
  const [cloudFlowTotal, setCloudFlowTotal] = useState<number>(0);
  const [roleData, setRoleData] = useState<RoleData>({ expiry: 0, all: 0 });
  const [alarmData, setAlarmData] = useState<AlarmRecordAgg[]>([]);

  const { grayConfig } = useGetMonitorGrayConfig();
  const alarmCardList = PermissionAlarmObjectTypeOpts(grayConfig);

  const getApprovalData = async () => {
    try {
      const res = await platformServiceClient.GetTodo({});
      setApprovalData(res?.data?.todos || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getCloudFlowData = async () => {
    try {
      const res = await get<{ total: number }>(
        `${getCloudDomain()}/api/v1/bytecloud_platform_api/v1/cloud_ticket/audit/list?approval_source=sourceGroup|babi&end_time=1758556799&page=1&page_size=10&start_time=1750521600&ticket_status_list=3`,
      )();
      setCloudFlowTotal(res?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const getRoleData = async () => {
    const params = {
      page: {
        page_size: 1,
        current_page: 1,
      },
    };

    try {
      const [expiryData, allData] = await Promise.all([
        await permissionServiceClient.ListUserPermission({
          ...params,
          advent: true,
        }),
        await permissionServiceClient.ListUserPermission({
          ...params,
          advent: false,
        }),
      ]);
      setRoleData({
        expiry: expiryData?.page?.total || 0,
        all: allData?.page?.total || 0,
      });
    } catch (error) {
      console.error(error);
    }
  };
  const getHelpCenter = async () => {
    try {
      const res = await tccAPI.getStaticConfig({
        service: checkIsPre() ? 'data.babi.platform_pre' : 'data.babi.platform',
        key: 'help_center',
      });
      setHelpCenterInfo(res);
    } catch (error) {
      console.error(error);
    }
  };

  const getNotice = async () => {
    try {
      const { data } = await platformServiceClient.ListAnnouncementForUser({
        size: 3,
        page: 1,
        orders: [{ field: 'start_time', asc: false }],
      });
      setNoticeList(data?.announcements || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getAlarm = async () => {
    try {
      const { data } = await platformServiceClient.ListAlarmRecordAgg({});
      setAlarmData(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getData = async () => {
    await Promise.all([getNotice(), getApprovalData(), getCloudFlowData(), getRoleData(), getHelpCenter(), getAlarm()]);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className={styles.rightContent}>
      {/* 重要通知 */}
      <Notice noticeList={noticeList} closeCallback={getNotice} />

      {/* 经营力表现：个人视图不依赖主体筛选，商品选项与经营力表现详情页保持同源并由卡片内兜底选择有效商品。 */}
      <OperationAndSuggest resourceType={PRODUCT_RESOURCE_TYPE} resourceIds={[]} useFullProductOptions />

      {/* 待处理报警 */}
      {alarmCardList?.length > 0 && <AlarmCard cardList={alarmCardList} alarmData={alarmData} />}

      {/* 待审批工单 */}
      <ApprovalCard approvalData={approvalData} cloudFlowTotal={cloudFlowTotal} />

      {/* 我的角色 */}
      <RoleCard roleData={roleData} />

      {/* 帮助中心 */}
      <HelpCenter helpCenterInfo={helpCenterInfo} />
    </div>
  );
};

export default RightContent;
