// import something here
import messages from '../api/Messages'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$messages = messages;
}
