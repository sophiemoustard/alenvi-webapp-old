import moment from 'moment'

export default ({ app, router, Vue }) => {
  moment.locale('fr');
  Vue.prototype.$moment = moment;
}
