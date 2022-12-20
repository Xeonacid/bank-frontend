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
      <n-alert title="在注册之前" type="info"
        >请去CA网站申请证书，将密钥对与卡号绑定 <br />（CA UID请设置为 "BANK_卡号"）</n-alert
      >
      <br />
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
            <n-input v-model:value="formInline.id" maxlength="20" placeholder="你的卡号">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <WalletOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="cert">
            <n-input
              v-model:value="formInline.cert"
              placeholder="你从CA获取到的证书"
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
  import { reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { RegisterFormState, useUserStore } from '@/store/modules/user';
  import { useMessage, FormRules, FormItemRule } from 'naive-ui';
  import { PersonOutline, KeyOutline, WalletOutline } from '@vicons/ionicons5';
  import { PageEnum } from '@/enums/pageEnum';
  import { websiteConfig } from '@/config/website.config';

  const formRef = ref();
  const resultMessage = useMessage();
  const loading = ref(false);
  const REGISTER_NAME = PageEnum.BASE_REGISTER_NAME;

  const formInline = reactive({
    id: '',
    name: '',
    cert: '',
  });

  const rules: FormRules = {
    name: { required: true, message: '请输入姓名', trigger: 'blur' },
    id: { required: true, message: '请输入你的卡号', trigger: 'blur' },
    cert: [
      {
        required: true,
        message: '请输入证书',
        trigger: 'blur',
      },
      {
        validator: (rule: FormItemRule, value: string) => {
          const pemHeader = '-----BEGIN CERTIFICATE-----\n';
          const pemFooter = '\n-----END CERTIFICATE-----';
          if (value.indexOf(pemHeader) === -1 || value.indexOf(pemFooter) === -1) {
            return false;
          }
          return true;
        },
        message: '不是合法的证书',
        trigger: ['input', 'blur'],
      },
    ],
  };

  const userStore = useUserStore();

  const router = useRouter();
  const route = useRoute();

  const handleSubmit = (e) => {
    e.preventDefault();
    formRef.value.validate(async (errors) => {
      if (!errors) {
        const { id, name, cert } = formInline;
        resultMessage.loading('注册中...');
        loading.value = false;

        const params: RegisterFormState = {
          id,
          name,
          cert,
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
