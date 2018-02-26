// import something here
import planningUpdates from '../api/planningUpdates';

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$planningUpdates = planningUpdates;
}
