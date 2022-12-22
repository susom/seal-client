<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="oph-synopsis-app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    Ophthalmology Synopsis+ is an app developed by SEAL, designed to summarize key elements of a patient’s ophthalmologic history
                </p>
                <!--    
                <p>
                    The app uses a simplified methodology to calculate a risk score and the corresponding 5-year risk of progression to 
                    advanced age-related macular degeneration (AMD).
                </p>
                -->
            </b-col>
        </b-row>

        <b-row align-content="center" class="ml-2 mr-2 rounded-lg">
            <b-col cols="11" class="text-center h5 pb-2 pt-2 bg-secondary rounded-lg">
                Synopsis Time Period between {{startDateFormatted}} and {{endDateFormatted}}      
                <b-button class="ml-4" size="sm" pill variant="primary" @click="$bvModal.show('launch-modal')">Modify Period</b-button>
            </b-col>
        </b-row>

        <b-row>
            <b-col cols="11" class="ml-2 pr-4">
                <b-tabs card content-class="ml-2 mr-2 mb-3" fill nav-wrapper-class="bg-white" 
                    active-nav-item-class="bg-primary">
                    <b-tab no-body title="Left Eye" @click="tabClicked('left')">
                        <b-card-text>
                            <b-card class="shadow-lg rounded-lg mt-1">
                                <b-card-text>
                                    <highchart :options="lChartOptions" ref="leftChart"/>
                                </b-card-text>
                            </b-card>
                            <b-card class="shadow-lg rounded-lg mt-2">
                                <b-card-title class="chart-title">Procedures</b-card-title>
                                <b-card-text>
                                    
                                    <highchart :options="leftSurgChartOptions" ref="leftSurgChart"/>

                                    <b-table :items="leftEyeSurgeries" :fields="eyeSurgeryFields" 
                                        small striped show-empty class="mt-3 ml-1">
                                        <template #empty>
                                            <h5 style="text-align:center;" class="mt-1 mb-1">
                                                No Eye Surgeries performed during the selected time period.
                                            </h5>
                                        </template>                                     
                                    </b-table>
                                </b-card-text>
                            </b-card>   
                            <b-card class="shadow-lg rounded-lg mt-2">
                                <b-card-title class="chart-title">Exam/Tests</b-card-title>
                                <b-card-text>
                                    
                                    <highchart :options="leftTestChartOptions" ref="leftTestChart"/>

                                    <b-table :items="leftEyeTests" :fields="eyeTestFields" 
                                        small striped show-empty class="mt-3 ml-1">
                                        <template #empty>
                                            <h5 style="text-align:center;" class="mt-1 mb-1">
                                                No Eye Exams performed during the selected time period.
                                            </h5>
                                        </template>                                     
                                    </b-table>
                                </b-card-text>
                            </b-card>                                                                                                             
                            <b-card  class="shadow-lg rounded-lg mt-2">
                                <b-card-title class="chart-title">
                                    <b-row>
                                        <b-col>Medications</b-col>
                                        <b-col style="text-align:right" class="mr-3">
                                            <span>Group By:</span> 
                                            <b-select :options="['None', 'Ingredient']" 
                                            v-model="leftMeds.groupBy" size="sm"
                                            @change="redrawMedChart('left')"                                         
                                            class="ml-2" style="width:50%"/>
                                        </b-col>
                                    </b-row>                                        
                                </b-card-title>
                                <b-card-text>                                
                                    <b-row>
                                        <b-col>
                                            <highchart :modules="['xrange']" :options="leftMeds.medChartOptions" ref="leftMedChart"/>
                                        </b-col>
                                    </b-row>
                                    <b-row class="mt-5">
                                        <b-col>
                                            <b-table striped 
                                                :items="leftMeds.list" :fields="medicationFields"
                                                small :busy="leftMeds.loading"                                                                
                                                hover 
                                                show-empty                                                               
                                                ref="leftMedicationsTable"                                                                
                                                :sticky-header="tableHeight()">
                                                <template #table-busy>
                                                    <div class="text-center text-primary my-2">
                                                        <b-spinner class="align-middle"></b-spinner>
                                                        <strong>Loading...</strong>
                                                    </div>
                                                </template>
                                                <template #empty>
                                                    <h5 style="text-align:center;" class="mt-1 mb-1">
                                                        No Eye Medications ordered during the selected time period.
                                                    </h5>
                                                </template>                                                                                     
                                                <template #cell(total_doses)="data">
                                                    {{data.item.data.length}}
                                                </template>                                        
                                            </b-table>
                                        </b-col>
                                    </b-row>
                                </b-card-text>
                            </b-card>                            
                        </b-card-text>
                    </b-tab>
                    <b-tab no-body title="Right Eye" @click="tabClicked('right')">
                        <b-card-text>
                            <b-card class="shadow-lg rounded-lg mt-1">
                                <b-card-text>
                                    <highchart :options="rChartOptions" ref="rightChart"/>
                                </b-card-text>
                            </b-card>
                            <b-card class="shadow-lg rounded-lg mt-2">
                                <b-card-title class="chart-title">Procedures</b-card-title>
                                <b-card-text>
                                    
                                    <highchart :options="rightSurgChartOptions" ref="rightSurgChart"/>

                                    <b-table :items="rightEyeSurgeries" :fields="eyeSurgeryFields" 
                                        small striped show-empty class="mt-3 ml-1">
                                        <template #empty>
                                            <h5 style="text-align:center;" class="mt-1 mb-1">
                                                No Eye Surgeries performed during the selected time period.
                                            </h5>
                                        </template>                                     
                                    </b-table>
                                </b-card-text>
                            </b-card>                            
                            <b-card class="shadow-lg rounded-lg mt-2">
                                <b-card-title class="chart-title">Exam/Tests</b-card-title>
                                <b-card-text>
                                    
                                    <highchart :options="rightTestChartOptions" ref="rightTestChart"/>

                                    <b-table :items="rightEyeTests" :fields="eyeTestFields" 
                                        small striped show-empty class="mt-3 ml-1">
                                        <template #empty>
                                            <h5 style="text-align:center" class="mt-1 mb-1">
                                                No Eye Exams performed during the selected time period.
                                            </h5>
                                        </template>                                     
                                    </b-table>
                                </b-card-text>
                            </b-card>                                                        
                            <b-card  class="shadow-lg rounded-lg mt-2">
                                <b-card-title class="chart-title">
                                    <b-row>
                                        <b-col>Medications</b-col>
                                        <b-col style="text-align:right" class="mr-3">
                                            <span>Group By:</span> 
                                            <b-select :options="['None', 'Ingredient']" 
                                            v-model="rightMeds.groupBy" size="sm"
                                            @change="redrawMedChart('right')"                                         
                                            class="ml-2" style="width:50%"/>
                                        </b-col>
                                    </b-row>                                        
                                </b-card-title>
                                <b-card-text>                                
                                    <b-row>
                                        <b-col>
                                            <highchart :modules="['xrange']" :options="rightMeds.medChartOptions" ref="rightMedChart"/>
                                        </b-col>
                                    </b-row>
                                    <b-row class="mt-5">
                                        <b-col>
                                            <b-table striped 
                                                :items="rightMeds.list" :fields="medicationFields"
                                                small :busy="rightMeds.loading"                                                                
                                                hover 
                                                show-empty                                                               
                                                ref="rightMedicationsTable"                                                                
                                                :sticky-header="tableHeight()">
                                                <template #table-busy>
                                                    <div class="text-center text-primary my-2">
                                                        <b-spinner class="align-middle"></b-spinner>
                                                        <strong>Loading...</strong>
                                                    </div>
                                                </template>
                                                <template #empty>
                                                    <h5 style="text-align:center;" class="mt-1 mb-1">
                                                        No Eye Medications ordered during the selected time period.
                                                    </h5>
                                                </template>                                                                                     
                                                <template #cell(total_doses)="data">
                                                    {{data.item.data.length}}
                                                </template>                                        
                                            </b-table>
                                        </b-col>
                                    </b-row>
                                </b-card-text>
                            </b-card>         
                        </b-card-text>
                    </b-tab>                    
                </b-tabs>
            </b-col>
        </b-row>

        <b-row class="mt-3 ml-2" v-if="$store.getters.sealTeam">
            <b-col cols="11">
                <b-link @click="showDebug = !showDebug" style="font-size:small">Logs Link</b-link>
                <b-card v-show="showDebug">                    
                    <b-card-title>Debug Info</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="logMesg" rows="10" auto-grow />
                    </b-card-text>
                </b-card>
            </b-col>                        
        </b-row>

        <b-modal id="launch-modal" button-size="sm" size="md" 
            centered hide-footer no-close-on-backdrop 
            title="Synopsis Time Period" title-class="mx-auto">
            <b-row>
                <b-col class="text-right" cols="4">
                    <label for="startDate">Start Date</label>
                </b-col>                
                <b-col>
                    <editable-date-picker v-model="launchModal.start_date" @error="(event) => {launchModal.errors.start_date = event}" :required="true" />
                </b-col>
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">
                    <label for="endDate">End Date</label>
                </b-col>
                <b-col>
                    <editable-date-picker v-model="launchModal.end_date" @error="(event) => {launchModal.errors.end_date = event}" :required="true"/>
                </b-col>
            </b-row>  
            <b-row>
                <b-col cols="12"  class="text-center">                                                                                            
                    <b-button pill variant="primary" class="ml-3 mt-3" @click="populateData" :disabled="!launchModal.errors.start_date || !launchModal.errors.end_date">Run Report</b-button>  
                </b-col>
            </b-row> 
            <b-row v-show="launchModal.loading">
                <b-col cols="12"  class="text-center">
                    <b-button variant="info" disabled size="sm" class="mt-3" style="width:100%">
                        <b-spinner small type="grow" class="mr-2"></b-spinner>
                        Generating report data...
                    </b-button>
                </b-col>
            </b-row> 
        </b-modal>    
        <b-modal id="synopsis-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
            body-bg-variant="dark">
            <ul class="text-white">
                <li>NOTE: The data will be saved into this score calculator only. The data will NOT be saved into the patient EHR.</li>                                                    
                <li>Items highlighted in blue in selected items to include in score calculator.</li>
                <li>Pre-selected selected items are suggestions based on data in the patient’s medical history.</li>
                <li>You may use the “Search” bar to search for relevant patient medical history. </li>
                <li>If other relevant patient medical history is not recorded here, please utilize  the SEAL history and consider adding it to the Problem List in Epic.</li>
                <li>You may also use the “plus icon” button to add new items to the app’s Medical History for the purposes of the risk score calculator. </li>                
                <li> 
                    How the Calculator and Past Medical History reads and writes data in the app:
                    <ol class="text-white">
                        <li>The calculator data is automatically synced with any info and changes made in “Past Medical History”. </li>
                        <li>You may modify the conditions “Past Medical History” by toggling the status of Active/Inactive.</li>
                        <li>You may add additional conditions in the tab “User Added Data in SEAL”.</li>
                        <li>You may override automatically synced data in the calculator by simply pressing any button. Changes in the calculator will not affect the Past Medical History.</li>
                        <li>Any new changes made in the “Past Medical History” will automatically update the calculator.</li>
                    </ol>
                </li>
            </ul>
        </b-modal>
    </b-container>
