import planningUpdates from '../api/PlanningUpdates';

export default ({ app, router, Vue }) => {
  Vue.prototype.$planningUpdates = planningUpdates;
}
