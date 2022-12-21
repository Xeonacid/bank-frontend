import { http } from '@/utils/http/axios';
import { BasicResponseModel } from '@/api/system/user';
export function transfer(params) {
  return http.request<BasicResponseModel>(
    {
      url: '/order',
      method: 'POST',
      params,
    },
    {
      isTransformResponse: false,
    }
  );
}
