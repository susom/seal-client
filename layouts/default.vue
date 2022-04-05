<template>
  <b-container fluid style="height:100vh" class="nopadding">
    <b-row no-gutters>
      <b-col cols="12">
        <b-navbar variant="primary" id="sealnav">
          <b-navbar-brand>
            <b-img src="seal_home.png" rounded @click="sendToHome()" 
            style="height:30px;width:30px;" class="mr-3"
            v-b-tooltip.hover title="SEAL Home"></b-img>
          </b-navbar-brand>
          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
          <b-collapse id="nav-collapse" is-nav> 
            <b-nav-text style="font-size:1.6em;font-weight:bold;" class="text-white">{{pageTitle()}}</b-nav-text>
            <b-navbar-nav class="ml-auto">
              <b-button variant="link" size="sm" class="mr-1"
                v-b-tooltip.hover title="Home" @click="sendToHome()">  
                <b-img src="home_white.png" style="height:26px;width:26px;"></b-img>
              </b-button>              
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
      </b-col>
    </b-row>
    <b-row no-gutters>
      <b-col cols="12">
        <nuxt />
      </b-col>
    </b-row>
    <feedback-form />
  </b-container>
</template>

<script>
import FeedbackForm from '~/components/FeedbackForm.vue';
export default {
  components: { FeedbackForm },
  data () {
    return {
      title: 'SEAL'
    }
  },
  methods : {
    pageTitle() {
      return this.$store.state.pageTitle ;
    },
    sendToHome() {
      this.$nuxt.$router.push("/") ;
    },
    openHelp() {
      if (this.$store.state.currentApp.help) {
        this.$bvModal.show(this.$store.state.currentApp.help) ;
      }
    }
  }  
}
</script>

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
    
</style>

<style>
  a {
    color: black ;
  }
  .rounded-lg {
    border-radius: .8em !important ;
  }
  .nav-tabs .nav-link {
      background-color: #b7b7b7;
      font-weight: bold;        
  }
  .smallfont {
      font-size: .95em !important;
  } 
</style>
