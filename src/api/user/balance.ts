import { http } from '@/utils/http/axios';
import { BasicResponseModel } from '@/api/system/user';

//获取余额信息
export function getBalanceInfo(id: string) {
  return http.request({
    url: `/balance?id=${id}`,
    method: 'get',
  });
}

export function balanceUpdate(params) {
  return http.request<BasicResponseModel>(
    {
      url: '/balance/update',
      method: 'POST',
      params,
    },
    {
      isTransformResponse: false,
    }
  );
}
