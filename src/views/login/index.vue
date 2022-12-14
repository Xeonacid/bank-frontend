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
          <n-form-item path="id">
            <n-input v-model:value="formInline.id" placeholder="请输入卡号">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <PersonOutline />
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
          <n-form-item path="password">
            <n-input
              v-model:value="formInline.password"
              type="password"
              showPasswordOn="click"
              placeholder="私钥密码"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <LockClosedOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="signature">
            <n-input
              v-model:value="formInline.signature"
              placeholder="签名，填写私钥和私钥密码后会自动生成"
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
              登录
            </n-button>
          </n-form-item>
          <n-form-item class="default-color">
            <div class="flex view-account-other">
              <div class="flex-initial" style="margin-left: auto">
                <a href="/#/register">注册账号</a>
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
  import { LoginFormState, useUserStore } from '@/store/modules/user';
  import { FormItemRule, FormRules, useMessage } from 'naive-ui';
  import {
    PersonOutline,
    CheckmarkOutline,
    KeyOutline,
    LockClosedOutline,
    TimeOutline,
  } from '@vicons/ionicons5';
  import { PageEnum } from '@/enums/pageEnum';
  import { websiteConfig } from '@/config/website.config';
  import { idToCAUid, importPrivKey, pemFooter, pemHeader, validatePrivKey } from '@/utils/ca';
  import { ab2str, str2ab } from '@/utils';

  const formRef = ref();
  const resultMessage = useMessage();
  const loading = ref(false);
  const LOGIN_NAME = PageEnum.BASE_LOGIN_NAME;

  const formInline = reactive({
    id: '',
    privKey: '',
    password: '',
    signature: '',
    timestamp: '',
  });

  const signatureTimestampDisabled = ref(false);

  const rules: FormRules = {
    id: { required: true, message: '请输入你的卡号', trigger: 'blur' },
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

  async function calcSignature(privKey: CryptoKey): Promise<string> {
    const msg = str2ab(`${formInline.timestamp}||${idToCAUid(formInline.id)}||POST:/login`);
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
    const pem = formInline.privKey,
      password = formInline.password;
    if (formInline.id === '' || password == '' || !validatePrivKey(pem)) {
      return;
    }

    // fetch the part of the PEM string between header and footer
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    importPrivKey(pemContents, password).then(
      async (privKey) => {
        const timestamp = Date.now();
        formInline.timestamp = timestamp.toString();
        const signature = await calcSignature(privKey);
        formInline.signature = signature;
        signatureTimestampDisabled.value = true;
      },
      () => {
        return;
      }
    );
  }

  watch(
    () => [formInline.privKey, formInline.id, formInline.password],
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
        const { id, signature, timestamp } = formInline;
        resultMessage.loading('登录中...');
        loading.value = false;

        const params: LoginFormState = {
          id,
          signature,
          timestamp: parseInt(timestamp),
        };

        try {
          userStore
            .login(params)
            .then(({ message }) => {
              resultMessage.destroyAll();
              const toPath = decodeURIComponent((route.query?.redirect || '/') as string);
              resultMessage.success('登录成功，即将进入系统');
              if (route.name === LOGIN_NAME) {
                router.replace('/');
              } else router.replace(toPath);
            })
            .catch(() => {
              resultMessage.info('登录失败');
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
