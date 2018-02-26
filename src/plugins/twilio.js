// import something here
import twilio from '../api/Twilio'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$twilio = twilio;
}
