import { defineStore } from 'pinia';
import { transfer } from '@/api/user/transfer';

export interface TransferState {
  from_id: string;
  to_id: string;
  amount: string;
  comment: string;
  signature: string;
}

export const useTransferStore = defineStore({
  id: 'app-transfer',
  state: (): TransferState => ({
    from_id: '',
    to_id: '',
    amount: '0',
    comment: '',
    signature: '',
  }),
  getters: {
    getFrom_id(): string {
      return this.from_id;
    },
    getTo_id(): string {
      return this.to_id;
    },
    getAmount(): string {
      return this.amount;
    },
    getComment(): string {
      return this.comment;
    },
    getSignature(): string {
      return this.signature;
    },
  },
  actions: {
    setFrom_id(from_id: string) {
      this.from_id = from_id;
    },
    setTo_id(to_id: string) {
      this.to_id = to_id;
    },
    setAmount(amount: string) {
      this.amount = amount;
    },
    setComment(comment: string) {
      this.comment = comment;
    },
    setSignature(signature: string) {
      this.signature = signature;
    },
    async doTransfer() {
      try {
        const response = await transfer({
          order: {
            from_id: this.from_id,
            to_id: this.to_id,
            amount: this.amount,
            comment: this.comment,
          },
          signature: this.signature,
        });
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    },
  },
});
