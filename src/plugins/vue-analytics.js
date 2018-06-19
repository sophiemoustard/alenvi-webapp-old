// import something here
import VueAnalytics from 'vue-analytics'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.use(VueAnalytics, {
    id: process.env.GA_TRACKING_ID,
    checkDuplicatedScript: true,
    router,
    ignoreRoutes: ['settings']
  });
}
