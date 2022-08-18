<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="antimicrobial_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left ml-2">                
                <p class="pt-2">
                    Antimicrobial app developed by SEAL. 
                <p>
                <p>
                    The app uses real time data to get information about anti microbials, cultures and some data.
                </p>
            </b-col>
        </b-row>
        <b-row align-content="center">
            <b-col cols="10" class="text-center h5 pb-2">
                Antimicrobial summary between {{startDateFormatted}} and {{endDateFormatted}}  
                <b-button class="ml-4" size="sm" variant="primary" @click="$bvModal.show('launch-modal')">Modify Period</b-button>
            </b-col>            
        </b-row> 
        <b-row class="mt-4 ml-2">
            <b-col cols="11">
                <b-card>
                    <b-card-title>Summary Notes</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="notes" rows="10" readonly></b-textarea>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3 ml-2" v-if="$store.getters.sealTeam">
            <b-col cols="11">
                <b-link @click="showDebug = !showDebug" style="font-size:small">Logs Link</b-link>
                <b-card v-show="showDebug">                    
                    <b-card-title>Debug Info</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="resultText" rows="10" auto-grow />
                    </b-card-text>
                </b-card>
            </b-col>                        
        </b-row>
        
        <b-modal id="launch-modal" button-size="sm" 
            centered hide-footer no-close-on-backdrop 
            title="Report Criteria" title-class="mx-auto">
            <b-row>
                <b-col class="text-center">
                    <b-form-radio-group
                        v-model="launchModal.period_type"
                        :options="[{value: 'I', text: 'Current Inpatient Period', disabled: (inpatient_start_date == '')}, {value:'C', text: 'Custom Period'}]"                        
                    ></b-form-radio-group>                    
                </b-col>                
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">
                    <label for="startDate">Start Date</label>
                </b-col>                
                <b-col>
                    <b-form-input disabled="true" v-if="launchModal.period_type == 'I'" size="sm" :value="inpatient_start_date"/>
                    <editable-date-picker v-model="launchModal.start_date" @error="(event) => {launchModal.errors.start_date = event}" v-else/>
                </b-col>
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">                    
                    <label for="endDate">End Date</label>
                </b-col>
                <b-col>
                    <b-form-input disabled="true" v-if="launchModal.period_type == 'I'" size="sm" :value="inpatient_end_date"/>
                    <editable-date-picker v-model="launchModal.end_date" @error="(event) => {launchModal.errors.end_date = event}" v-else/>
                </b-col>                
            </b-row>  
            <b-row>
                <b-col cols="10" class="text-center">                    
                    <b-button pill variant="primary" class="ml-3 mt-3" @click="generateCharts" :disabled="!launchModal.errors.start_date || !launchModal.errors.end_date">
                        Fetch Patient Data
                    </b-button>  
                </b-col>
            </b-row> 
            <b-row v-show="launchModal.loading">
                <b-col cols="12"  class="text-center">
                    <b-button variant="info" disabled size="sm" class="mt-3" style="width:100%">
                        <b-spinner small type="grow" class="mr-2"></b-spinner>
                        {{loadingMessage}}
                    </b-button>
                </b-col>
            </b-row> 
        </b-modal>

        <b-modal id="antimicrobial-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
            body-bg-variant="dark">
            <ul class="text-white">
                <li>
                    
                </li>
            </ul>
        </b-modal>
    </b-container>
</template>

<script>
import Highcharts from 'highcharts' ;
import EditableDatePicker from '~/components/EditableDatePicker.vue';