</template>

<script>

import EditableDatePicker from '~/components/EditableDatePicker.vue';
import Highcharts from 'highcharts' ;

    /**
     * Set the global timezone to PST
     */
    Highcharts.setOptions({
        time: {
            //timezone: 'America/Los_Angeles',
            timezoneOffset: new Date().getTimezoneOffset(),
            useUTC: false
        }
    });

export default {
    components: { EditableDatePicker },
    data () {
        return {
            patient: {},
            rChartOptions: {},
            lChartOptions: {},
            leftSurgChartOptions: {},
            rightSurgChartOptions: {},
            leftEyeSurgeries: [],
            rightEyeSurgeries: [],
            eyeSurgeryFields: [
                {label: 'Surgery', key: 'name', sortable: false},
                {label: 'Side', key: 'side', sortable: false},
                {label: 'Date', key: 'date', sortable: false},
            ],
            eyeTestFields: [
                {label: 'Test', key: 'name', sortable: false},
                {label: 'Side', key: 'side', sortable: false},
                {label: 'Date', key: 'date', sortable: false},
            ],            
            leftTestChartOptions: {},
            rightTestChartOptions: {},
            leftEyeTests: [],
            rightEyeTests: [],            
            launchModal : {              
                start_date: '',
                end_date: '',
                errors : {
                    start_date: null,
                    end_date: null
                },                                
                rpt_start_date: '',
                rpt_end_date: '',
                rpt_start_date_long: 0,
                rpt_end_date_long: 0,                
                loading: false
            },
            showDebug: false,
            logText: "", 
            encounters: [],           
            leftMeds : {
                data: [],                
                ingredients: [],
                list: [],
                medChartOptions: {},
                groupBy: "Ingredient",
                loading: false
            },
            rightMeds : {
                data: [],                
                ingredients: [],
                list: [],
                medChartOptions: {},
                groupBy: "Ingredient",
                loading: false
            },            
            medicationFields: [
                {label: 'Medication', key: 'name', sortable: false},
                {label: 'Tags', key: 'dosageRoutes', sortable: false},
                {label: 'Last MAR', key: 'last_used', sortable: false},
                {label: 'Total Doses', key: 'total_doses', sortable: false}
            ]
        }
    },
    async fetch() {

        this.$store.commit('setAppId', this.$services.synopsis.APP_ID) ;
        this.$services.synopsis.dblog("SynopsisHome", "In Ophthamology Synopsis+ Home Page") ;
        this.$store.commit('setPageTitle', "Ophthamology Synopsis+") ;  
        
        this.patient = await this.$services.seal.patient(this.$services.synopsis.APP_ID) ;

    },
    mounted() {

        this.launchModal.start_date = this.$moment().add(-1, 'year').format("MM/DD/YYYY") ;
        this.launchModal.end_date = this.$moment().format("MM/DD/YYYY") ;        
        this.$bvModal.show("launch-modal") ;

        this.leftSurgChartOptions = this.getSurgChart([]) ;
        this.rightSurgChartOptions = this.getSurgChart([]) ;

    },  
    computed : {
        startDateFormatted () {
            return this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;            
        },
        endDateFormatted() {
            return this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        }
    },
    methods : {
        log(mesg) {
            this.logMesg += "\n" + this.$moment().format("LTS") + ": " + mesg ;
        },
        tabClicked(tabName) {
            var _self = this ;
            this.$nextTick(() => {
                if (tabName == 'left') {
                    _self.$refs.leftChart.chart.reflow() ;
                    _self.$refs.leftMedChart.chart.reflow() ;                    
                    _self.$refs.leftSurgChart.chart.reflow() ;  
                    _self.$refs.leftTestChart.chart.reflow() ;
                } else {
                    _self.$refs.rightChart.chart.reflow() ;
                    _self.$refs.rightMedChart.chart.reflow() ;
                    _self.$refs.rightSurgChart.chart.reflow() ;
                    _self.$refs.rightTestChart.chart.reflow() ;
                }
            }) ; 
        },
        tableHeight() {
            return "400px" ;
            // return (window.innerHeight * 75/100) + "px" ;
        },
        async populateData() {
            
            var _self = this ; 

            try {
                this.launchModal.rpt_start_date = this.$moment(this.launchModal.start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
                this.launchModal.rpt_end_date = this.$moment(this.launchModal.end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;

                this.launchModal.rpt_start_date_long = this.$moment(this.launchModal.rpt_start_date + "T00:00:00").toDate().getTime() ; //"YYYY-MM-DDT00:00:01"
                this.launchModal.rpt_end_date_long = this.$moment(this.launchModal.rpt_end_date + "T00:00:00").add(1, 'days').toDate().getTime() ;            

                this.leftMeds.loading = true ;
                this.rightMeds.loading = true ;
                this.launchModal.loading = true ;

                var evisits = await this.$services.synopsis.eyevisits(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;
                this.log("Eye Visits") ;
                this.log(JSON.stringify(evisits)) ;
                            
                var rVAdata = [] ;
                var lVAdata = [] ;
                var rIOPdata = [] ;
                var lIOPdata = [] ;                               
                                
                var patient = await this.$services.seal.patient(this.$services.synopsis.APP_ID) ;
                var surgicalHistory = await this.$services.synopsis.surgicalhistory(patient.epicPatientId, this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;
                this.log("Surgical History Response") ;
                this.log(JSON.stringify(surgicalHistory)) ;
                
                this.leftEyeSurgeries = surgicalHistory
                            .filter(s => s.side.toLowerCase().indexOf("left") >= 0 || s.side.toLowerCase().indexOf("both") >= 0)
                            .map(surg => {
                                return {
                                    "name" : surg.surgery,
                                    "side" : surg.side,
                                    "date" : this.$moment(surg.dtstart).format("MM/DD/YYYY"),
                                    "timestamp": this.$moment(surg.dtstart).valueOf()
                                }
                            }) ;

                this.rightEyeSurgeries = surgicalHistory
                            .filter(s => s.side.toLowerCase().indexOf("right") >= 0 || s.side.toLowerCase().indexOf("both") >= 0)
                            .map(surg => {
                                return {
                                    "name" : surg.surgery,
                                    "side" : surg.side,
                                    "date" : this.$moment(surg.dtstart).format("MM/DD/YYYY"),
                                    "timestamp": this.$moment(surg.dtstart).valueOf()
                                }
                            }) ;

                this.leftSurgChartOptions = this.getSurgChart(this.leftEyeSurgeries) ;
                this.rightSurgChartOptions = this.getSurgChart(this.rightEyeSurgeries) ;

                this.log("Surgical History Map") ;
                this.log("Left: " + JSON.stringify(this.leftEyeSurgeries)) ;
                this.log("Right: " + JSON.stringify(this.rightEyeSurgeries)) ;

                var ophTests = await this.$services.synopsis.ophtests(patient.epicPatientId, this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;
                this.log("Oph Tests Response") ;
                this.log(JSON.stringify(ophTests)) ;
                
                this.leftEyeTests = ophTests
                            .filter(s => s.side.toLowerCase().indexOf("left") >= 0 || s.side.toLowerCase().indexOf("both") >= 0)
                            .map(surg => {
                                return {
                                    "name" : surg.proc_name,
                                    "side" : surg.side,
                                    "date" : this.$moment(surg.dtstart).format("MM/DD/YYYY"),
                                    "timestamp": this.$moment(surg.dtstart).valueOf()                       
                                }
                            }) ;

                this.rightEyeTests = ophTests
                            .filter(s => s.side.toLowerCase().indexOf("right") >= 0 || s.side.toLowerCase().indexOf("both") >= 0)
                            .map(surg => {
                                return {
                                    "name" : surg.proc_name,
                                    "side" : surg.side,
                                    "date" : this.$moment(surg.dtstart).format("MM/DD/YYYY"),
                                    "timestamp": this.$moment(surg.dtstart).valueOf()
                                }
                            }) ;

                this.leftTestChartOptions = this.getSurgChart(this.leftEyeTests) ;
                this.rightTestChartOptions = this.getSurgChart(this.rightEyeTests) ;

                this.log("Oph Tests Map") ;
                this.log("Left: " + JSON.stringify(this.leftEyeTests)) ;
                this.log("Right: " + JSON.stringify(this.rightEyeTests)) ;


                this.$services.synopsis.getresults(evisits).then(responses => {
                    _self.log("Got responses for smartdata results :" + responses.length) ;
                    responses.forEach(response => {
                        this.log("Response Data : " + JSON.stringify(response.data)) ;
                        if (response.data.RVA)
                            rVAdata.push({ x: response.data.dt , y: response.data.RVA, value: response.data.Rvalue } ) ;
                        if (response.data.LVA)                        
                            lVAdata.push({ x: response.data.dt , y: response.data.LVA, value: response.data.Lvalue } ) ;
                        if (response.data.RIOP)                        
                            rIOPdata.push({ x: response.data.dt , y: response.data.RIOP } ) ;                                                        
                        if (response.data.LIOP)                        
                            lIOPdata.push({ x: response.data.dt , y: response.data.LIOP } ) ;                            
                    }) ;
                    
                    _self.log(" Done loading data rdata:" + rVAdata.length + "  ldata:" + lVAdata.length) ;
                    
                    // Sorting the arrays by timestamp
                    rVAdata.sort((a, b) => a.x - b.x) ;
                    lVAdata.sort((a, b) => a.x - b.x) ;
                    rIOPdata.sort((a, b) => a.x - b.x) ;
                    lIOPdata.sort((a, b) => a.x - b.x) ;

                    _self.rChartOptions = this.getChart(rVAdata, rIOPdata) ;
                    _self.lChartOptions = this.getChart(lVAdata, lIOPdata) ;

                }).catch((error) => {
                    _self.log("Error in Getting SmartData Ajax Call :" + error) ;                    
                }) ;

                var responses = [] ;
                var meds = [] ;

                var response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", '', this.$services.synopsis.APP_ID ) ;
                responses.push(response) ;
                
                while (response.nextUrl) {
                    response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", response.nextUrl, this.$services.synopsis.APP_ID ) ;
                    responses.push(response) ;
                }

                responses.forEach((response) => {                    
                    response.cats.forEach((med) => {                                                                
                        _self.log("Processing MedStat : " + JSON.stringify(med)) ;
                        if (!med.pharma_class) med.pharma_class = "" ;
                        if (!med.routes) med.routes = "" ;
                        if (med.pharma_class.toLowerCase().indexOf('ophth') >= 0 || med.pharma_class.toLowerCase().indexOf('eye ') == 0 
                                || med.routes.toLowerCase().indexOf('ophth') >= 0) {
                            _self.log("Inside Oph Processing Med :" + med.name + " oids :" + med.med_order_ids + " dose routes: " + med.dosageRoutes) ;
                            try {
                            var medIdx = meds.findIndex(cat => cat.name == med.name) ;
                            if (medIdx === -1) {
                                meds.push(med) ;
                            } else {
                                meds[medIdx].data = [].concat(meds[medIdx].data, med.data) ;
                                meds[medIdx].mme = Object.assign({}, meds[medIdx].mme, med.mme) ;                        
                                meds[medIdx].routes = this.merge(meds[medIdx].routes, med.routes) ;
                                meds[medIdx].dosageRoutes = this.merge(meds[medIdx].dosageRoutes, med.dosageRoutes) ;
                                meds[medIdx].med_order_ids = [].concat(meds[medIdx].med_order_ids, med.med_order_ids) ;
                            }
                            } catch (err) {
                                _self.log("Error in merging medstat response for " + JSON.stringify(med)) ;
                                _self.log(err) ;
                            }
                        }
                    });              
                }) ;

                _self.log("Meds data: " + JSON.stringify(meds)) ;

                var encounters = await this.$services.seal.encounters(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, '', this.$services.synopsis.APP_ID) ;
                _self.log("Encounter data: " + JSON.stringify(encounters)) ;

                var wsjson = {} ;
                var csnids = [] ;

                encounters.forEach(enc => {
                    csnids.push(enc.pat_enc_csn_id) ;

                    wsjson[enc.pat_enc_csn_id] = {
                        "PatientID": _self.patient.epicPatientId,
                        "PatientIDType": "External", 
                        "ContactID": enc.pat_enc_csn_id,
                        "ContactIDType": "CSN",
                        "OrderIDs": []
                    } ;
                    
                });

                meds.forEach(cat => {
                    _self.log("MedStats Med Name:" + cat.name + " MedOrderIds: " + cat.med_order_ids + ": dosageRoute :" + cat.dosageRoutes) ;
                    cat.data.forEach(med => {
                        for (var i=0; i<encounters.length; i++) {
                            if ((med.x >= encounters[i].start && med.x <= encounters[i].end) || 
                                (med.x2 >= encounters[i].start && med.x2 <= encounters[i].end)) {
                                if (med.med_order_id) {   // for some reason row is created with empty ID
                                    wsjson[encounters[i].pat_enc_csn_id].OrderIDs.push({ "ID": med.med_order_id, "Type" : "External"}) ;
                                }
                            }
                        }
                    }) ;
                }) ;
            
                _self.log("Final ws call json: " + JSON.stringify(wsjson)) ;

                this.$services.seal.mardata(wsjson, this.$services.synopsis.APP_ID).then(responses => {
                    console.log("responses length " + responses.length) ;
                    _self.log("Got MAR data responses " + responses.length) ;

                    responses.forEach(response => {                    
                        response.data.Orders.forEach(order => {
                            try {
                            _self.log("Processing MAR Data for order " + order.Name) ;
                            var medIdx = meds.findIndex(function (med) { return (med.med_order_ids.indexOf(order.OrderID.ID) >= 0) }) ;
                            var med = {} ;
                            if (medIdx >= 0) {
                                med = meds[medIdx] ;
                                med.name = order.Name ;
                            } else {
                                _self.log("********* This should NOT happen - can't match order id for " + order.Name) ;
                                return ;
                            }
                            var last_used = "" ;
                            var last_used_long = 0 ;

                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                var ma = order.MedicationAdministrations[mIdx] ;
                                if (ma.Action != "Not Given") {
                                    var adminTime = new Date(ma.AdministrationInstant).getTime() ;
                                    if (adminTime >= _self.launchModal.rpt_start_date_long && adminTime <= _self.launchModal.rpt_end_date_long) {
                                        if (last_used_long < adminTime) {
                                            last_used = this.$moment(new Date(adminTime)).format("MM/DD/YYYY") ;
                                            last_used_long = adminTime ;
                                        }
                                        if (ma.Dose) {
                                            med.data.push({ x: adminTime, x2: adminTime, y: medIdx, color: "darkgreen",
                                                name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, action: ma.Action, pcat: "inpatient"  }) ;
                                        } else if (ma.Rate) {
                                            med.data.push({ x: adminTime, x2: adminTime, y: medIdx, color: "darkgreen",
                                                name: order.Name, dose: ma.Rate.Value, unit: ma.Rate.Unit, action: ma.Action, pcat: "inpatient"  }) ;                                            
                                        }
                                    }
                                }
                            }
                            med.last_used_long = last_used_long ;
                            med.last_used = last_used ;
                            med.total_rows = med.data.length ;
                            } catch (err) {
                                _self.log("Error in processing MAR data :" + err) ;
                            }
                        }) ;
                    }) ;

                    _self.log("Before filtering meds with no data :" + JSON.stringify(meds)) ;
                    
                    // meds only with data is used
                    meds = meds.filter(med => {return med.data.length > 0}) ;
                    
                    meds.forEach(med => med.dosageRoutes = ((med.dosageRoutes && med.dosageRoutes.length > 0)?med.dosageRoutes:"Both Eyes")) ;

                    _self.log("After filtering meds with no data :" + JSON.stringify(meds)) ;

                    this.leftMeds.data = meds.filter(med => (med.dosageRoutes.toLowerCase().indexOf("left") >= 0 || med.dosageRoutes.toLowerCase().indexOf("both") >= 0) ) ;
                    this.rightMeds.data = meds.filter(med => (med.dosageRoutes.toLowerCase().indexOf("right") >= 0 || med.dosageRoutes.toLowerCase().indexOf("both") >= 0) ) ;

                    this.encounters = encounters ;                

                    this.redrawMedChart("left") ;
                    this.redrawMedChart("right") ;

                    this.leftMeds.loading = false ;
                    this.rightMeds.loading = false ;
                    this.launchModal.loading = false ;

                    console.log("final result of generate report call") ;
                    
                    _self.$bvModal.hide("launch-modal") ;                    
                }) ;

            } catch (err) {
                _self.log("Error in populateData Method :" + err) ;
            }                
        },
        redrawMedChart(side) {
            console.log("Inside redrawMedChart method for side: " + side) ;            

            var medChartOptions = this.getMedsChart() ;

            var filteredMeds = [] ;
            var groupBy = (side == "left"?this.leftMeds.groupBy:this.rightMeds.groupBy) ;
            var meds = (side == "left"?this.leftMeds:this.rightMeds);

            if (groupBy == "None") {
                filteredMeds = meds.data.filter(med => true) ;
            } else if (groupBy == "Ingredient") {
                this.log("Inside group by Ingredients section") ;
                try {
                if (!meds.ingredients || meds.ingredients.length == 0 ) {
                    this.log("Got inside to loop thru each med for ingradients") ;
                    var ingredients = [] ;
                    meds.data.forEach(med => {
                        var ingIdx = ingredients.findIndex(function(ing) { return (ing.ingredient == med.ingredient) } ) ;
                        this.log("found ingredient " + med.ingredient + " in ingredients idx :" + ingIdx) ;
                        if (ingIdx > -1) {
                            ingredients[ingIdx] = this.$services.medreview.merge_meds(ingredients[ingIdx], med) ;
                        } else {
                            var ingObj = JSON.parse(JSON.stringify(med))  ;
                            ingObj.name = (med.ingredient?med.ingredient:med.name) ;
                            ingredients.push(ingObj) ;
                        }                
                    }) ;
                    this.log("Setting ingredients first time {}" + ingredients.map(ing => ing.name)) ;
                    this.$set(meds, 'ingredients', ingredients) ;
                }
                filteredMeds = meds.ingredients.filter(med => true) ;
                } catch (err) {
                    this.log("Error in group by ingredients :" + err) ;
                }
            }
            try {
            // alpha sort on names
            filteredMeds.sort(function (a, b) {
                if (a.name > b.name) {
                    return -1;
                }
                if (a.name < b.name) {
                    return 1;
                }                
            }) ;

            for (var i=0;i<filteredMeds.length;i++) {
                filteredMeds[i].data.forEach(point => {point.y = i}) ;
            }
            
            var cdata = filteredMeds.flatMap(med => med.data) ;
            cdata  = JSON.parse(JSON.stringify(cdata)) ;  // basic simple deep clone

            medChartOptions.yAxis[0].categories = filteredMeds.map(med => med.name) ;
            medChartOptions.series[0].data = cdata ;

            var chartHeight = medChartOptions.yAxis[0].categories.length * 30 ;
            if (chartHeight < 300)
                chartHeight = 300;

            medChartOptions.chart.height = chartHeight ;

            var plotBands = [] ;
            this.encounters.forEach(enc => {                
                plotBands.push({
                    color : "lightgrey" ,
                    borderwidth: 5 ,
                    borderColor: "lightgrey",
                    from : enc.start ,
                    to : enc.end,
                    zIndex : 1
                }) ;                
            }) ;

            medChartOptions.xAxis.plotBands = plotBands ;

            console.log(medChartOptions) ;
                        
            meds.medChartOptions = medChartOptions ;
            this.log("****** MedChartOptions*****") ;
            this.log(JSON.stringify(meds.medChartOptions)) ;

            if (groupBy == "None")
                meds.data.sort(function(a,b) { return a.name.localeCompare(b.name) }) ;
            else
                meds.ingredients.sort(function(a,b) { return a.name.localeCompare(b.name) }) ;            

            if (groupBy == "None") {
                meds.list = meds.data ;
            } else {
                meds.list = meds.ingredients ;
            }
            this.log("********Medication List***********") ;
            this.log(JSON.stringify(meds.list.map(med => med.name))) ;
            } catch (err) {
                this.log("Error in redrawchart 2 " + err) ;
            }

        },
        getMedsChart() {
            var chartOptions = this.$services.medreview.getDefaultChartConfig({
                start_time: this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").toDate().getTime(),
                end_time: this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").toDate().getTime(),
                min: 0,
                //max: 10,
                //name: 'Medications Chart',
                type: 'xrange',
                title: '',
                height: 400
            }) ;
            
            chartOptions.chart.marginLeft = 150 ;
            //chartOptions.yAxis[0].labels = { overflow: "allow" } ;

            return chartOptions ;
        },
        getSurgChart(surgeryData) {
                var _self = this ;

                var chartOptions = this.$services.medreview.getDefaultChartConfig({
                    name: "Procedures",
                    height: 50,
                    min: this.launchModal.rpt_start_date_long,
                    max: this.launchModal.rpt_end_date_long                    
                }) ;
                chartOptions.title = { text: "" } ;
                chartOptions.chart.marginTop = 20 ;
                chartOptions.chart.marginLeft = 80 ;
                chartOptions.xAxis.min = this.launchModal.rpt_start_date_long ;
                chartOptions.xAxis.max = this.launchModal.rpt_end_date_long ;
                chartOptions.yAxis[0] = {
                        "title": {
                            "text": "",
                            style: {
                                color: "red",
                                "font-size": "1.5em"
                            }                                                
                        }
                    } ;
                var surgeryChartData = surgeryData.map(surg => {
                    return { x: _self.$moment(surg.timestamp).startOf("day").valueOf(), y: 0, name: surg.name, timestamp: surg.timestamp }
                }) ;

                chartOptions.series[0] = {
                    name : "Surgeries",
                    yAxis: 0,
                    type: "scatter",
                    color: "red",
                    marker: {
                        symbol: "diamond",
                        radius: 8
                    },
                    data: surgeryChartData
                } ;                
                
                chartOptions.tooltip.formatter = function () {
                    var tip =  this.point.name ; 
                    // removed  %I:%M %p as the input is date only
                    tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y', this.point.timestamp) ;
                    return tip ;
                }

                this.log("In getChart Method") ;
                this.log(JSON.stringify(chartOptions)) ;
                return chartOptions ;
        },
        getChart(VAdata, IOPdata) {
            try {
                var chartOptions = this.$services.medreview.getDefaultChartConfig({
                    name: "Visual Acuity",
                    height: 400,
                    min: this.rpt_start_date_long,
                    max: this.rpt_end_date_long                    
                }) ;
                chartOptions.title = { text: "" } ;
                chartOptions.chart.marginTop = 20 ;
                chartOptions.chart.marginLeft = 80 ;
                chartOptions.xAxis.min = this.rpt_start_date_long ;
                chartOptions.xAxis.max = this.rpt_end_date_long ;
                chartOptions.yAxis[0] = {
                        "title": {
                            "text": "Visual Acuity",
                            style: {
                                color: "red",
                                "font-size": "1.5em"
                            }                                                
                        }
                    } ;
                chartOptions.yAxis[1] = {
                        "title": {
                            "text": "Intraocular Pressure",
                            style: {
                                color: "blue",
                                "font-size": "1.5em"
                            }                                                
                        },
                        opposite: true
                    } ;
                chartOptions.series[0] = {
                    name : "Visual Acuity",
                    yAxis: 0,
                    type: "line",
                    color: "red",
                    data: VAdata
                } ;                
                
                chartOptions.series[1] = {
                    name : "Intraocular Pressure",
                    type: "line",
                    yAxis: 1,
                    color: "blue",
                    data: IOPdata
                } ;

                chartOptions.tooltip.formatter = function () {
                    var tip =  this.point.series.name + ": " + (this.point.value?this.point.value:this.point.y) ;
                    tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;
                    return tip ;
                }

                this.log("In getChart Method") ;
                this.log(JSON.stringify(chartOptions)) ;
                return chartOptions ;
            } catch (err) {
                this.log("Error in getChart Method :" + err) ;
            }
        }
    }
}
</script>

<style scoped>
    .chart-title {
        color: rgb(54,38, 115) ;
        font-size: 1.1em ;
    }
</style>
