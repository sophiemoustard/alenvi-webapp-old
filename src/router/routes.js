import { Cookies } from 'quasar'

import store from '../store/index'
import users from '../api/Users'

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
      if (Cookies.get('signup_is_activated') && Cookies.get('signup_sector') && Cookies.get('signup_mobile') && Cookies.get('signup_managerId') && Cookies.get('signup_firstSMS')) {
        next();
      } else {
        next({ path: '/enterCode' });
      }
    }
  },
  // {
  //   path: '/signupComplete',
  //   component: () => import('pages/signup/SignUpComplete'),
  //   beforeEnter: async (to, from, next) => {
  //     try {
  //       if (to.query.token && to.query.id) {
  //         await users.getById(to.query.id, to.query.token);
  //         next();
  //       } else {
  //         next({ path: '/401' });
  //       }
  //     } catch (e) {
  //       console.error(e.response);
  //       next({ path: '/401' });
  //     }
  //   }
  // },
  {
    path: '/signup/optionalDocuments',
    component: () => import('pages/signup/optionalDocuments'),
    beforeEnter: async (to, from, next) => {
      try {
        if (to.query.token && to.query.id) {
          await users.getById(to.query.id, to.query.token);
          next();
        } else {
          next({ path: '/401' });
        }
      } catch (e) {
        console.error(e.response);
        next({ path: '/401' });
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
        path: 'auxiliaries',
        name: 'auxiliaries',
        component: () => import('pages/dashboard/auxiliaries/NavTabs'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'Auxiliaires'
        }
      },
      {
        path: 'caregivers',
        name: 'caregivers',
        component: () => import('pages/dashboard/caregivers/AddHelper'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'Aidants'
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
  { path: '/401', component: () => import('pages/401') },
  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
];
