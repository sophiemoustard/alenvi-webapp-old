import { Cookies } from 'quasar'

import store from '../store/index'

export default [
  {
    path: '/',
    beforeEnter: async (to, from, next) => {
      try {
        if (!store.getters['main/user'] && Cookies.get('user_id')) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        if (store.getters['main/user'] && store.getters['main/user'].role.name === 'Client') {
          return next({ name: 'customer home' });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name !== 'Client') {
          return next({ path: '/dashboard/planning' });
          // console.log('FEH');
          // return next({ path: '/dashboard/test2' });
        }
        next({ path: '/login' });
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/signin/Authenticate')
  },
  { path: '/enterCode', component: () => import('pages/signup/EnterCode') },
  {
    path: '/signup',
    component: () => import('pages/signup/SignUp'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('signup_is_activated') && Cookies.get('signup_sector') && Cookies.get('signup_mobile') && Cookies.get('signup_managerId')) {
        next();
      } else {
        next({ path: '/enterCode' });
      }
    }
  },
  { path: '/forgotPassword', component: () => import('pages/signin/ForgotPwd') },
  { path: '/resetPassword/:token', component: () => import('pages/signin/ResetPwd') },
  { path: '/error403Pwd', component: () => import('pages/signin/403') },
  { path: '/bot/authenticate', component: () => import('pages/bot/Authenticate') },
  { path: '/bot/editCustomerInfo', component: () => import('pages/bot/CustomerInfo') },
  { path: '/bot/calendar', component: () => import('pages/bot/Calendar') },
  {
    path: '/dashboard',
    component: () => import('layouts/Layout'),
    children: [
      {
        path: '',
        component: () => import('pages/dashboard/Home'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      { path: 'test', component: () => import('pages/Test') },
      {
        path: 'test2',
        component: () => import('pages/Test2'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'planning',
        name: 'planning',
        component: () => import('pages/dashboard/planning/NavTabs'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'Planning'
        }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('pages/dashboard/users/NavTabs'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'Utilisateurs'
        }
      },
      {
        path: 'pigi',
        component: () => import('pages/dashboard/pigi/NavTabs'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'Pigi'
        }
      },
      {
        path: 'profile/:id',
        name: 'profile',
        component: () => import('pages/dashboard/profile/NavTabs'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/dashboard/settings/NavTabs'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'Paramètres'
        }
      },
      {
        path: 'customer/home',
        name: 'customer home',
        component: () => import('pages/dashboard/customer/Home'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'customer/planning',
        name: 'customer planning',
        component: () => import('pages/dashboard/customer/Planning'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'customer/documents',
        name: 'customer documents',
        // component: load('dashboard/customer/documents/NavTabs'),
        component: () => import('pages/dashboard/customer/documents/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'customer/profile/:id',
        name: 'customer profile',
        // component: load('dashboard/customer/documents/NavTabs'),
        component: () => import('pages/dashboard/customer/Profile'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      }
    ]
  },
  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
];
