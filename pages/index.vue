<template>
  <b-container fluid class="nopadding">
    <b-navbar variant="primary" id="sealnav">      
      <b-navbar-brand>
        <b-img src="../assets/seal_home.png" rounded
          style="height:30px;width:30px;" class="mr-3" 
          ></b-img>
      </b-navbar-brand>      
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav> 
        <b-nav-text>
          <span style="font-size:1.5em;font-weight:bold;" class="text-white">SEAL</span>
          <span class="text-white ml-2">Stanford Emerging Apps Lab</span>          
        </b-nav-text>
        <b-navbar-nav class="ml-auto">        
          <span class="text-white mr-2 mt-2 text-right">Hello {{ $store.state.user.full_name }}</span>    
          <b-button v-b-modal.feedback-modal variant="link" size="sm" class="mr-1"
            v-b-tooltip.hover title="Feedback">
            <b-icon icon="chat-dots-fill" variant="light" font-scale="2"></b-icon>
          </b-button>
          <b-button variant="link" size="sm" class="mr-2"
            v-b-tooltip.hover title="Help" @click="openHelp()">
            <b-icon icon="question-circle-fill" variant="light" font-scale="2"></b-icon>
          </b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-row class="mt-3">
      <b-col cols="5" class="text-right" @click="showFavApps = false" style="cursor:pointer">
        <b-img :src="showFavApps?'home_white_gray.png':'home_white_black.png'" class="rounded-0 mr-3" style="width:39px;height:36px;"/> 
        <span :class="showFavApps?'text-black text-muted h4':'text-black h4'">App Library</span>
      </b-col>
      <b-col cols="5" class="text-left" @click="showFavApps = true" style="cursor:pointer">
        <b-img :src="showFavApps?'heart_white_black.png':'heart_white_grey.png'" class="rounded-0 mr-3" style="width:39px;height:36px;"/> 
        <span :class="showFavApps?'text-black h4':'text-black text-muted h4'">My Favorites</span>
      </b-col>      
    </b-row>

    <b-row v-if="!showFavApps">
      <b-col sm="11" md="11" lg="5" class="text-center mt-4 mr-2"
        v-for="(item) in userApps"
          :key="item.app_id">
          <b-container fluid class="rounded-lg border py-2 ml-3 shadow" style="cursor:pointer;width:450px;" @click="openApp(item)">
            <b-row class="" style="height:30px;margin-bottom:-20px;" no-gutters>
              <b-col class="text-right">
                <b-img @click.stop="toggleFav(item)" :src="(item.fav=='Y'?'heart_white_red.png':'heart_white_white.png')" class="favimg"></b-img>
              </b-col>
            </b-row>
            <b-row class="pt-2">
              <b-col cols="3">
                <b-img :src="item.config.app_image"  :alt="item.name" class="rounded-0 app-icon"></b-img>
              </b-col>
              <b-col>
                <b-row align-v="center" no-gutters style="height:100px;">
                  <b-col cols="2" class="text-center">
                    <b-img :src="item.config.app_image_2" class="mr-2" style="width:55px;"/>
                  </b-col>
                  <b-col cols="9" class="text-center h5 ml-2">
                    {{item.desc}}
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
            <b-row class="" style="height:30px;margin-top:-20px;" no-gutters>
              <b-col class="text-right">
                <b-img src="double_arrow.png" style="width:30px;"></b-img>
              </b-col>
            </b-row>
          </b-container>
      </b-col>
    </b-row>

    <b-row v-if="showFavApps">
      <b-col sm="11" md="11" lg="5" class="text-center mt-4 mr-2"
        v-for="(item) in favApps"
          :key="item.app_id">
          <b-container fluid class="rounded-lg border py-2 ml-3 shadow" style="cursor:pointer;width:450px;" @click="openApp(item)">
            <b-row class="" style="height:30px;margin-bottom:-20px;" no-gutters>
              <b-col class="text-right">
                <b-img @click.stop="toggleFav(item)" :src="(item.fav=='Y'?'heart_white_red.png':'heart_white_white.png')" class="favimg"></b-img>
              </b-col>
            </b-row>
            <b-row class="pt-2">
              <b-col cols="3">
                <b-img :src="item.config.app_image"  :alt="item.name" class="rounded-0 app-icon"></b-img>
              </b-col>
              <b-col>
                <b-row align-v="center" no-gutters style="height:100px;">
                  <b-col cols="2" class="text-center">
                    <b-img :src="item.config.app_image_2" class="mr-2" style="width:55px;"/>
                  </b-col>
                  <b-col cols="9" class="text-center h5 ml-2">
                    {{item.desc}}
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
            <b-row class="" style="height:30px;margin-top:-20px;" no-gutters>
              <b-col class="text-right">
                <b-img src="double_arrow.png" style="width:30px;"></b-img>
              </b-col>
            </b-row>
          </b-container>
      </b-col>
    </b-row>   
    <feedback-form />
    <b-modal id="homepage-help-modal" size="xl" centered hide-footer title="Release Notes and Helpful Tips" 
        body-bg-variant="dark">
        <ul class="text-white">
          <li>The SEAL homepage and apps in the library have been updated with a new design theme and user interface.</li>
          <li>Apps can now be favorited by using the “heart” icons.</li>
          <li>Apps can now be opened by using the “double arrow” icons.</li>
          <li>A new navigation bar has been added at the top of all SEAL pages, with new options for feedback and helpful tips. 
              Use the “speech bubble” icon to provide feedback to the SEAL team. Use the “question mark” icon to review help tips and instructions to navigate a particular page. 
              When away from the homepage, you can use the “home” icon to navigate back to the SEAL homepage.
          </li>
          <li>In the CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk app: A new section for “User Added Data in SEAL” is now available. 
            This new feature allows users to add a relevant condition that may not have been recorded in the patient EHR. 
            Other elements of the app design and user interface have been updated.
          </li>          
          <li>
            In the Drug Reaction Diagnostic Assistant app (previously named Medication Reactions app): The displayed data source for the app now utilizes 
            the Medication Administration Record (MAR) instead of only medication orders. In the Medications tabs, a new feature now allows users 
            to “Add Outside Med” to include medications not recorded in outside of Epic. Other elements of the app design and user interface have been updated. 
          </li>
        </ul>
        <div class="text-white">Updated as of: 09/16/2021</div>
    </b-modal>        
  </b-container>             
