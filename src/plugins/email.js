// import something here
import email from '../api/Email'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$email = email;
}
