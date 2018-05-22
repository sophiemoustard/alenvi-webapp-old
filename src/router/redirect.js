import router from './index'

export default {
  redirectToLogin (params) {
    if (params && params.to) {
      return router.replace({ path: '/login', query: { from: params.to.path } });
    }
    router.replace('/login');
  },
  redirectToDashboard () {
    router.replace('/dashboard');
  }
}
