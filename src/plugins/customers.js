// import something here
import customers from '../api/Customers'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$customers = customers;
}
