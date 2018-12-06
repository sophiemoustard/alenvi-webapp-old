import ogust from '../api/Ogust'

export default ({ app, router, Vue }) => {
  Vue.prototype.$ogust = ogust;
}
