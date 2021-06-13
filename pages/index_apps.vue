<template>
  <v-row>    
    <v-col class="text-center">
      <div class="row mb-3" style="background-color: lightblue;color:black;">
          <span class="ml-3 mt-2">Favorite Apps</span>
          <nuxt-link to="/testdd">Test Drag & Drop Page</nuxt-link>     
      </div>          
      <div id="appsContainerDiv">
        <draggable :list="favApps" group="appitems" class="row" @end="onEnd" >
          <v-col
            cols="1"
            v-for="(item) in favApps"
            :key="item.app_id"
            style="font-weight:bold"
          >
            <div class="app-outer" :app_id='item.app_id' @click="openApp(item.path)">
              <div class="app-inner"> 
                  <img class="app-img" :src="item.image" :alt="item.name" /> 
                  <div class="app-title">{{item.name}}</div> 
                </div> 
            </div>
          </v-col>
        </draggable>
      </div>
      <div class="row mt-3 mb-3" style="background-color: lightblue;color:black;">
          <span class="ml-3 mt-2">Available Apps</span> 
      </div>
      <div id="appsContainerDiv1">
        <draggable :list="availApps" group="appitems" class="row" @end="onEnd" > <!-- emptyInsertThreshold="1" -->
          <v-col
            cols="1"
            v-for="(item) in availApps"
            :key="item.id"
            style="font-weight:bold"
          >
            <div class="app-outer" :app_id='item.app_id'  @click="openApp(item.path)">
              <div class="app-inner"> 
                  <img class="app-img" :src="item.image" :alt="item.name" />
                  <div class="app-title">{{item.name}}</div> 
                </div> 
              </div>
          </v-col>
        </draggable>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  layout: "sealhome",
  components : {
    draggable
  },
  data () {
    return {
      favApps: [],
      availApps: []
    }
  },
  async fetch() {
    try{
      if (this.$store.state.patientId === "") {
        var response = await this.$axios.get("/fhir-app/api/v1/patientId") ;
        console.log("got the patient id" + response.data) ;
        this.$store.commit('setPatientId', response.data) ;
        //this.$store.commit('setPatientId', 'eAuxn-zddQFGu2MQjkde-mQ3') ;
      }
      console.log("fetch method called") ;
      var roles = await this.$axios.get("/fhir-app/api/v1/roles?pid=" + this.$store.state.patientId) ;
      //var roles =  { data: {"apps":[{"app_id":1,"name":"Medication Review","desc":"This application pulls the medications and laboratory results for a patient in specific timeframe and displayed together using charts in a timeline.","path":"/fhir-app/medreview/index.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=1","image":"images/med.png","roles":"[\"admin\"]","app_user_id":1,"sort_order":10,"fav":"Y","access_policy":"open"},{"app_id":6,"name":"Wells' Criteria for PE-V2","desc":"Wells' Criteria for Pulmonary Embolism","path":"/fhir-app/wellscriteriacalc?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=6","image":"images/calc.png","roles":"[\"admin\"]","app_user_id":19,"sort_order":10,"fav":"N","access_policy":"closed"},{"app_id":3,"name":"CHA₂DS₂-VASc Calc","desc":"CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk","path":"/fhir-app/srcalc/index.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=3","image":"images/calc.png","roles":"[\"admin\"]","app_user_id":6,"sort_order":20,"fav":"Y","access_policy":"closed"},{"app_id":5,"name":"CHA₂DS₂-VASc Calc-V2","desc":"CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk","path":"/fhir-app/strokeriskcalc?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=5","image":"images/calc.png","roles":"[\"admin\"]","app_user_id":16,"sort_order":20,"fav":"N","access_policy":"closed"},{"app_id":2,"name":"Demo Application","desc":"To test the connectivity and raw fhir json responses","path":"/fhir-app/demo/fhirdemo.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=2","image":"images/smartonfhir.png","roles":"[\"admin\"]","app_user_id":10,"sort_order":30,"fav":"Y","access_policy":"closed"},{"app_id":4,"name":"Wells' Criteria for PE","desc":"Wells' Criteria for Pulmonary Embolism","path":"/fhir-app/wellscalc/index.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=4","image":"images/calc.png","roles":"","app_user_id":0,"sort_order":0,"fav":"","access_policy":"closed"}],"patient":"eAuxn-zddQFGu2MQjkde-mQ3"} } ;
      console.log("got response from ajax call") ;
    } catch (e)
    {
      alert("error in axios call") ;
      alert(e) ;
    }
    console.log(roles) ;    

    var appRoles = roles.data ;
    var favApps = [] ;
    var availApps = [] ;

    //appRoles.apps.forEach(app => {
    appRoles.apps.forEach(function(app, idx) {  
      console.log(app);
      if (app.access_policy == 'open' || app.roles !== "") {                        
          if (app.fav == "Y") {
              favApps.push(app) ;
          } else {
              availApps.push(app) ;
          }
      }
    }) ;

    this.favApps = favApps ;
    this.availApps = availApps ;    
    console.log("fetch method completed") ;

  },

  mounted () {
    console.log("To simulate js error") ;
    //document.getElementById("doesntexist").innerHTML ="error stuff" ;
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
    },
    async onEnd (event) {
      console.log("on end event fired") ;

      console.log(event) ;
      var apps = [] ;

      this.favApps.forEach(function(app, idx) {
        apps.push({ app_id: app.app_id, sort_order : (idx + 1) * 10, fav : "Y" }) ;
      }) ;

      this.availApps.forEach(function(app, idx) {
        apps.push({ app_id: app.app_id, sort_order : (idx + 1) * 10, fav : "N" }) ;
      }) ;

      var data = await this.$axios.post("/fhir-app/api/v1/apps", JSON.stringify(apps)) ;
      console.log(data) ;

      console.log(this.favApps);
      console.log(this.availApps);      
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