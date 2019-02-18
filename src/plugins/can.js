export default ({ app, router, Vue }) => {
  Vue.prototype.$can = (params) => {
    if (params.user && params.user.role && params.user.role.rights) {
      return params.user.role.rights.some(right => right.permission === params.permission && right.hasAccess);
    }
    return false;
  }
}
