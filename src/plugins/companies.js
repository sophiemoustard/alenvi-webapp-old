// import something here
import companies from '../api/Companies'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$companies = companies;
}
