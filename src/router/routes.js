import { Cookies } from 'quasar'

import store from '../store/index'

const routes = [
  {
    path: '/',
    beforeEnter: async (to, from, next) => {
      try {
        if (!store.getters['main/user'] && Cookies.get('user_id')) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        if (store.getters['main/user'] && store.getters['main/user'].role.name === 'Client') {
          return next({ name: 'customer home' });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name === 'Auxiliaire') {
          return next({ name: 'auxiliary info', params: { id: store.getters['main/user']._id } });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name !== 'Auxiliaire' && store.getters['main/user'].role.name !== 'Client') {
          return next({ name: 'rh directory' });
        } else {
          next({ path: '/login' });
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  { path: '/login', name: 'login', component: () => import('pages/signin/Authenticate') },
  { path: '/enterCode', component: () => import('pages/signup/EnterCode') },
  { path: '/messenger', component: () => import('pages/signup/ChooseMessengerPlatform') },
  { path: '/createPassword',
    component: () => import('pages/signup/CreatePassword'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('signup_token') && Cookies.get('signup_userId') && Cookies.get('signup_userEmail')) {
        next();
      } else {
        next({ path: '/enterCode' });
      }
    }
  },
  { path: '/forgotPassword', component: () => import('pages/signin/ForgotPwd') },
  { path: '/resetPassword/:token', component: () => import('pages/signin/ResetPwd') },
  { path: '/error403Pwd', component: () => import('pages/signin/403') },
  // { path: '/bot/authenticate', component: () => import('pages/bot/Authenticate') },
  // { path: '/bot/editCustomerInfo', component: () => import('pages/bot/CustomerInfo') },
  // { path: '/bot/calendar', component: () => import('pages/bot/Calendar') },
  // {
  //   path: '/bot/auxiliaries/:id',
  //   name: ' bot auxiliary info',
  //   component: () => import('pages/bot/auxiliaryInfo'),
  //   props: (route) => ({ id: route.params.id, token: route.query.access_token })
  // },
  {
    path: 'planning',
    name: 'planning',
    component: () => import('pages/dashboard/planning/Planning'),
    redirect: {
      name: 'view planning'
    },
    // Children so collapsible in side menu highlights good selection
    children: [
      {
        path: 'view',
        name: 'view planning',
        component: () => import('pages/dashboard/planning/PlanningView'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['planning:read'],
          parent: 'planning'
        },
      },
      {
        path: 'modification',
        name: 'modification planning',
        component: () => import('pages/dashboard/planning/PlanningModification'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['planning:history'],
          parent: 'planning'
        },
      },
      {
        path: 'constrainedCoaches',
        name: 'constrained coaches',
        component: () => import('pages/dashboard/planning/ConstrainedCoaches'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['duty:read'],
          parent: 'planning'
        },
      }
    ]
  },
  {
    path: 'beneficiaries',
    name: 'beneficiaries',
    component: () => import('pages/dashboard/beneficiaries/Beneficiaries'),
    redirect: {
      name: 'add helper'
    },
    children: [
      {
        path: 'addHelper',
        name: 'add helper',
        component: () => import('pages/dashboard/beneficiaries/AddHelper'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['users:welcome:user'],
          parent: 'benef'
        }
      }
    ]
  },
  {
    path: '/ni',
    component: () => import('layouts/Layout'),
    meta: {
      cookies: ['alenvi_token', 'refresh_token']
    },
    redirect: {
      path: '/'
    },
    children: [
      {
        path: 'rh/auxiliaires/:id',
        name: 'auxiliary info',
        component: () => import('pages/dashboard/rh/auxiliaries/Info'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read']
        }
      },
      {
        path: '',
        name: 'rh directory',
        component: () => import('pages/ni/Directory'),
        props: (route) => ({ sector: route.query.sector, role: route.query.role }),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['users:list'],
          parent: 'rh'
        }
      },
      {
        path: ':id',
        name: 'rh directory profile',
        component: () => import('pages/ni/Profile'),
        props: true,
        redirect: {
          name: 'directory profile info'
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'rh',
        },
        // Directory profile tabs
        children: [
          {
            path: 'info',
            name: 'directory profile info',
            component: () => import('components/ProfileInfo'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permissions: [{
                name: 'profiles:edit',
                when: (paramsId, cookieId) => paramsId === cookieId
              }, 'profiles:edit:user'],
              parent: 'rh'
            }
          },
          {
            path: 'taches',
            name: 'directory profile tasks',
            component: () => import('components/ProfileTasks'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permissions: ['profiles:edit:user'],
              parent: 'rh'
            }
          }
        ]
      },
      // {
      //   path: 'pigi',
      //   component: () => import('pages/dashboard/pigi/NavTabs'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'Pigi'
      //   }
      // },
      // {
      //   path: 'profile/:id',
      //   name: 'profile',
      //   component: () => import('components/ProfileInfo'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token']
      //   }
      // },
      // {
      //   path: 'settings',
      //   name: 'settings',
      //   component: () => import('pages/dashboard/settings/NavTabs'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'Paramètres'
      //   }
      // }
    ]
  },
  {
    path: '/dashboard/customer',
    component: () => import('layouts/CustomerLayout'),
    redirect: {
      name: 'customer home'
    },
    children: [
      {
        path: 'home',
        name: 'customer home',
        component: () => import('pages/dashboard/customer/Home'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'planning',
        name: 'customer planning',
        component: () => import('pages/dashboard/customer/Planning'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'documents',
        name: 'customer documents',
        component: () => import('pages/dashboard/customer/documents/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'profile/:id',
        name: 'customer profile',
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
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
