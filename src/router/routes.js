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
          return next({ name: 'customer planning' });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name === 'Auxiliaire') {
          return next({ name: 'profile planning', params: { id: store.getters['main/user']._id }, query: { auxiliary: 'true', self: 'true' } });
        } else if (store.getters['main/user'] && store.getters['main/user'].role.name !== 'Auxiliaire' && store.getters['main/user'].role.name !== 'Aidants') {
          return next({ name: 'administrative directory' });
        } else {
          next({ path: '/login' });
        }
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'ni/config/rh',
        name: 'rh config',
        component: () => import('pages/ni/config/RhConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['rhconfig:edit'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/customers',
        name: 'customers config',
        component: () => import('pages/ni/config/CustomersConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['rhconfig:edit'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/tags',
        name: 'tags config',
        component: () => import('pages/ni/config/TagConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['rhconfig:edit'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/auxiliaries',
        name: 'administrative directory',
        component: () => import('pages/ni/auxiliaries/Directory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['users:list'],
          parent: 'administrative',
        },
      },
      {
        path: 'ni/auxiliaries/:id',
        name: 'personal info',
        component: () => import('pages/ni/auxiliaries/PersonalInfo'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: [{
            name: 'profiles:edit',
            when: (paramsId, cookieId) => paramsId === cookieId
          }, 'profiles:edit:user'],
          parent: 'administrative',
        },
      },
      {
        path: 'ni/:id/team',
        name: 'team directory',
        component: () => import('pages/auxiliaries/team/TeamDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'team'
        }
      },
      {
        path: 'ni/customers',
        name: 'customers directory',
        component: () => import('pages/ni/customers/CustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      {
        path: 'ni/customers/:id',
        name: 'customers profile',
        props: true,
        component: () => import('pages/ni/customers/Profile'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      {
        path: 'ni/planning',
        name: 'planning',
        component: () => import('pages/ni/planning/Planning'),
        redirect: {
          name: 'view planning'
        },
        // Children so collapsible in side menu highlights good selection
        children: [
          {
            path: 'view',
            name: 'view planning',
            component: () => import('pages/ni/planning/PlanningView'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permissions: ['planning:read'],
              parent: 'planning'
            },
          },
          {
            path: 'modification',
            name: 'modification planning',
            component: () => import('pages/ni/planning/PlanningModification'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permissions: ['planning:history'],
              parent: 'planning'
            },
          },
          {
            path: 'permanences',
            name: 'constrained coaches',
            component: () => import('pages/ni/planning/ConstrainedCoaches'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permissions: ['duty:read'],
              parent: 'planning'
            },
          },
        ]
      },
      {
        path: 'ni/planning/auxiliaries',
        name: 'auxiliaries plannning',
        component: () => import('pages/ni/planning/AuxiliaryPlanning'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning'
        },
      },
      {
        path: 'ni/planning/customers',
        name: 'customers plannning',
        component: () => import('pages/ni/planning/CustomerPlanning'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning'
        },
      },
      // Auxiliary view routes
      {
        path: 'auxiliaries/planning',
        name: 'profile planning',
        component: () => import('pages/auxiliaries/planning/OldPlanning'),
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
        path: 'auxiliaries/agenda',
        name: 'profile planning',
        component: () => import('pages/auxiliaries/planning/Planning'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['planning:read'],
          parent: 'planning'
        }
      },
      {
        path: 'auxiliaries/customers',
        name: 'profile customers',
        component: () => import('pages/auxiliaries/customers/AuxiliaryCustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'benef'
        }
      },
      {
        path: 'auxiliaries/customers/:customerId',
        name: 'profile customers info',
        props: true,
        component: () => import('pages/auxiliaries/customers/CustomerInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read']
        }
      },
      {
        path: 'auxiliaries/paye',
        name: 'profile salaries',
        component: () => import('pages/auxiliaries/administrative/Salaries'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'administrative'
        }
      },
      {
        path: 'auxiliaries/docs',
        name: 'profile docs',
        component: () => import('pages/auxiliaries/administrative/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read'],
          parent: 'administrative'
        }
      },
      {
        path: 'auxiliaries/:id',
        name: 'auxiliary personal info',
        component: () => import('pages/auxiliaries/administrative/Info'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: [{
            name: 'profiles:edit',
            when: (paramsId, cookieId) => paramsId === cookieId
          }, 'profiles:edit:user'],
          parent: 'administrative',
        },
      },
      // Customers view routes
      {
        path: 'customers/planning',
        name: 'customer planning',
        component: () => import('pages/customers/Planning'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'customers/documents',
        name: 'customer documents',
        component: () => import('pages/customers/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      {
        path: 'customers/subscriptions',
        name: 'customer subscription',
        component: () => import('pages/customers/Subscriptions'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        }
      },
      // All profiles
      {
        path: ':id/account',
        name: 'account info',
        component: () => import('pages/AccountInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: ['profiles:read', 'profiles:edit']
        }
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
  { path: '/401', component: () => import('pages/401') },
  { path: '/docsigned', component: () => import('pages/DocumentSigned'), props: true },
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
