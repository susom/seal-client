<template>
  <div></div>
</template>

<script>
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
      console.log("fetch method called") ;
      if (this.$store.state.patientId === "") {
        var response = await this.$axios.get("/fhir-app/api/v1/patientId") ;
        console.log("got the patient id" + response.data) ;
        this.$store.commit('setPatientId', response.data) ;
        //this.$store.commit('setPatientId', 'eAuxn-zddQFGu2MQjkde-mQ3') ;
      }      
    } catch (e)
    {
      alert("error in axios call") ;
      alert(e) ;
    }
  },  
  created() {
    console.log("In created method") ;
    console.log(window.location) ;
    this.path = window.location.pathname ;
    console.log(this.$route.query.page) ;
    this.$nuxt.$router.push(this.$route.query.page) ;
  },
  mounted () {
    console.log("In mounted method") ;
    //console.log(window.location) ;
    //this.path = window.location.pathname ;
    //console.log(this.$route.query.page) ;
    //this.$nuxt.$router.push(this.$route.query.page) ;
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
</script>

<style scoped>
    .app-img {
        height: 80px ;
        width : 80px ;
    }
    .app-inner {
        text-align: center;
    }
    .app-title {
        width : 100% ;
        text-align: center;
        font-size:small ;
        font-weight: bold ;
        color:black;
    }
    #appsContainerDiv {
        height : 40vh ;
    }
    #appsContainerDiv1 {
        height : 40vh ;
    }
</style>