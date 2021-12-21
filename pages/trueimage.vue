<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="chads2vasc_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    True Image is a dashboard for clinical photo adequacy assessment developed by SEAL in partnership with Dr. Justin Ko (SHC). 
                <p>
                <p>
                    The app uses data from the EMR at Stanford Health Care and an AI model of image quality to assess the likelihood that 
                    patient attachments are of sufficient quality for use in Dermatology e-consults. 
                </p>
            </b-col>
        </b-row>
        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title>TrueImage Dashboard</b-card-title>
                    <b-card-text>           
                        <!--             
                        <b-row class="mb-2">
                            <b-col>
                                <b-img :src="getImagePath({scan_file: 's-prd-370044247.jpg'}, 'thumbnail')" @click="openImage(image)" class="email-image"/>
                            </b-col>
                        </b-row>                        
                        -->
                        <b-row class="mb-2">
                            <b-col class="text-left ml-3">
                                <b-icon icon="arrow-left-square-fill"  font-scale="1.3" class="mr-3" @click="prevDate"/>
                                <span class="font-weight-bold">
                                    Showing Results for {{ emailDateFormatted }}
                                </span>                            
                                <b-form-datepicker
                                    v-model="emailDate"
                                    button-only                            
                                    :date-format-options="{ month: 'numeric', day: 'numeric', year: 'numeric' }"
                                    locale="en-US"                        
                                    size="sm"
                                    class="ml-2"
                                    aria-controls="emailDate"                                
                                    hide-header
                                    close-button                                        
                                    no-flip                                
                                    @context="fetchEmails"                         
                                ></b-form-datepicker>
                                <b-icon icon="arrow-right-square-fill" font-scale="1.3" class="ml-3" @click="nextDate"/>
                            </b-col>
                            <b-col class="text-right">
                                <span class="font-weight-bold">Provider:</span> 
                                <b-select :options="providerList" 
                                    v-model="providerId"     
                                    @change="fetchEmails"                                
                                    class="ml-2" style="width:60%"/>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col cols="12">
                                <b-table striped :items="emails.data" :fields="emails.fields"
                                    small
                                    hover                                    
                                    :busy="emails.loading"
                                    show-empty>
                                    <template #table-busy>
                                        <div class="text-center text-primary my-2">
                                            <b-spinner class="align-middle"></b-spinner>
                                            <strong>Loading...</strong>
                                        </div>
                                    </template>
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">No Emails with Photo available</h5>
                                    </template> 
                                    <template #cell(images)="data">
                                        <span v-for="image in data.item.images" class="ml-2">
                                            <b-img :src="getImagePath(image, 'thumbnail')"
                                            :style="{borderColor: getBorderColor(image) }"
                                                :alt="image.doc_descr" @click="openImage(image)" @error="imageError(image)" class="email-image" />
                                        </span>
                                    </template>
                                </b-table>                                        
                            </b-col>
                        </b-row>
                    </b-card-text>  
                </b-card>
            </b-col>
        </b-row>
        <b-modal id="image-modal" button-size="sm" centered header-bg-variant="primary" size="lg"
            title="Image" ok-only ok-title="Close">
            <b-row>
                <b-col cols="9">
                    <b-img :src="getImagePath(chosenImage, 'full')"
                        :style="{borderColor: getBorderColor(chosenImage) }"
                        :alt="chosenImage.doc_descr" class="email-full-image" />
                </b-col>
                <b-col cols="3">

                </b-col>
            </b-row>
        </b-modal>        
    </b-container>      
</template>
    
