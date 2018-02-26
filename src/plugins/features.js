// import something here
import features from '../api/Features'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$features = features;
}
