// import something here
import users from '../api/Users'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$users = users;
}
