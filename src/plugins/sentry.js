// import something here
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Raven
    .config('https://db50f77df4cc4e4eafa8e221d267c541@sentry.io/287454', { environment: 'production' })
    .addPlugin(RavenVue, Vue)
    .install();
}
