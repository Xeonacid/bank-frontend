import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { SendOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/transfer',
    name: 'transfer',
    component: Layout,
    meta: {
      sort: 1,
      isRoot: true,
      activeMenu: 'transfer_index',
      icon: renderIcon(SendOutlined),
    },
    children: [
      {
        path: 'index',
        name: `transfer_index`,
        meta: {
          title: '转账',
          activeMenu: 'transfer_index',
        },
        component: () => import('@/views/transfer/index.vue'),
      },
    ],
  },
];

export default routes;
