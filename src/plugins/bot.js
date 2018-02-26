// import something here
import bot from '../api/Bot'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.prototype.$bot = bot;
}