export default {  
    components: { EditableDatePicker },
    data() {
        return {
            launchModal : {              
                start_date: '',
                end_date: '',
                rpt_start_date: '',
                rpt_end_date: '',
                loading: false,
                errors : {
                    start_date: null,
                    end_date: null
                },
                period_type : 'C'  // Custom
            },
            notes: "",
            showDebug: false,
            resultText: "",
            inpatient_start_date: "" ,
            inpatient_end_date : ""
        }
    },
    async fetch() {
        console.log("In fetch method of the anti microbial page") ;

        this.$store.commit('setAppId', this.$services.antimicrobial.APP_ID) ;
        this.$store.commit('setPageTitle', "Antimicrobial Dashboard") ;
        this.$store.commit('setCurrentApp', { help : "antimicrobial-help-modal" }) ;
        this.$services.standingorders.dblog("AntiMicrobialHome", "In AntiMicrobial Apps Home Page") ;
        
        var _self = this ;

        this.patient = await this.$services.seal.patient(this.$services.standingorders.APP_ID) ;
        var response = await this.$services.antimicrobial.inpatientdate() ;
        if (response.inpatient_start_date) {
            this.inpatient_start_date = response.inpatient_start_date ;
            this.launchModal.period_type = 'I' ;
        } else {
            this.launchModal.period_type = 'C' ;
        }

    },
    mounted() {
        console.log("In Mounted methood of antimicrobial page") ;
        this.launchModal.start_date = this.$moment().add(-7, 'days').format("MM/DD/YYYY") ;
        this.launchModal.end_date = this.$moment().format("MM/DD/YYYY") ;        
        console.log(this.launchModal) ;
        this.inpatient_end_date = this.$moment().format("MM/DD/YYYY") ;

        this.$bvModal.show("launch-modal") ;                
    },
    computed: { 
        startDateFormatted () {            
            return this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        endDateFormatted() {            
            return this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
    },
    methods: {    
        log(mesg) {
            this.resultText += "\n" + this.$moment().format("LTS") + ": " + mesg ;
        },

        async generateCharts() {

            console.log("Generating charts for ") ;
            console.log(this.launchModal) ;
            
            this.log("Generating charts") ;
            var _self = this ;

            this.launchModal.loading = true ;
                            
            if (this.launchModal.period_type == 'I') {
                this.launchModal.rpt_start_date = this.$moment(this.inpatient_start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
                this.launchModal.rpt_end_date = this.$moment(this.inpatient_end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
            } else {
                this.launchModal.rpt_start_date = this.$moment(this.launchModal.start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
                this.launchModal.rpt_end_date = this.$moment(this.launchModal.end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
            }

            var rpt_start_date_long = this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").toDate().getTime() ;
            var rpt_end_date_long = this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").toDate().getTime() ;

            this.$set(this.launchModal, 'rpt_start_date_long', rpt_start_date_long) ;
            this.$set(this.launchModal, 'rpt_end_date_long', rpt_end_date_long) ;

            var responses = [] ;
            var response = {} ;

            response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", '', this.$services.antimicrobial.APP_ID ) ;            
            responses.push(response) ;

            while (response.nextUrl) {
                response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", response.nextUrl, this.$services.medreview.APP_ID) ;
                responses.push(response) ;
            }

            console.log("med orders done") ;
            console.log(responses) ;
            this.log("Got med order responses") ;
            
            var medNames = [] ;
            var meds = [] ;  
            responses.forEach((response) => {                
                response.cats.forEach((med) => {
                    try {
                        //if (med.name.startsWith('aceta') || med.name.startsWith('cephalexin') || med.name.startsWith('nicotine'))
                        //    med.thera_class = 'antibiotics' ;
                        // Only antibiotics
                        if (med.thera_class.toLowerCase() == 'antibiotics') {
                            var medIdx = medNames.indexOf(med.name) ;
                            if (medIdx === -1) {
                                medNames.push(med.name) ;
                                meds.push(med) ;
                            } else {
                                meds[medIdx].data = [].concat(meds[medIdx].data, med.data) ;
                                meds[medIdx].routes = this.merge(meds[medIdx].routes, med.routes) ;
                                meds[medIdx].pcat = this.merge(meds[medIdx].pcat, med.pcat) ;
                                meds[medIdx].med_order_ids = [].concat(meds[medIdx].med_order_ids, med.med_order_ids) ;                                
                            }
                        }
                    } catch (err) {
                        _self.log("Error in merging medstat response for " + JSON.stringify(med)) ;
                        _self.log(err)   ;
                    }
                });              
            }) ;

            var ingredients = [] ;
            meds.forEach(med => {
                var ingIdx = ingredients.findIndex(function(ing) { return (ing.ingredient == med.ingredient) } ) ;
                _self.log("found ingredient " + med.ingredient + " in ingredients idx :" + ingIdx) ;
                if (ingIdx > -1) {
                    ingredients[ingIdx] = this.$services.medreview.merge_meds(ingredients[ingIdx], med) ;
                } else {
                    var ingObj = JSON.parse(JSON.stringify(med))  ;
                    ingObj.name = (med.ingredient?med.ingredient:med.name) ;                    
                    ingredients.push(ingObj) ;
                }                
            }) ;
    
            _self.notes = "Antimicrobial History:\n"
                        + "----------------------\n\n" ;

            // 06/05-06/08  
            // 06/07-06/20 
            // 07/02-present 

            ingredients.forEach(ing => {
                var dates = "" ;
                var enddt ;
                console.log("Processign ing :" + ing.name) ;

                ing.data.sort(function(a, b) { return a.x - b.x }) ;
                
                for (var i=0; i<ing.data.length; i++) {
                    var dt = ing.data[i] ;

                    dt.x = _self.$moment(dt.x).startOf("day") ;
                    dt.x2 = _self.$moment(dt.x2).startOf("day") ;
                    console.log("     start :" + dt.x.format("MM/DD/YYYY") + " end :" + dt.x2.format("MM/DD/YYYY")) ;
                    if (dates == "") {
                        dates += dt.x.format("MM/DD/YY") ;                        
                        enddt = dt.x2 ;
                        if (enddt.isAfter(_self.$moment())) {
                            dates += "-Present";
                            enddt = null ;
                            break ;                            
                        }
                    } else {
                        if (dt.x.diff(enddt, 'days') > 1) {
                            if (enddt.isAfter(_self.$moment())) {
                                dates += "-Present";
                                enddt = null ;
                                break ;
                            }
                            dates += "-" + enddt.format("MM/DD/YY") + ", ";
                            dates += dt.x.format("MM/DD/YY") ;
                            enddt = dt.x2 ;
                        } else {
                            enddt = (dt.x2.valueOf() > enddt.valueOf() ? dt.x2 : enddt) ;
                        }
                    }
                }
                if (enddt)
                    dates += "-" + enddt.format("MM/DD/YY") + " ";

/*
                dates = dates.trim() ;
                if (dates.endsWith(","))
                    dates = dates.slice(0, dates.length - 1) ;
                */
                ing.dates = dates ;
                _self.notes += ing.name + " " + ing.dates + "\n";
            }) ;

            console.log("Antibiotics Orders") ;
            console.log(ingredients) ;

            this.launchModal.loading = false ;
            this.$bvModal.hide("launch-modal") ;
        }

    }
}

/**
 * Set the global timezone to PST
 */
Highcharts.setOptions({
    time: {
        timezoneOffset: new Date().getTimezoneOffset(),
        useUTC: false
    }
});

</script>


