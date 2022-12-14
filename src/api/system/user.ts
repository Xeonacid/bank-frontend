import { http } from '@/utils/http/axios';

export interface BasicResponseModel<T = any> {
  status: boolean;
  message: string;
}

export interface BasicPageParams {
  pageNumber: number;
  pageSize: number;
  total: number;
}

/**
 * @description: 用户登录
 */
export function login(params) {
  return http.request<BasicResponseModel>(
    {
      url: '/login',
      method: 'POST',
      params,
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * @description: 用户注册
 */
export function register(params) {
  return http.request<BasicResponseModel>(
    {
      url: '/register',
      method: 'POST',
      params,
    },
    {
      isTransformResponse: false,
    }
  );
}
