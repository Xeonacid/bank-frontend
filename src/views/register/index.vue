<template>
  <div class="view-account">
    <div class="view-account-header"></div>
    <div class="view-account-container">
      <div class="view-account-top">
        <div class="view-account-top-logo">
          <img :src="websiteConfig.loginImage" alt="" />
        </div>
        <div class="view-account-top-desc">{{ websiteConfig.loginDesc }}</div>
      </div>
      <div class="view-account-form">
        <n-form
          ref="formRef"
          label-placement="left"
          size="large"
          :model="formInline"
          :rules="rules"
        >
          <n-form-item path="name">
            <n-input v-model:value="formInline.name" placeholder="姓名">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <PersonOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="id">
            <n-input v-model:value="formInline.id" maxlength="20" placeholder="你想要的卡号">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <WalletOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="privKey">
            <n-input
              v-model:value="formInline.privKey"
              placeholder="你的私钥，PKCS#8格式&#10;（仅在前端使用，不会发送到服务器，请放心填写）"
              type="textarea"
              :autosize="{
                minRows: 5,
                maxRows: 10,
              }"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <KeyOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="signature">
            <n-input
              v-model:value="formInline.signature"
              placeholder="签名（填写私钥后会自动生成）"
              type="textarea"
              :autosize="{
                minRows: 3,
                maxRows: 5,
              }"
              :disabled="signatureTimestampDisabled"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <CheckmarkOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="timestamp">
            <n-input
              v-model:value="formInline.timestamp"
              placeholder="时间戳"
              :disabled="signatureTimestampDisabled"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <TimeOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleSubmit" size="large" :loading="loading" block>
              注册
            </n-button>
          </n-form-item>
          <n-form-item class="default-color">
            <div class="flex view-account-other">
              <div class="flex-initial" style="margin-left: auto">
                <a href="/#/login">登录</a>
              </div>
            </div>
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { RegisterFormState, useUserStore } from '@/store/modules/user';
  import { useMessage, FormRules, FormItemRule } from 'naive-ui';
  import {
    PersonOutline,
    KeyOutline,
    WalletOutline,
    CheckmarkOutline,
    TimeOutline,
  } from '@vicons/ionicons5';
  import { PageEnum } from '@/enums/pageEnum';
  import { websiteConfig } from '@/config/website.config';
  import { str2ab, ab2str } from '@/utils/index';
  import {
    idToCAUid,
    importPrivKey,
    getPubKey,
    pemHeader,
    pemFooter,
    validatePrivKey,
  } from '@/utils/ca';

  const formRef = ref();
  const resultMessage = useMessage();
  const loading = ref(false);
  const REGISTER_NAME = PageEnum.BASE_REGISTER_NAME;

  const formInline = reactive({
    id: '',
    name: '',
    privKey: '',
    pubKey: '',
    signature: '',
    timestamp: '',
  });

  const signatureTimestampDisabled = ref(false);

  const rules: FormRules = {
    name: { required: true, message: '请输入姓名', trigger: 'blur' },
    id: { required: true, message: '请输入你想要的卡号', trigger: 'blur' },
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

  async function calcSignature(privKey: CryptoKey): Promise<string> {
    const pubKey = await getPubKey(privKey);
    const exported = await crypto.subtle.exportKey('spki', pubKey);
    const exportedAsBase64 = btoa(ab2str(exported));
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    formInline.pubKey = pemExported;

    const msg = str2ab(
      `${formInline.timestamp}||${idToCAUid(formInline.id)}||${pemExported}||POST:/user`
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
    const pem = formInline.privKey;
    if (formInline.id === '' || !validatePrivKey(pem)) {
      return;
    }

    // fetch the part of the PEM string between header and footer
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    const privKey = await importPrivKey(pemContents);
    console.log(privKey);

    const timestamp = new Date().getTime();
    formInline.timestamp = timestamp.toString();
    const signature = await calcSignature(privKey);
    formInline.signature = signature;
    signatureTimestampDisabled.value = true;
  }

  watch(
    () => formInline.privKey,
    () => {
      fulfillSignature();
    }
  );

  watch(
    () => formInline.id,
    () => {
      fulfillSignature();
    }
  );

  const userStore = useUserStore();

  const router = useRouter();
  const route = useRoute();

  const handleSubmit = (e) => {
    e.preventDefault();
    formRef.value.validate(async (errors) => {
      if (!errors) {
        const { id, name, pubKey, signature, timestamp } = formInline;
        resultMessage.loading('注册中...');
        loading.value = false;

        const params: RegisterFormState = {
          id,
          name,
          pubKey,
          signature,
          timestamp: parseInt(timestamp),
        };

        try {
          userStore
            .register(params)
            .then(({ message }) => {
              resultMessage.destroyAll();
              const toPath = decodeURIComponent((route.query?.redirect || '/') as string);
              resultMessage.success('注册成功，即将进入系统');
              if (route.name === REGISTER_NAME) {
                router.replace('/');
              } else router.replace(toPath);
            })
            .catch(() => {
              resultMessage.info('注册失败');
            });
        } finally {
          loading.value = false;
        }
      } else {
        resultMessage.error('请填写完整信息');
      }
    });
  };
</script>

<style lang="less" scoped>
  .view-account {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;

    &-container {
      flex: 1;
      padding: 32px 12px;
      max-width: 384px;
      min-width: 320px;
      margin: 0 auto;
    }

    &-top {
      padding: 32px 0;
      text-align: center;

      &-desc {
        font-size: 14px;
        color: #808695;
      }
    }

    &-other {
      width: 100%;
    }

    .default-color {
      color: #515a6e;

      .ant-checkbox-wrapper {
        color: #515a6e;
      }
    }
  }

  @media (min-width: 768px) {
    .view-account {
      background-image: url('../../assets/images/login.svg');
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 100%;
    }

    .page-account-container {
      padding: 32px 0 24px 0;
    }
  }
</style>
