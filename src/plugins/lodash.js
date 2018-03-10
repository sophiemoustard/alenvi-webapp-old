// import something here
import _ from 'lodash'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$_ = _
}
