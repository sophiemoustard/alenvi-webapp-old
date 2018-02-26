import router from './index'

export default {
  redirectToLogin () {
    router.replace('/login');
  },
  redirectToDashboard () {
    router.replace('/dashboard');
  }
}
