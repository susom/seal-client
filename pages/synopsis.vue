<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="oph-synopsis-app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    Opthamology Synopsis+ is app developed by SEAL. 
                <p>
                <p>
                    The app uses a simplified methodology to calculate a risk score and the corresponding 5-year risk of progression to 
                    advanced age-related macular degeneration (AMD).
                </p>
            </b-col>
        </b-row>

        <b-row class="ml-2">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg"  bg-variant="secondary">
                    <b-card-text>
                        <b-row>
                            <b-col cols="12" style="text-align:center">
                                <span class="h5">Synopsis Time Period</span>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col cols="3">
                                Start Date: {{startDateFormatted}}
                            </b-col>
                            <b-col cols="3">
                                End Date: {{endDateFormatted}}
                            </b-col>        
                            <b-col cols="3" style="text-align:right">
                                <b-btn variant="primary" pill @click="$bvModal.show('launch-modal')">Modify Report</b-btn>
                            </b-col>                    
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>        
        <b-row>
            <b-col cols="11" class="ml-2 pr-4">
                <b-tabs card content-class="ml-2 mr-2 mb-3" fill nav-wrapper-class="bg-white" 
                    active-nav-item-class="bg-primary">
                    <b-tab no-body title="Left Eye" @click="tabClicked('left')">
                        <b-card-text>
                            <b-card>
                                <b-card-text>
                                    <highchart :options="lChartOptions" />
                                </b-card-text>
                            </b-card>
                            <b-card title="Procedures">
                                <b-card-text>

                                </b-card-text>
                            </b-card>                            
                            <b-card title="Medications">
                                <b-card-text>

                                </b-card-text>
                            </b-card>                            
                        </b-card-text>
                    </b-tab>
                    <b-tab no-body title="Right Eye" @click="tabClicked('right')">
                        <b-card-text>
                            <b-card>
                                <b-card-text>
                                    <highchart :options="rChartOptions" />
                                </b-card-text>
                            </b-card>
                            <b-card title="Procedures">
                                <b-card-text>

                                </b-card-text>
                            </b-card>                            
                            <b-card title="Medications">
                                <b-card-text>

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
            title="Inpatient Time Period" title-class="mx-auto">
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

export default {
    components: { EditableDatePicker },
    data () {
        return {
            patient: {},
            rChartOptions: {},
            lChartOptions: {},
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
            logText: ""
        }
    },
    async fetch() {

        this.$store.commit('setAppId', this.$services.synopsis.APP_ID) ;
        this.$services.synopsis.dblog("SynopsisHome", "In Ophthamology Synopsis+ Home Page") ;
        this.$store.commit('setPageTitle', "Ophthamology Synopsis+") ;

        //this.patient = await this.$services.a3pain.patient() ;
    },
    mounted() {
        this.launchModal.start_date = this.$moment().add(-1, 'year').format("MM/DD/YYYY") ;
        this.launchModal.end_date = this.$moment().format("MM/DD/YYYY") ;
        this.$bvModal.show("launch-modal") ;
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
            Highcharts.charts.forEach(function(chart, idx) {  
                    if (chart) chart.reflow() ;
            }) ;
        },
        async populateData() {
            try {
                this.launchModal.rpt_start_date = this.$moment(this.launchModal.start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
                this.launchModal.rpt_end_date = this.$moment(this.launchModal.end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;

                this.launchModal.rpt_start_date_long = this.$moment(this.launchModal.rpt_start_date + "T00:00:00").toDate().getTime() ; //"YYYY-MM-DDT00:00:01"
                this.launchModal.rpt_end_date_long = this.$moment(this.launchModal.rpt_end_date + "T00:00:00").add(1, 'days').toDate().getTime() ;            

                var evisits = await this.$services.synopsis.eyevisits(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;
                this.log("Eye Visits") ;
                this.log(JSON.stringify(evisits)) ;
                            
                var rVAdata = [] ;
                var lVAdata = [] ;
                var rIOPdata = [] ;
                var lIOPdata = [] ;                
                var _self = this ; 

                this.$services.synopsis.getresults(evisits).then(responses => {
                    _self.log("Got responses for smartdata results :" + responses.length) ;
                    responses.forEach(response => {
                        this.log("Response Data : " + JSON.stringify(response.data)) ;
                        if (response.data.RVA)
                            rVAdata.push({ x: response.data.dt , y: response.data.RVA, value: response.data.value } ) ;
                        if (response.data.LVA)                        
                            lVAdata.push({ x: response.data.dt , y: response.data.LVA, value: response.data.value } ) ;
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

                    _self.$bvModal.hide("launch-modal") ;

                }).catch((error) => {
                    _self.log("Error in Getting SmartData Ajax Call :" + error) ;                    
                    _self.$bvModal.hide("launch-modal") ;
                }) ;

            } catch (err) {
                this.log("Error in populateData Method :" + err) ;
            }                
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
