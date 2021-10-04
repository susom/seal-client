<template>
  <!-- eslint-disable -->
  <div></div>
</template>

<script>
/* eslint-disable */
export default {
  //layout: "sealhome",
  data () {
    return {
      path: "",
      favApps: [],
      availApps: []
    }
  },
  async fetch() {
    try{
      console.log("fetch method called on index.vue") ;
      if (this.$store.state.patientId === "") {
        var response = await this.$axios.get("/fhir-app/api/v1/sessInfo") ;
        console.log("got the session info") ;
        console.log(response.data) ;
        this.$store.commit('setPatientId', response.data.patient_id) ;
        this.$store.commit('setUser', { user_id: response.data.user_id, full_name: response.data.full_name }) ;

        console.log("In created method") ;
        console.log(window.location) ;
        this.path = window.location.pathname ;
        console.log(this.$route.query.page) ;
        this.$nuxt.$router.push(this.$route.query.page) ;
        
        console.log("committing to set the patinet id is done in index.vue - user " + this.$store.state.user.full_name) ;
      }      
    } catch (e)
    {
      alert("error in axios call") ;
      alert(e) ;
    }
  },
  mounted () {
    // console.log("In mounted method") ;
  },
  methods : {
    openApp(path) {
      console.log("Clicked to open the URL :" + path) ;
      if (path.indexOf(".html") > 0)
        window.location.href = path ;        
      else {
        var routeName = path.substr(path.indexOf("/fhir-app/") + 10) ;
        this.$nuxt.$router.push(routeName) ;
      }
    }
  }
}
/* eslint-enable */
</script>