<script>
export default {
    data() {
        return {
            emailDate: '',
            providerId: '',
            emails : {
                data: [],
                fields: [                    
                    {label: 'From', key: 'pat_name', sortable: false, thStyle: {width: '15%'}},
                    {label: 'Subject', key: 'subject', sortable: false, thStyle: {width: '15%'}},
                    {label: 'Body', key: 'note_short', sortable: false, thStyle: {width: '25%'}},
                    {label: '# of Images', key: 'total_images', sortable: false, thStyle: {width: '10%'}},
                    {label: 'Images', key: 'images', sortable: false, thStyle: {width: '20%'}}
                ],
                loading: false
            },
            chosenImage: {},
            providerList: [{text: 'Ron Li', value: 'S0169406'}, 
                            {text: 'Beth Martin', value: 'S0050381'},
                            {text: 'S0023981', value: 'S0023981'}]
        }
    },
    async fetch() {
        console.log("In fetch method of the trueimage page env ") ;

        var _self = this ;

        this.$store.commit('setAppId', this.$services.trueimage.APP_ID) ;
        this.$store.commit('setPageTitle', "TrueImage: Clinical Photo Adequacy Dashboard") ;
        this.$store.commit('setCurrentApp', { help : "trueimage-help-modal" }) ;
        this.$services.srcalc.dblog("TrueImageHome", "In True Image Home Page") ;

        this.emailDate = this.$moment(new Date()).format("YYYY-MM-DD") ;       
        this.providerId = "S0050381" ; 

    },
    computed : {
        emailDateFormatted () {
            return this.$moment(this.emailDate, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        }
    },
    methods : {
        async fetchEmails() {
            console.log("In fetchEmails Method...") ;
            this.emails.loading = true ;
            this.emails.data = await this.$services.trueimage.emails(this.emailDate, this.providerId) ;            
            console.log(this.emails.data) ;
            this.seal_photos = await this.$services.trueimage.seal_photos(this.emailDate, this.providerId) ;
            this.emails.data.forEach(email => {
                email.images.forEach(image => {                    
                    var sealPhoto = this.seal_photos.find(function(photo) { return photo.image_name == image.scan_file }) ;                    
                    if (sealPhoto) {
                        console.log("Found seal photo for " + image.scan_file + ": " + JSON.stringify(sealPhoto)) ;
                        this.$set(image, 'user_result', sealPhoto.user_result) ;
                        this.$set(image, 'user_reason', sealPhoto.user_reason) ;
                        this.$set(image, 'modal_result', sealPhoto.modal_result) ;
                        this.$set(image, 'modal_reason', sealPhoto.modal_reason) ;                        
                        this.$set(image, 'seal_photo_id', sealPhoto.seal_photo_id) ;
                    } else {
                        console.log("NOT Found seal photo for " + image.scan_file + ": ") ;
                    }
                }) ;
            }) ;    
            console.log("*** Emails after setting photo data {}", this.emails) ;

            this.emails.loading = false ;            
            this.emails.data.forEach(email => {
                email.images.forEach(image => {
                    if (!image.seal_photo_id || image.seal_photo_id < 0) {
                        this.$services.trueimage.modalData(image, this.emailDate, this.providerId).then(response => {                            
                            this.$set(image, 'user_result', response.data.result) ;
                            this.$set(image, 'user_reason', response.data.reason) ;
                            this.$set(image, 'modal_result', response.data.result) ;
                            this.$set(image, 'modal_reason', response.data.reason) ;                        
                            this.$set(image, 'seal_photo_id', response.data.seal_photo_id) ;
                        }) ;
                    }
                }) ;
            }) ;
        },
        nextDate() {
            this.emailDate = this.$moment(this.emailDate, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD") ;
        },
        prevDate() {
            this.emailDate = this.$moment(this.emailDate, "YYYY-MM-DD").add(-1, 'days').format("YYYY-MM-DD") ;
        },
        openImage(image) {
            console.log("Chosen Image {}", image) ;
            this.chosenImage = image ;
            this.$bvModal.show('image-modal') ;
        },
        imageError(image) {
            console.log("In Image Loading Error method...." +image.scan_file) ;            
            //image.scan_file = "not-downloaded.png" ;
        },        
        getImagePath(image, imageSize) {
            console.log("looking for file {}", image) ;
            return '/fhir-app/trueimage/api/v1/image?image=' + image.scan_file + '&imageSize=' + imageSize + '&aid=7' ;
        },
        getBorderColor(image) {
            console.log("Getting border color for image {}", image) ;
            if (image.user_result) {
                if (image.user_result == "good")
                    return "green" ;
                else if (image.user_result == "not sure")
                    return "yellow" ;
                else
                    return "red" ;
            } else {
                return "black" ;
            }
        }
    }

}
</script>
    

<style scoped>
    .email-image {
        width:100px;
        height:100px;
        border-style:solid;    
        border-width: 2px;
        padding: 2px;
        display: inline-block;
    }
    .email-full-image {
        width:600px;
        height:600px;
        border-style:solid;    
        border-width: 2px;
        padding: 2px;
        display: inline-block;
    }    
</style>