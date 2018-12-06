import messages from '../api/Messages'

export default ({ app, router, Vue }) => {
  Vue.prototype.$messages = messages;
}
