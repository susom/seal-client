<template>
  <v-container html2canvas-ignore="true">
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-fab-transition>
          <v-btn
            color="primary"
            class="mb-10"
            dark
            absolute            
            right
            fab
            v-bind="attrs"
            v-on="on"
            style="bottom:50%"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <v-card id="modalDiv">
        <v-card-title>
          <span class="headline">Feedback</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form v-model="valid">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  label="Title*"
                  v-model="title"
                  placeholder="Feedback title"
                  outlined
                  required
                  hide-details
                  dense
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  label="Comment"
                  v-model="comment"
                  outlined
                  hide-details
                  dense
                  placeholder="Please tell us what bug or issue you've found, provide as much detail as possible."
                >
                </v-textarea>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="include_screenshot"
                  inset
                  dense
                  label="Include Screenshot"
                ></v-switch>
              </v-col>
              <!--
              <v-col cols="12">
                <v-text-field
                  label="Email*"
                  v-model="email"
                  outlined
                  required
                  dense
                  hide-details
                ></v-text-field>
              </v-col>
              -->
            </v-row>
            </v-form>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!valid"
            @click="dialog = false; submitForm();"
          >
            Submit Feedback
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>

    <v-bottom-sheet
      v-model="sheet"
      inset
    >
      <v-sheet
        class="text-center"
        height="150px"
      >
        <v-btn
          class="mt-8"
          text
          color="error"
          @click="sheet = !sheet"
        >
          close
        </v-btn>
        <div class="my-3">
          Sorry! We have encountered problem in submitting your request. Please try again later.
        </div>
      </v-sheet>
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import html2canvas from "html2canvas";

export default {
  data: () => ({
    dialog: false,
    title: "",
    comment: "",
    include_screenshot: true,
    screenshot: "",
    email: "",
    sheet: false,
    valid: true,
    rules: {
        required: value => !!value || 'Required.'
    }
  }),
  methods: {
    submitForm() {
      console.log("submit feedback form called");
      var _self = this ;
      var feedback = {
        title: this.title,
        comment: this.comment,
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
              ).catch(err => {
                _self.sheet = true ;
              }) ;
          });
        }, 100) ;
      } else {
        this.$services.seal.feedback(
            feedback,
            this.$store.state.patientId,
            this.$store.state.appId
        );
      }
    },
  },
};
</script>

<style>

</style>