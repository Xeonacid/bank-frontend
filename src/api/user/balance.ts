import { http } from '@/utils/http/axios';

//获取余额信息
export function getBalanceInfo(id: string) {
  return http.request({
    url: `/balance?id=${id}`,
    method: 'get',
  });
}
