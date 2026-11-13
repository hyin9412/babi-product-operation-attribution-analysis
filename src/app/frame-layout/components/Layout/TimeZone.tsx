import React, { Component } from 'react';

import {
  i18n,
  // @ts-ignore
} from '@babi/tools';
import moment from 'moment-timezone';

import style from './index.less?module';

const isBeijing = new Date().getTimezoneOffset() === -480;

class App extends Component {
  state = {
    time: '',
  };

  async componentDidMount() {
    if (!isBeijing) {
      this.getTime();
    }
  }

  getTime = () => {
    this.setState(
      {
        time: moment().format('MM-DD HH:mm:ss'),
      },
      () => {
        setTimeout(() => this.getTime(), 1000);
      },
    );
  };

  render() {
    return (
      <div className={style.timeZone}>
        {i18n.t('beijing_time_{placeholder1}', { placeholder1: this.state.time }, '北京时间  {placeholder1}')}
      </div>
    );
  }
}

export default App;
