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
          <n-form-item path="username">
            <n-input v-model:value="formInline.username" placeholder="姓名">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <PersonOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="idCard">
            <n-input v-model:value="formInline.idCard" placeholder="身份证号">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <WalletOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="password">
            <n-input
              v-model:value="formInline.password"
              type="password"
              showPasswordOn="click"
              placeholder="密码"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <LockClosedOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="reenteredPassword">
            <n-input
              v-model:value="formInline.reenteredPassword"
              type="password"
              showPasswordOn="click"
              :disabled="!formInline.password"
              placeholder="重复密码"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <LockClosedOutline />
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
  import { useUserStore } from '@/store/modules/user';
  import { useMessage, FormRules, FormItemRule } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import { PersonOutline, LockClosedOutline, WalletOutline } from '@vicons/ionicons5';
  import { PageEnum } from '@/enums/pageEnum';
  import { websiteConfig } from '@/config/website.config';
  import isIdCard from '@/utils/idCardUtil';
  interface FormState {
    username: string;
    idCard: string;
    password: string;
  }

  const formRef = ref();
  const message = useMessage();
  const loading = ref(false);
  const REGISTER_NAME = PageEnum.BASE_REGISTER_NAME;

  const formInline = reactive({
    username: 'admin',
    idCard: '110101195306153019',
    password: '123456',
    reenteredPassword: '123456',
  });

  function validateIdCard(rule: FormItemRule, value: string): boolean {
    return isIdCard(value);
  }
  function validatePasswordStartWith(rule: FormItemRule, value: string): boolean {
    return (
      !!formInline.password &&
      formInline.password.startsWith(value) &&
      formInline.password.length >= value.length
    );
  }
  function validatePasswordSame(rule: FormItemRule, value: string): boolean {
    return value === formInline.password;
  }

  const rules: FormRules = {
    username: { required: true, message: '请输入姓名', trigger: 'blur' },
    password: { required: true, message: '请输入密码', trigger: 'blur' },
    idCard: [
      {
        required: true,
        message: '请再次输入密码',
        trigger: 'blur',
      },
      {
        validator: validateIdCard,
        message: '身份证号不合法',
        trigger: 'blur',
      },
    ],
    reenteredPassword: [
      {
        required: true,
        message: '请再次输入密码',
        trigger: ['input', 'blur'],
      },
      {
        validator: validatePasswordStartWith,
        message: '两次密码输入不一致',
        trigger: 'input',
      },
      {
        validator: validatePasswordSame,
        message: '两次密码输入不一致',
        trigger: ['blur', 'password-input'],
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
        const { username, idCard, password } = formInline;
        message.loading('注册中...');
        loading.value = true;

        const params: FormState = {
          username,
          idCard,
          password,
        };

        try {
          const { code, message: msg } = await userStore.register(params);
          message.destroyAll();
          if (code == ResultEnum.SUCCESS) {
            const toPath = decodeURIComponent((route.query?.redirect || '/') as string);
            message.success('注册成功，即将进入系统');
            if (route.name === REGISTER_NAME) {
              router.replace('/');
            } else router.replace(toPath);
          } else {
            message.info(msg || '注册失败');
          }
        } finally {
          loading.value = false;
        }
      } else {
        message.error('请填写完整信息');
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
