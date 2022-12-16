import { http } from '@/utils/http/axios';

//获取余额信息
export function getBalanceInfo() {
  return http.request({
    url: '/balance',
    method: 'get',
  });
}
