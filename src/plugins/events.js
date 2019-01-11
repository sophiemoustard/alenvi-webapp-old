import events from '../api/Roles'

export default ({ app, router, Vue }) => {
  Vue.prototype.$events = events;
}
