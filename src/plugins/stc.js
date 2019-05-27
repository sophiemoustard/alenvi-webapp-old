import stc from '../api/Stc';

export default ({ app, router, Vue }) => {
  Vue.prototype.$stc = stc;
}