</template>

<script>
import FeedbackForm from '~/components/FeedbackForm.vue';

export default {
  layout: "sealhome",
  components : {
    FeedbackForm
  },
  data () {
    return {
      showFavApps: true,
      userApps: []
    }
  },  
  async fetch() {
    if (this.$store.state.patientId === "") {        
      var sessInfo = await this.$services.seal.sessinfo(0) ;
      this.$store.commit('setPatientId', sessInfo.patient_id) ;
      this.$store.commit('setUser', { user_id: sessInfo.user_id, full_name: sessInfo.full_name, email: sessInfo.email }) ;      
    } 
    this.$store.commit('setCurrentApp', { help : "homepage-help-modal" }) ;
    
    var roles = await this.$services.seal.userroles(0) ;
    //var roles =  { data: {"apps":[{"app_id":1,"name":"Medication Review","desc":"This application pulls the medications and laboratory results for a patient in specific timeframe and displayed together using charts in a timeline.","path":"/fhir-app/medreview/index.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=1","image":"images/med.png","roles":"[\"admin\"]","app_user_id":1,"sort_order":10,"fav":"Y","access_policy":"open"},{"app_id":6,"name":"Wells' Criteria for PE-V2","desc":"Wells' Criteria for Pulmonary Embolism","path":"/fhir-app/wellscriteriacalc?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=6","image":"images/calc.png","roles":"[\"admin\"]","app_user_id":19,"sort_order":10,"fav":"N","access_policy":"closed"},{"app_id":3,"name":"CHA₂DS₂-VASc Calc","desc":"CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk","path":"/fhir-app/srcalc/index.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=3","image":"images/calc.png","roles":"[\"admin\"]","app_user_id":6,"sort_order":20,"fav":"Y","access_policy":"closed"},{"app_id":5,"name":"CHA₂DS₂-VASc Calc-V2","desc":"CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk","path":"/fhir-app/strokeriskcalc?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=5","image":"images/calc.png","roles":"[\"admin\"]","app_user_id":16,"sort_order":20,"fav":"N","access_policy":"closed"},{"app_id":2,"name":"Demo Application","desc":"To test the connectivity and raw fhir json responses","path":"/fhir-app/demo/fhirdemo.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=2","image":"images/smartonfhir.png","roles":"[\"admin\"]","app_user_id":10,"sort_order":30,"fav":"Y","access_policy":"closed"},{"app_id":4,"name":"Wells' Criteria for PE","desc":"Wells' Criteria for Pulmonary Embolism","path":"/fhir-app/wellscalc/index.html?un=eAuxn-zddQFGu2MQjkde-mQ3&aid=4","image":"images/calc.png","roles":"","app_user_id":0,"sort_order":0,"fav":"","access_policy":"closed"}],"patient":"eAuxn-zddQFGu2MQjkde-mQ3"} } ;
    console.log("got response from ajax call") ;
    console.log(roles) ;    

    var appRoles = roles ;
    var userApps = [] ;

    appRoles.apps.forEach(function(app, idx) {  
      if (app.access_policy == 'open' || app.roles !== "") {
        userApps.push(app) ;
      }
    }) ;

    this.userApps = userApps ;

    this.showFavApps = (this.favApps.length > 0);

    console.log("fetch method completed - all aps favapp:" + this.showFavApps) ;
    console.log(this.userApps) ;

  },
  mounted () {
        
  },
  computed : {
    favApps() {          
      return this.userApps.filter(app => (app.fav == "Y")) ;
    }
  },
  methods : {
    openApp(app) {
      console.log("Clicked to open the Path :" + app.path + " rotuer name:" + app.config.route_name) ;
      if (app.config.route_name)
        this.$nuxt.$router.push(app.config.route_name) ;
      else
        window.location.href = app.path ;
    },
    toggleFav(app) {
      app.fav = (app.fav == "Y"?"N":"Y") ;
      this.$services.seal.updatefav(app, 0).then(resp => {
        console.log("Response from update fav axios call :" + resp) ;
      })
    },
    openHelp() {
      if (this.$store.state.currentApp.help) {
        this.$bvModal.show(this.$store.state.currentApp.help) ;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
    .active {
      color: var(--secondary) ;
    }
</style>

<style scoped>

  #sealnav {
    background-image: linear-gradient(to right, #8d2c38 , #47a3ff);
  }
  
  .navbar {
      padding-top: 0.3em ;
      padding-bottom: 0.3em ;
      padding-right: 0.5em ;
      padding-left: 0.5em ;
    }

    .navbar-text {
      padding-top: 0 ;
      padding-bottom: 0;
    }
    
    .app-icon {
      height: 100px;
    }
    
    .favimg {
      width:30px;
    }

    .rounded-lg {
      border-radius: .8em !important ;
    }
</style>