import rules from './rules';

const findPermission = (right, params) => {
  return (permission) => {
    if (typeof permission === 'string') {
      return permission === right.permission && right.hasAccess;
    } else if (typeof permission === 'object' && typeof permission.rule === 'string') {
      if (!rules[permission.rule]) throw new Error('[can] rule does not exist')
      return permission.name === right.permission && right.hasAccess && rules[permission.rule](params);
    }
  }
}

export const can = (params) => {
  if (params.user && params.user.role && params.user.role.rights) {
    return params.user.role.rights.filter(right => right ? params.permissions.some(findPermission(right, params)) : false).length > 0;
  }
  return false;
};
