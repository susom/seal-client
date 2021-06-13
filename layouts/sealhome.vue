<template>
  <v-app>
    <v-app-bar
      fixed
      app
      color="primary"
      dark
      dense
    >
      <v-toolbar-title v-text="title"/>
      <v-spacer />
    </v-app-bar>
    <v-main class="sealhome">
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
    <!--
    <v-footer
      app
      dark
      color="primary"
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
    -->
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      title: 'SEAL Applications'
    }
  }
}
</script>

<style>
    .sealhome {
        background-color: #daf7ff ;     
        background-image: url(/fhir-app/images/seal_banner.jpg);       
        background-position-y: bottom;
        background-repeat: no-repeat;
        background-size: contain;
    }
    .homeTitleBar {
      background-color: blue;
    }
</style>