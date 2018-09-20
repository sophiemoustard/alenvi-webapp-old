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
        } else {
          next({ name: 'rh directory' });
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
  // {
  //   path: '/signup',
  //   component: () => import('pages/signup/SignUp'),
  //   beforeEnter: (to, from, next) => {
  //     if (Cookies.get('signup_token') && Cookies.get('signup_sector') && Cookies.get('signup_mobile') && Cookies.get('signup_managerId') && Cookies.get('signup_firstSMS')) {
  //       next();
  //     } else if (Cookies.get('refresh_token')) {
  //       next({ path: '/signupComplete' });
  //     } else {
  //       next({ path: '/enterCode' });
  //     }
  //   }
  // },
  // {
  //   path: '/signupComplete',
  //   component: () => import('pages/signup/SignUpComplete'),
  //   meta: {
  //     cookies: ['alenvi_token', 'refresh_token']
  //   },
  //   beforeEnter: (to, from, next) => {
  //     if (store.getters['main/user'] && store.getters['main/user'].administrative && !store.getters['main/user'].administrative.signup.complete) {
  //       // await users.getById(to.query.id, to.query.token);
  //       next();
  //     } else if (store.getters['main/user'] && store.getters['main/user'].administrative && store.getters['main/user'].administrative.signup.complete) {
  //       next({ path: '/alreadySignedUp' });
  //     } else {
  //       next({ path: 401 })
  //     }
  //   }
  // },
  // {
  // path: '/signup/optionalDocuments',
  // component: () => import('pages/signup/optionalDocuments'),
  // meta: {
  //   cookies: ['alenvi_token', 'refresh_token']
  // }
  // beforeEnter: async (to, from, next) => {
  //   try {
  //     if (to.query.token && to.query.id) {
  //       await users.getById(to.query.id, to.query.token);
  //       next();
  //     } else {
  //       next({ path: '/401' });
  //     }
  //   } catch (e) {
  //     console.error(e.response);
  //     next({ path: '/401' });
  //   }
  // }
  // },
  // { path: '/alreadySignedUp', component: () => import('pages/signup/AlreadySignedUp') },
  { path: '/forgotPassword', component: () => import('pages/signin/ForgotPwd') },
  { path: '/resetPassword/:token', component: () => import('pages/signin/ResetPwd') },
  { path: '/error403Pwd', component: () => import('pages/signin/403') },
  { path: '/bot/authenticate', component: () => import('pages/bot/Authenticate') },
  { path: '/bot/editCustomerInfo', component: () => import('pages/bot/CustomerInfo') },
  { path: '/bot/calendar', component: () => import('pages/bot/Calendar') },
  {
    path: '/bot/auxiliaries/:id',
    name: ' bot auxiliary info',
    component: () => import('pages/bot/auxiliaryInfo'),
    props: (route) => ({ id: route.params.id, token: route.query.access_token })
  },
  {
    path: '/dashboard',
    component: () => import('layouts/Layout'),
    children: [
      {
        path: '',
        component: () => import('pages/dashboard/Home'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token']
        },
        redirect: {
          path: '/'
        }
      },
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
              permission: 'planning:read',
              parent: 'planning'
            },
          },
          {
            path: 'modification',
            name: 'modification planning',
            component: () => import('pages/dashboard/planning/PlanningModification'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permission: 'planning:history',
              parent: 'planning'
            },
          },
          {
            path: 'constrainedCoaches',
            name: 'constrained coaches',
            component: () => import('pages/dashboard/planning/ConstrainedCoaches'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permission: 'duty:read',
              parent: 'planning'
            },
          }
        ]
      },
      // {
      //   path: 'auxiliaries',
      //   name: 'auxiliaries',
      //   component: () => import('pages/dashboard/auxiliaries/NavTabs'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permission: 'Auxiliaires'
      //   }
      // },
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
              permission: 'users:welcome:user',
              parent: 'benef'
            }
          }
        ]
      },
      {
        path: 'rh/auxiliaires/:id',
        name: 'auxiliary info',
        component: () => import('pages/dashboard/rh/auxiliaries/Info'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'profiles:read'
        }
      },
      {
        path: 'rh/repertoire',
        name: 'rh directory',
        component: () => import('pages/dashboard/rh/directory/Directory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permission: 'users:list',
          parent: 'rh'
        }
      },
      {
        path: 'rh/repertoire/profil/:id',
        name: 'rh directory profile',
        component: () => import('pages/dashboard/rh/directory/profile/Profile'),
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
              permission: 'profiles:edit:user',
              parent: 'rh'
            }
          },
          {
            path: 'taches',
            name: 'directory profile tasks',
            component: () => import('pages/dashboard/rh/directory/profile/Tasks'),
            meta: {
              cookies: ['alenvi_token', 'refresh_token'],
              permission: 'profiles:edit:user',
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
      //     permission: 'Pigi'
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
      //     permission: 'Paramètres'
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
