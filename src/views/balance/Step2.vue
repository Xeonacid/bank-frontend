<template>
  <n-form
    :label-width="90"
    :model="formValue"
    :rules="rules"
    label-placement="left"
    ref="form2Ref"
    style="max-width: 500px; margin: 40px auto 0 80px"
  >
    <n-form-item label="交易类型" path="type">
      <span>{{ balanceStore.getBalanceUpdateType }}</span>
    </n-form-item>
    <n-form-item label="交易金额" path="money">
      <span>￥{{ balanceStore.getAmount }} 元</span>
    </n-form-item>
    <div style="margin-left: 80px">
      <n-space>
        <n-button type="primary" :loading="loading" @click="formSubmit">提交</n-button>
        <n-button @click="prevStep">上一步</n-button>
      </n-space>
    </div>
  </n-form>
</template>

<script lang="ts" setup>
  import { defineEmits, ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { BalanceUpdateFormState, useBalanceStore } from '@/store/modules/balance';
  import { useUserStore } from '@/store/modules/user';
  import { BalanceUpdateTypeEnum } from '@/enums/balanceEnum';

  const form2Ref: any = ref(null);
  const message = useMessage();
  const loading = ref(false);

  const balanceStore = useBalanceStore();
  const userStore = useUserStore();

  const emit = defineEmits(['prevStep', 'nextStep']);

  function prevStep() {
    emit('prevStep');
  }

  const params: BalanceUpdateFormState = {
    id: userStore.getToken,
    delta:
      balanceStore.getBalanceUpdateType === BalanceUpdateTypeEnum.WITHDRAW
        ? balanceStore.getAmount
        : '-' + balanceStore.getAmount,
  };

  function formSubmit() {
    loading.value = true;
    form2Ref.value.validate((errors) => {
      if (!errors) {
        balanceStore
          .doBalanceUpdate(params)
          .then(() => {
            loading.value = false;
            message.success('交易成功');
            emit('nextStep');
          })
          .catch((e) => {
            loading.value = false;
            message.error(e);
          });
      } else {
        message.error('验证失败，请填写完整信息');
      }
    });
  }
</script>
