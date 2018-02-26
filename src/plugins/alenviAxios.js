import { alenviAxios } from '../api/ressources/alenviAxios'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$alenviAxios = alenviAxios;
}
