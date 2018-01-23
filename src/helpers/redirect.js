import router from '../router'

export default {
  redirectToLogin () {
    router.replace('/dashboard/login');
  },
  redirectToDashboard () {
    router.replace('/dashboard');
  }
}
