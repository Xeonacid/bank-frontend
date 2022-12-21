<template>
  <n-form
    :label-width="90"
    :model="formValue"
    :rules="rules"
    label-placement="left"
    ref="form1Ref"
    style="max-width: 500px; margin: 40px auto 0 80px"
  >
    <n-form-item label="收款账户" path="to_id">
      <n-input
        placeholder="请输入收款账户"
        :style="{ width: '80%' }"
        v-model:value="formValue.to_id"
      />
    </n-form-item>
    <n-form-item label="转账金额" path="amount">
      <n-input placeholder="请输入转账金额" v-model:value="formValue.amount">
        <template #prefix>
          <span class="text-gray-400">￥</span>
        </template>
      </n-input>
    </n-form-item>
    <n-form-item label="附言" path="comment">
      <n-input placeholder="附言" v-model:value="formValue.comment">
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
  import { FormRules, useMessage } from 'naive-ui';
  import { useTransferStore } from '@/store/modules/transfer';
  import { useUserStore } from '@/store/modules/user';

  const emit = defineEmits(['nextStep']);

  const form1Ref: any = ref(null);
  const message = useMessage();

  const formValue = ref({
    to_id: '',
    amount: '',
    comment: '',
  });

  const rules: FormRules = {
    to_id: {
      required: true,
      message: '请输入收款账户',
      trigger: 'blur',
    },
    amount: {
      required: true,
      message: '请输入转账金额',
      trigger: 'blur',
    },
  };

  const transferStore = useTransferStore();
  const userStore = useUserStore();

  function formSubmit() {
    form1Ref.value.validate((errors) => {
      if (!errors) {
        transferStore.setFrom_id(userStore.getToken);
        transferStore.setTo_id(formValue.value.to_id);
        transferStore.setAmount(formValue.value.amount);
        transferStore.setComment(formValue.value.comment);
        emit('nextStep');
      } else {
        message.error('验证失败，请填写完整信息');
      }
    });
  }
</script>
