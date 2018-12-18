import esign from '../api/ESign'

export default ({ app, router, Vue }) => {
  Vue.prototype.$esign = esign;
}
