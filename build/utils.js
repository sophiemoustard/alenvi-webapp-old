exports.module_exists = (moduleName) => {
  try {
    return require.resolve(moduleName);
  } catch(e) {
    // console.warn('Custom dev env not loaded');
    return false
  }
}
