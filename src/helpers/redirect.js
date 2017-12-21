import router from '../router'

export default {
  redirectToLogin () {
    router.push('/dashboard/login');
  },
  redirectToDashboard () {
    router.push('/dashboard');
  }
}
