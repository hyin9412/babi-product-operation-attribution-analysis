import React from 'react';

import {
  mobxReact,
  projectConfig,
  // @ts-ignore
} from '@babi/tools';
import { Message } from '@byted-babi/babi-design';
import moment from 'moment-timezone';

import Layout from './components/Layout';

const { observer } = mobxReact;
moment.tz.setDefault('Asia/Shanghai');

export default observer(function render() {
  Message.config({
    maxCount: 5,
  });
  const { hiddenWMConfig = {} } = projectConfig;
  window.__user = projectConfig.User;
  window.__hiddenWm = hiddenWMConfig.data && hiddenWMConfig.data.url ? hiddenWMConfig.data.url : undefined;

  return <Layout />;
});
