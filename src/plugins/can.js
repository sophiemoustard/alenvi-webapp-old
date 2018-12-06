import { can } from '../directives/can'

export default ({ app, router, Vue }) => {
  Vue.directive('can', can);
}
