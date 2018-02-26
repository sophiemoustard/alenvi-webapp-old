// import something here
import activationCode from '../api/ActivationCode'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$activationCode = activationCode;
}
