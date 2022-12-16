import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { MoneyCollectOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/balance',
    name: 'balance',
    component: Layout,
    meta: {
      sort: 1,
      isRoot: true,
      activeMenu: 'balance_index',
      icon: renderIcon(MoneyCollectOutlined),
    },
    children: [
      {
        path: 'index',
        name: `balance_index`,
        meta: {
          title: '存取款',
          activeMenu: 'balance_index',
        },
        component: () => import('@/views/balance/index.vue'),
      },
    ],
  },
];

export default routes;
