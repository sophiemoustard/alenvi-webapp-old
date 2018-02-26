// import something here
import ogust from '../api/Ogust'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$ogust = ogust;
}
