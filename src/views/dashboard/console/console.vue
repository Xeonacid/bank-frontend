<template>
  <div class="console">
    <!--数据卡片-->
    <n-grid cols="1 s:2 m:3 l:4 xl:4 2xl:4" responsive="screen" :x-gap="12" :y-gap="8">
      <n-grid-item>
        <NCard title="💰 余额" :segmented="{ content: true }" size="small" :bordered="false">
          <div class="py-1 px-1 flex justify-between">
            <n-skeleton v-if="loading" :width="100" size="medium" />
            <h1>￥{{ balance }}</h1>
          </div>
        </NCard>
      </n-grid-item>
    </n-grid>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { getConsoleInfo } from '@/api/dashboard/console';

  const loading = ref(true);
  const balance = ref<any>({});

  onMounted(async () => {
    const data = await getConsoleInfo();
    balance.value = data.balance;
    loading.value = false;
  });
</script>

<style lang="less" scoped></style>
