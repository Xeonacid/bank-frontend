<template>
  <n-form
    :label-width="90"
    :model="formValue"
    :rules="rules"
    label-placement="left"
    ref="form2Ref"
    style="max-width: 500px; margin: 40px auto 0 80px"
  >
    <n-form-item label="收款账户" path="account">
      <span>{{ transferStore.getTo_id }}</span>
    </n-form-item>
    <n-form-item label="转账金额" path="money">
      <span>￥{{ transferStore.getAmount }} 元</span>
    </n-form-item>
    <n-divider />
    <n-form-item label="私钥" path="privKey">
      <n-input
        v-model:value="formValue.privKey"
        placeholder="你的私钥，PKCS#8格式&#10;（仅在前端使用，不会发送到服务器，请放心填写）"
        type="textarea"
        :autosize="{
          minRows: 5,
          maxRows: 10,
        }"
      />
    </n-form-item>
    <n-form-item label="私钥密码" path="password">
      <n-input
        v-model:value="formValue.password"
        type="password"
        showPasswordOn="click"
        placeholder="私钥密码"
      />
    </n-form-item>
    <n-form-item label="签名" path="signature">
      <n-input
        v-model:value="formValue.signature"
        placeholder="签名，填写私钥和私钥密码后会自动生成"
        type="textarea"
        :autosize="{
          minRows: 3,
          maxRows: 5,
        }"
        :disabled="signatureTimestampDisabled"
      />
    </n-form-item>
    <n-form-item label="时间戳" path="timestamp">
      <n-input
        v-model:value="formValue.timestamp"
        placeholder="时间戳"
        :disabled="signatureTimestampDisabled"
      />
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
  import { ref, defineEmits, watch, reactive } from 'vue';
  import { FormItemRule, FormRules, useMessage } from 'naive-ui';
  import { useTransferStore } from '@/store/modules/transfer';
  import { importPrivKey, pemFooter, pemHeader, validatePrivKey } from '@/utils/ca';
  import { ab2str, str2ab } from '@/utils';
  const form2Ref: any = ref(null);
  const message = useMessage();
  const loading = ref(false);

  const formValue = reactive({
    privKey: '',
    password: '',
    signature: '',
    timestamp: '',
  });

  const signatureTimestampDisabled = ref(false);

  const rules: FormRules = {
    password: { required: true, message: '请输入私钥密码', trigger: 'blur' },
    privKey: [
      {
        required: true,
        message: '请输入私钥',
        trigger: 'blur',
      },
      {
        validator: (rule: FormItemRule, value: string) => {
          return validatePrivKey(value);
        },
        message: '不是合法的PKCS#8格式私钥',
        trigger: ['input', 'blur'],
      },
    ],
  };

  const transferStore = useTransferStore();

  async function calcSignature(privKey: CryptoKey): Promise<string> {
    const msg = str2ab(
      `${transferStore.getFrom_id}||${transferStore.getTo_id}||${transferStore.getAmount}||${
        transferStore.getComment
      }||${transferStore.getTimestamp.toString()}`
    );
    console.log(ab2str(msg));
    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      privKey,
      msg
    );
    return btoa(ab2str(signature));
  }

  async function fulfillSignature() {
    const pem = formValue.privKey,
      password = formValue.password;
    if (formValue.password == '' || !validatePrivKey(pem)) {
      return;
    }

    // fetch the part of the PEM string between header and footer
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    importPrivKey(pemContents, password).then(
      async (privKey) => {
        const timestamp = Date.now();
        formValue.timestamp = timestamp.toString();
        transferStore.setTimestamp(timestamp);
        const signature = await calcSignature(privKey);
        formValue.signature = signature;
        transferStore.setSignature(signature);
        signatureTimestampDisabled.value = true;
      },
      () => {
        return;
      }
    );
  }

  watch(
    () => [formValue.privKey, formValue.password],
    () => {
      fulfillSignature();
    }
  );

  const emit = defineEmits(['prevStep', 'nextStep']);

  function prevStep() {
    emit('prevStep');
  }

  function formSubmit() {
    loading.value = true;
    form2Ref.value.validate((errors) => {
      if (!errors) {
        transferStore
          .doTransfer()
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
