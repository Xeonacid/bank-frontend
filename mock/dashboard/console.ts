import { Random } from 'mockjs';
import BigNumber from 'bignumber.js';
import { resultSuccess } from '../_util';

const consoleInfo = {
  //余额
  balance: BigNumber(Random.float(60, 100, 2, 2)),
};

export default [
  //主控台 卡片数据
  {
    url: '/api/dashboard/console',
    timeout: 1000,
    method: 'get',
    response: () => {
      return resultSuccess(consoleInfo);
    },
  },
];
