export default {
  initResponsive (scheduler, options) {
    // regular header height for Terrace or Flat skin
    var navbarHeight = 59,
      // regular header for Glossy or Standart skin
      navbarClassicHeight = 23,
      // height for Terrace and Flat in Mobile mode
      navbarMobileHeight = 130,
      // height for Glossy and Standart in Mobile mode
      navbarClassicMobileHeight = 140,
      // load QuickInfo if mobile browser detected
      // loadQuickInfo = true,
      // navbar label formats for Regular and Mobile modes
      scaleDate = '%F, %D %d',
      scaleDateMobile = '%D %d';
    // we’ll need to handle Glossy and Standart(classic) skins
    // a bit differently from Terrace and Flat
    var classic = { 'glossy': true, 'classic': true };

    function setSizes (navHeight, navHeightClassicSkin, scaleDate) {
      if (options && options.customer && options.mobile) {
        scheduler.xy.nav_height = 70;
      } else {
        scheduler.xy.nav_height = navHeight;
      }

      if (classic[scheduler.skin]) {
        scheduler.xy.nav_height = navHeightClassicSkin;
      }
    }

    scheduler.attachEvent('onBeforeViewChange', function setNavbarHeight () {
      /* set sizes based on screen size */
      if (typeof scheduler !== 'undefined') {
        if (window.innerWidth >= 768) {
          setSizes(navbarHeight, navbarClassicHeight, scaleDate);
        } else {
          setSizes(navbarMobileHeight, navbarClassicMobileHeight, scaleDateMobile);
        }
      }
      return true;
    });
  }
}
