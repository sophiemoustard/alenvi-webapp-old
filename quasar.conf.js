require('dotenv').config();

module.exports = function (ctx) {
  return {
    plugins: [
      'i18n',
      'axios',
      'activationCode',
      'alenviAxios',
      'bot',
      'can',
      'companies',
      'customers',
      'googleDrive',
      'email',
      'features',
      'lodash',
      'messages',
      'moment',
      'ogust',
      'planningUpdates',
      'roles',
      'twilio',
      'vue-croppa',
      'vMask',
      'users',
      'vuelidate',
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
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      publicPath: '/',
      gzip: true,
      useNotifier: false,
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        }, {
          test: /\.txt$/,
          use: 'raw-loader'
        })
      },
      env: {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_HOSTNAME: JSON.stringify(process.env.API_HOSTNAME),
        COMPANI_HOSTNAME: JSON.stringify(process.env.COMPANI_HOSTNAME),
        MESSENGER_LINK: JSON.stringify(process.env.MESSENGER_LINK),
        ENTERCODE_LINK: JSON.stringify(process.env.ENTERCODE_LINK),
        TOKEN_SECRET: JSON.stringify(process.env.TOKEN_SECRET),
        ALENVI_BOT_ID: JSON.stringify(process.env.ALENVI_BOT_ID),
        CLOUDINARY_API_KEY: JSON.stringify(process.env.CLOUDINARY_API_KEY),
        CLOUDINARY_API_SECRET: JSON.stringify(process.env.CLOUDINARY_API_SECRET),
        CLOUDINARY_CLOUD_NAME: JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
        GA_TRACKING_ID: JSON.stringify(process.env.GA_TRACKING_ID)
      }
    },
    devServer: {
      open: true
    },
    framework: {
      i18n: 'fr',
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
        'QItemSide',
        'QItemSeparator',
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
        'QRouteTab',
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
        'QChipsInput',
        'QCollapsible',
        'QBtnToggle',
        'QOptionGroup'
      ],
      directives: [
        'Ripple'
      ],
      plugins: [
        'Notify',
        'Cookies',
        'Loading',
        'Dialog'
      ]
    },
    animations: [
      'fadeIn',
      'fadeOut'
    ],
    ssr: {
      pwa: false
    },
    pwa: {
      manifest: {
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
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'quasar-app'
      }
    }
  }
}
