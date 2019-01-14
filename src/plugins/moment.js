import moment from 'moment';
import { extendMoment } from 'moment-range';

export default ({ app, router, Vue }) => {
  moment.locale('fr');
  const momentRange = extendMoment(moment);
  Vue.prototype.$moment = momentRange;
}
