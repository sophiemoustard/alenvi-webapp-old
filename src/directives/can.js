import redirect from '../router/redirect';

const commentNode = (el, vnode) => {
  const comment = document.createComment(' ')

  Object.defineProperty(comment, 'setAttribute', {
    value: () => undefined
  })

  vnode.text = ' '
  vnode.elm = comment
  vnode.isComment = true
  vnode.context = undefined
  vnode.tag = undefined
  vnode.data.directives = undefined

  if (vnode.componentInstance) {
    vnode.componentInstance.$el = comment
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(comment, el)
  }
}

export const can = (el, binding, vnode) => {
  if (binding.value.user.role && binding.value.user.role.features) {
    for (let i = 0, l = binding.value.user.role.features.length; i < l; i++) {
      if (binding.value.user.role.features[i].name === binding.value.feature) {
        // el.style.display = binding.value.user.role.features[i].permission_level === 0 ? 'none' : el.style.display;
        if (binding.value.user.role.features[i].permission_level === 0) {
          commentNode(el, vnode);
        }
      }
    }
  } else {
    return redirect.redirectToLogin();
  }
};
