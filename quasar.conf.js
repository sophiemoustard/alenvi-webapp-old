// Configuration for your app
require('dotenv').config();

module.exports = function (ctx) {
  return {
    plugins: [
      'i18n',
      'axios',
      // 'sentry',
      'alenviAxios',
      'vuelidate',
      'users',
      'activationCode',
      'bot',
      'email',
      'features',
      'messages',
      'ogust',
      'planningUpdates',
      'roles',
      'twilio',
      'moment',
      'can',
      'lodash',
      'vue-croppa',
      process.env.NODE_ENV === 'production' ? 'vue-analytics' : null
    ],
    css: [
      'app.styl'
    ],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      'material-icons',
      'ionicons',
      'mdi',
      'fontawesome'
    ],
    supportIE: true,
    vendor: {
      add: [],
      remove: []
    },
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      publicPath: '/',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      useNotifier: false,
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        })
      },
      env: {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_HOSTNAME: JSON.stringify(process.env.API_HOSTNAME),
        MESSENGER_LINK: JSON.stringify(process.env.MESSENGER_LINK),
        TOKEN_SECRET: JSON.stringify(process.env.TOKEN_SECRET),
        ALENVI_BOT_ID: JSON.stringify(process.env.ALENVI_BOT_ID),
        CLOUDINARY_API_KEY: JSON.stringify(process.env.CLOUDINARY_API_KEY),
        CLOUDINARY_API_SECRET: JSON.stringify(process.env.CLOUDINARY_API_SECRET),
        CLOUDINARY_CLOUD_NAME: JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
        GA_TRACKING_ID: JSON.stringify(process.env.GA_TRACKING_ID)
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QListHeader',
        'QItem',
        'QItemMain',
        'QItemSeparator',
        'QItemSide',
        'QItemTile',
        'QField',
        'QInput',
        'QSelect',
        'QCard',
        'QCardTitle',
        'QCardMain',
        'QCardSeparator',
        'QCardActions',
        'QCardMedia',
        'QCheckbox',
        'QRadio',
        'QSpinner',
        'QPopover',
        'QDatetime',
        'QTable',
        'QSearch',
        'QTd',
        'QTr',
        'QTabs',
        'QTab',
        'QTabPane',
        'QModal',
        'QAutocomplete',
        'QScrollObservable',
        'QResizeObservable',
        'QInnerLoading',
        'QAjaxBar',
        'QStepper',
        'QStep',
        'QStepperNavigation',
        'QUploader',
        'QToggle',
        'QChipsInput'
      ],
      directives: [
        'Ripple'
      ],
      plugins: [
        'Notify',
        'Cookies',
        'Loading',
        'Dialog'
      ],
      i18n: 'fr'
    },
    // animations: 'all' --- includes all animations
    animations: [
      'fadeIn',
      'fadeOut'
    ],
    pwa: {
      cacheExt: 'js,html,css,ttf,eot,otf,woff,woff2,json,svg,gif,jpg,jpeg,png,wav,ogg,webm,flac,aac,mp4,mp3',
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      extendWebpack (cfg) {
        // do something with cfg
      },
      packager: {
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.0-beta.4'
  }
}
