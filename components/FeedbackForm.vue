<template>
  <!-- eslint-disable -->
  <b-container>
    <!--
    <b-button size="lg" variant="primary" v-b-modal.feedback-modal class="mb-2" style="position:fixed;right:5px;bottom:50%;">
      <b-icon icon="chat-dots-fill" aria-label="Feedback"></b-icon>
    </b-button>
    -->
    <b-modal id="feedback-modal" button-size="sm" hide-footer centered title="Feedback" data-html2canvas-ignore>
      <b-form novalidate >
          <b-form-group id="title">
              <b-form-input
                  id="title"
                  v-model="title"
                  type="text"
                  placeholder="Feedback Title"                  
                  size="sm"                  
              ></b-form-input>              
          </b-form-group>
          <b-form-group id="comment">
              <b-form-textarea
                  id="comment"
                  v-model="comment"
                  placeholder="Please tell us what bug or issue you've found, provide as much detail as possible."
                  rows="4"
                  size="sm"
              ></b-form-textarea>
          </b-form-group>
          <b-form-group id="include_screenshot">
            <b-checkbox v-model="include_screenshot" switch>Include Screenshot</b-checkbox>
          </b-form-group>
          <b-form-group id="email">
              <b-form-input
                  id="email"
                  v-model="email"
                  type="text"
                  placeholder="Your Email Address"
                  disabled
                  size="sm"                  
              ></b-form-input>
              <p class="text-danger" style="font-size:smaller">Please check the email address for accuracy and update if necessary. The SEAL team may contact you at this email address to follow-up on the feedback you provided.</p>
          </b-form-group>          
          <b-row v-if="error">
            <b-col class="text-danger mb-3">Sorry! We have encountered problem in submitting your request. Please try again later.</b-col>
          </b-row>
          <b-button variant="primary" :disabled="formSubmitInProcess" @click="submitForm()"> {{formSubmitInProcess?"Submission in Progress...":"Submit Feedback"}} </b-button>
          <b-button variant="primary" @click="$bvModal.hide('feedback-modal'); resetFeedback() ;">Close</b-button>
      </b-form>
    </b-modal>
  </b-container>
</template>

<script>

/* eslint-disable */

import html2canvas from "html2canvas";

export default {
  data: () => ({
    error: false,
    title: null,
    comment: "",
    email: "",
    include_screenshot: true,
    screenshot: "",
    formSubmitInProcess: false    
  }),
  mounted() {
    this.email = this.$store.state.user.email ; 
    console.log("In mounted method of feedback component ") ;    
    if (!this.email)
      this.email = "Email does not exist" ;  
  },
  computed: {
  },
  methods: {
    resetFeedback() {
      this.title = "" ;
      this.comment = "" ;
      this.error = false ;
      this.formSubmitInProcess =  false ;
    },
    submitForm() {
      console.log("submit feedback form called");
      this.formSubmitInProcess = true ;
      var _self = this ;

      var feedback = {
        title: this.title,
        comment: this.comment,
        email: this.email,
        screenshot: ""
      };

      if (this.include_screenshot) {
        setTimeout(function() {
          html2canvas(document.body).then(function(canvas) {
              console.log("inside the render canvas function") ;
              feedback.screenshot = canvas.toDataURL("image/png") ;
              _self.$services.seal.feedback(
                  feedback,
                  _self.$store.state.patientId,
                  _self.$store.state.appId
              ).then( response => {
                console.log("response from feedback :") ;
                console.log(response) ;
                if (response.result && response.result != "success") {
                  _self.error = true ;
                } else {
                  _self.resetFeedback() ;
                  _self.$bvModal.hide('feedback-modal') ;
                }
              }).catch(err => {
                console.log("Error in feedback submission with screenshot") ;
                console.log(err) ;
                _self.formSubmitInProcess = false ;
                _self.error = true ;
              }) ;
          });
        }, 100) ;
      } else {
        this.$services.seal.feedback(
            feedback,
            this.$store.state.patientId,
            this.$store.state.appId
        ).then( response =>{
            if (response.result && response.result != "success") {
              _self.error = true ;
            } else {
              _self.resetFeedback() ;
              _self.$bvModal.hide('feedback-modal') ;
            }          
        }).catch (err => {
            console.log("Error in feedback submission without screenshot") ;
            console.log(err) ;
            _self.formSubmitInProcess = false ;
            _self.error = true ;
        });
      }
    },
  },
};
/* eslint-enable */
</script>

<style>

</style>
