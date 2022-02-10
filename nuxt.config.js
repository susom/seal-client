export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  // { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro' }
  head: {
      titleTemplate: '%s - Seal',
      title: 'Seal Applications',
      meta: [
        { "http-equiv" : "X-UA-Compatible", content : "IE=edge"  },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' }
	],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
    script: [
      {
        src:
          'https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.4.4/polyfill.min.js'
      }      
    ]	
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  // '~/assets/sourcesanspro.css'
  css: [
    '~/assets/variables.scss',
    '~/assets/sourcesanspro.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/services.js',
    '~/plugins/interceptor.js',
    '~/plugins/axios.js',  // dynamic baseUrl
    '~/plugins/errors.js'   // disable auto error redirection	  
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    'nuxt-highcharts',
    'nuxt-moment'	
  ],

  // Include bootstrap icons
  bootstrapVue: {
    icons: true,
    bootstrapCSS: false, // Or `css: false`
    bootstrapVueCSS: false // Or `bvCSS: false`
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  // baseURL: process.env.BASE_URL
  // https://localhost:8000
  // https://seal-stage.med.stanford.edu
  // https://seal-fhir-poc.med.stanford.edu

  axios: {
    
  },

  highcharts: {
    /* module options */
    exporting : true
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  router: {
    base: '/fhir-app/seal/'
  },

  build: {
    babel: {
      compact: true
    }
  }
}
