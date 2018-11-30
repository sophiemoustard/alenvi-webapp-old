import { Cookies } from 'quasar'

import store from '../store/index'
import alenvi from '../helpers/alenvi'

const routes = [
  {
    path: '/',
    components: { default: () => import('layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();
        if (await alenvi.refreshAlenviCookies()) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        if (store.getters['main/user'] && store.getters['main/user'].role.name === 'Aidants') {
          return next({ name: 'customer home' });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name === 'Auxiliaire') {
          return next({ name: 'profile planning', params: { id: store.getters['main/user']._id }, query: { auxiliary: 'true', self: 'true' } });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name !== 'Auxiliaire' && store.getters['main/user'].role.name !== 'Aidants') {
          return next({ name: 'administrative directory', query: { role: 'Auxiliaire' } });
        } else {
          next({ path: '/login' });
        }
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'config',
        name: 'rh config',
        component: () => import('pages/ni/RhConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['rhconfig:edit'],
          parent: 'administrative'
        }
      },
      {
        path: 'ni',
        name: 'administrative directory',
        component: () => import('pages/ni/Directory'),
        props: (route) => ({ sector: route.query.sector, role: route.query.role }),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['users:list'],
          parent: 'administrative'
        }
      },
      {
        path: 'ni/:id',
        name: 'personal info',
        component: () => import('pages/ni/PersonalInfo'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: [{
            name: 'profiles:edit',
            when: (paramsId, cookieId) => paramsId === cookieId
          }, 'profiles:edit:user'],
          parent: 'administrative'
        }
      },
      {
        path: 'ni/:id/paye',
        name: 'profile salaries',
        component: () => import('pages/ni/Salaries'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'administrative'
        }
      },
      {
        path: 'ni/:id/planning',
        name: 'profile planning',
        component: () => import('pages/ni/Planning'),
        props: (route) => ({ auxiliary: route.query.auxiliary || null, customer: route.query.customer || null }),
        beforeEnter: (to, from, next) => {
          if (!to.query.auxiliary && !to.query.customer) {
            to.query.auxiliary = 'true';
            return next();
          }
          next();
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['planning:read'],
          parent: 'planning'
        }
      },
      {
        path: 'ni/:id/docs',
        name: 'profile docs',
        component: () => import('pages/ni/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'administrative'
        }
      },
      {
        path: 'ni/:id/customers',
        name: 'profile customers',
        component: () => import('pages/ni/AuxiliaryCustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      {
        path: 'ni/:id/customers/:customerId',
        name: 'profile customers info',
        props: true,
        component: () => import('pages/ni/CustomerInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read']
        }
      },
      {
        path: 'ni/:id/account',
        name: 'account info',
        component: () => import('pages/ni/AccountInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read']
        }
      },
      {
        path: 'ni/:id/team',
        name: 'team directory',
        component: () => import('pages/ni/Team'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'team'
        }
      },
      {
        path: 'customers',
        name: 'customers directory',
        component: () => import('pages/customers/CustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      {
        path: 'customers/:id',
        name: 'customers profile',
        props: true,
        component: () => import('pages/customers/Profile'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      {
        path: 'helpers',
        name: 'helpers directory',
        component: () => import('pages/customers/HelpersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      // Legacy routes
      {
        path: 'old/planning',
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
        path: 'old/beneficiaries',
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
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/signin/Authenticate'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('refresh_token')) return next({ path: '/' });
      return next();
    }
  },
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
