import { defineStore } from 'pinia';
import { BalanceUpdateTypeEnum } from '@/enums/balanceEnum';
import { balanceUpdate } from '@/api/user/balance';
export interface BalanceUpdateState {
  balanceUpdateType: BalanceUpdateTypeEnum;
  amount: string;
}

export interface BalanceUpdateFormState {
  id: string;
  delta: string;
}

export const useBalanceStore = defineStore({
  id: 'app-balance',
  state: (): BalanceUpdateState => ({
    balanceUpdateType: BalanceUpdateTypeEnum.WITHDRAW,
    amount: '0',
  }),
  getters: {
    getBalanceUpdateType(): BalanceUpdateTypeEnum {
      return this.balanceUpdateType;
    },
    getAmount(): string {
      return this.amount;
    },
  },
  actions: {
    setBalanceUpdateType(balanceUpdateType: BalanceUpdateTypeEnum) {
      this.balanceUpdateType = balanceUpdateType;
    },
    setAmount(amount: string) {
      this.amount = amount;
    },
    async doBalanceUpdate(form: BalanceUpdateFormState) {
      try {
        const response = await balanceUpdate(form);
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    },
  },
});
