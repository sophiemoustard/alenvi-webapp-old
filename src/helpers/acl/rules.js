export default {
  isOwner (params) {
    if (!params.user._id || !params.auxiliaryIdEvent) throw new Error('[can] wrong rule parameters');
    return params.user._id === params.auxiliaryIdEvent;
  },
  isInSameSector (params) {
    if (!params.user.sector) return true;
    return params.user.sector === params.auxiliarySectorEvent;
  },
}
