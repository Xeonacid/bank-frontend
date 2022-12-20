import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER } from '@/store/mutation-types';

import { getUserInfo, login, register } from '@/api/system/user';
import { storage } from '@/utils/Storage';

export interface IUserState {
  token: string;
  name: string;
  avatar: string;
  permissions: any[];
  info: any;
}

export interface LoginFormState {
  id: string;
  pubKey: string;
  signature: string;
  timestamp: number;
}

export interface RegisterFormState {
  id: string;
  name: string;
  pubKey: string;
  signature: string;
  timestamp: number;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    name: '',
    avatar: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.name;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
    getUserInfo(): object {
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info) {
      this.info = info;
    },
    // 登录
    async login(loginForm: LoginFormState) {
      try {
        const response = await login(loginForm);
        const ex = 7 * 24 * 60 * 60;
        // TODO access token
        storage.set(ACCESS_TOKEN, loginForm.id, ex);
        storage.set(CURRENT_USER, loginForm.id, ex);
        this.setToken(loginForm.id);
        this.setUserInfo(loginForm.id);
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    // 注册
    async register(registerForm: RegisterFormState) {
      try {
        const response = await register(registerForm);
        const ex = 7 * 24 * 60 * 60;
        // TODO access token
        storage.set(ACCESS_TOKEN, registerForm.id, ex);
        storage.set(CURRENT_USER, registerForm.id, ex);
        this.setToken(registerForm.id);
        this.setUserInfo(registerForm.id);
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    // 获取用户信息
    GetInfo() {
      const that = this;
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then((res) => {
            const result = res;
            if (result.permissions && result.permissions.length) {
              const permissionsList = result.permissions;
              that.setPermissions(permissionsList);
              that.setUserInfo(result);
            } else {
              reject(new Error('getInfo: permissionsList must be a non-null array !'));
            }
            that.setAvatar(result.avatar);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo('');
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
      return Promise.resolve('');
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWidthOut() {
  return useUserStore(store);
}
