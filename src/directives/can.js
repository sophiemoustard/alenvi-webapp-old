import redirect from '../helpers/redirect';

export const can = (el, binding) => {
  if (binding.value.user.role && binding.value.user.role.features) {
    for (let i = 0, l = binding.value.user.role.features.length; i < l; i++) {
      if (binding.value.user.role.features[i].name === binding.value.feature) {
        el.style.display = binding.value.user.role.features[i].permission_level === 0 ? 'none' : el.style.display;
      }
    }
  } else {
    return redirect.redirectToLogin();
  }
};
