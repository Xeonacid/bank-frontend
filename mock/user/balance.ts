import { Random } from 'mockjs';
import Decimal from 'decimal.js';
import { resultSuccess } from '../_util';

const BalanceInfo = {
  //余额
  balance: new Decimal(Random.float(60, 100, 2, 2)),
};

export default [
  //主控台 卡片数据
  {
    url: '/api/balance',
    timeout: 1000,
    method: 'get',
    response: () => {
      return resultSuccess(BalanceInfo);
    },
  },
];
