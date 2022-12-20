<template>
  <n-form
    :label-width="90"
    :model="formValue"
    :rules="rules"
    label-placement="left"
    ref="form1Ref"
    style="max-width: 500px; margin: 40px auto 0 80px"
  >
    <n-form-item label="交易类型" path="balanceUpdateType">
      <n-radio-group v-model:value="formValue.balanceUpdateType" name="balanceUpdateType">
        <n-space>
          <n-radio :value="BalanceUpdateTypeEnum.WITHDRAW">存款</n-radio>
          <n-radio :value="BalanceUpdateTypeEnum.DEPOSIT">取款</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="金额" path="amount">
      <n-input placeholder="请输入交易金额" v-model:value="formValue.amount">
        <template #prefix>
          <span class="text-gray-400">￥</span>
        </template>
      </n-input>
    </n-form-item>
    <div style="margin-left: 80px">
      <n-space>
        <n-button type="primary" @click="formSubmit">下一步</n-button>
      </n-space>
    </div>
  </n-form>
</template>

<script lang="ts" setup>
  import { ref, defineEmits } from 'vue';
  import { useMessage } from 'naive-ui';
  import { useBalanceStore } from '@/store/modules/balance';
  import { BalanceUpdateTypeEnum } from '@/enums/balanceEnum';

  const emit = defineEmits(['nextStep']);

  const form1Ref: any = ref(null);
  const message = useMessage();

  const formValue = ref({
    balanceUpdateType: BalanceUpdateTypeEnum.WITHDRAW,
    amount: '',
  });

  const rules = {
    balanceUpdateType: {
      required: true,
      message: '请选择交易类型',
      trigger: 'blur',
    },
    amount: {
      required: true,
      message: '请输入交易金额',
      trigger: 'blur',
    },
  };

  const balanceStore = useBalanceStore();

  function formSubmit() {
    form1Ref.value.validate((errors) => {
      if (!errors) {
        balanceStore.setBalanceUpdateType(formValue.value.balanceUpdateType);
        balanceStore.setAmount(formValue.value.amount);
        emit('nextStep');
      } else {
        message.error('验证失败，请填写完整信息');
      }
    });
  }
</script>
