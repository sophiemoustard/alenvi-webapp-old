import router from '../router'

export default {
  redirectToLogin () {
    router.replace('/login');
  },
  redirectToDashboard () {
    router.replace('/dashboard');
  }
}
