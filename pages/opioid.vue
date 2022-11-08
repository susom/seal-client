<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="opioid_mme_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p>
                    This app takes in data from Epic about opioid administration, auto-calculates the morphine milliequivalent (MME) over
                    a given time interval, and plots this data against the patient’s pain scores to visualize opioid use vs pain.                    
                    <br/><b style="color:red">Disclaimer: </b>Please exercise clinical judgment and discretion. If a drug that has been prescribed for the patient and is missing from
                    the data visualization, please inform the SEAL team by submitting feedback using the ellipsis icon (top right corner).
                </p>
            </b-col>
        </b-row> 
        <b-row align-content="center" class="ml-4 mr-2 rounded-lg">
            <b-col cols="11" class="text-center h5 pb-2 pt-2 bg-secondary rounded-lg">
                Inpatient Time Period between {{startDateFormatted}} and {{endDateFormatted}}  
                <b-button class="ml-4" size="sm" variant="primary" @click="$bvModal.show('launch-modal')">Modify Period</b-button>
                <b-button style="float:right;" class="mr-2" size="sm" variant="primary" @click="openMMEPopup" v-b-toggle.sidebar-right>MME Conversion Factors</b-button>
            </b-col>
        </b-row>

        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title class="chart-title">Figure 1. Opioid MME Aggregated at {{mmeDuration / 60}} Hours and Pain Scores </b-card-title>                    
                    <b-card-text>
                        <b-row class="mb-2">
                            <b-col class="text-left ml-4" cols="3">
                                <span class="font-weight-bold">Start time of interval:</span>   
                                <vue-timepicker v-model="start_time" format="hh:mm a" class="ml-2" 
                                    manual-input style="font-size:smaller" @change="refreshMMEChart"></vue-timepicker>
                            </b-col>
                            <b-col class="text-left ml-3" cols="3">
                                <span class="font-weight-bold">Sum MMEs over:</span> 
                                <b-select :options="[{value: 1440, text: '24 Hours'}, {value: 720, text: '12 Hours'}, {value: 480, text: '8 Hours'}, {value: 240, text: '4 Hours'}, {value: 60, text:'1 Hour'}]" 
                                    v-model="mmeDuration" 
                                    @change="refreshMMEChart"
                                    class="ml-2 text-small" style="width:40%"/>
                            </b-col>
                            <b-col class="text-left ml-3" cols="2">
                                <b-btn size="sm" variant="primary" @click="togglePainScores">{{painScoreText}}</b-btn>
                            </b-col>
                            <b-col class="text-left ml-3" cols="3">
                                <span class="font-weight-bold">Divide Opioids by:</span> 
                                <b-select :options="[{text: 'Opioid Type', value: 'opioids'}, {text: 'Route', value:'route'}]" 
                                    v-model="divideOpioidsBy"
                                    @change="refreshMMEChart"
                                class="ml-2 text-small" style="width:60%"/>
                            </b-col>                            
                        </b-row>                                                                    
                        <b-row>
                            <b-col>
                                <highchart 
                                    :options="mmeChartOptions" 
                                    @mousemove="mousemove"
                                    ref="mmeChart"
                                />
                            </b-col>
                        </b-row>   
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <!--
        <b-row class="mt-3 ml-2">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title class="chart-title">Figure 3. Opioid Distribution Aggregated at {{mmeDuration / 60}} Hours </b-card-title>                    
                    <b-card-text>
                        <highchart 
                            :options="mmeStackedChartOptions" 
                            @mousemove="mousemove"
                            ref="stackedChart"
                        />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        -->

        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title class="chart-title">
                        <b-row>
                            <b-col>
                                Figure 2. Administered Analgesics ({{analgesicCategory}}) during date {{startDateFormatted}} and {{endDateFormatted}}
                            </b-col>
                            <b-col style="text-align:right" class="mr-3">
                                <b-icon :icon="marChartOpen?'arrow-up-circle-fill':'arrow-down-circle-fill'" @click="toggleMarChart()" 
                                    variant="info" font-scale="1.5"/>
                            </b-col>                            
                        </b-row>                        
                    </b-card-title>
                    <b-card-text>
                        <b-row class="mb-2" v-show="marChartOpen">
                            <b-col class="text-right">
                                <span class="font-weight-bold">Analgesic Category:</span> 
                                <b-select :options="['All', 'Opioids Only', 'Non-Opioids Only']" 
                                    v-model="analgesicCategory" 
                                    @change="refreshMarChart"
                                    class="ml-2" style="width:60%"/>
                            </b-col>
                            <b-col class="text-left ml-3">
                                <span class="font-weight-bold">Route of Administration:</span> 
                                <b-select :options="['All', 'Oral', 'Non-Oral']" 
                                v-model="routeOfAdmin"  
                                @change="refreshMarChart"
                                class="ml-2" style="width:60%"/>
                            </b-col>
                        </b-row>
                        <b-row v-show="marChartOpen">
                            <b-col cols="12">
                                <highchart 
                                    :options="medChartOptions"                                     
                                    @mousemove="mousemove"                                                                        
                                    ref="medChart"                                    
                                    />
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="mt-3 ml-2 mb-5"  v-if="$store.getters.sealTeam">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg"  v-if="!road.opioidNaivePatient">
                    <b-card-title class="chart-title">ROAD - Rational Opioids At Discharge</b-card-title>                    
                    <b-card-text>
                        <b-row class="mt-5 mb-3">
                            <b-col cols="11" class="text-center h4">
                                This patient is not an opioid naive patient. This app is designed for use in opioid naive patients.                                
                            </b-col>                            
                        </b-row>
                    </b-card-text>                                        
                </b-card>
                <b-card class="shadow-lg rounded-lg"  v-if="!road.hasSurgicalEncounter">
                    <b-card-title class="chart-title">ROAD - Rational Opioids At Discharge</b-card-title>                    
                    <b-card-text>
                        <b-row class="mt-5 mb-3">
                            <b-col cols="11" class="text-center h4">
                                This patient is not recovering from surgery. This app is not designed for use in cases of acute non-surgical pain.
                            </b-col>                            
                        </b-row>
                    </b-card-text>                                        
                </b-card>                
                <b-card class="shadow-lg rounded-lg"  v-if="road.opioidNaivePatient && road.hasSurgicalEncounter">
                    <b-card-title class="chart-title">ROAD - Rational Opioids At Discharge</b-card-title>                    
                    <b-card-text>
                        <b-row>
                            <b-col cols="10" style="font-size:1.1em;font-weight:bold;" class="mt-1">
                                Oxycodone discharge schedule based on {{road.totalMME}} MME opioid usage in past 24 hours.
                            </b-col>    
                            <b-col cols="2" v-if="$store.getters.sealTeam">                                 
                                <b-form-input type="text" v-model="road.totalMME" size="sm" style="width:25%;display:inline"/><b-button @click="testRoadChart" size="sm" class="ml-2">Redraw</b-button>
                            </b-col>                            
                        </b-row>
                        <b-row v-if="road.totalMME > 90" class="mt-2">
                            <b-col cols="11">
                                <b style="color:red">Disclaimer: </b>This patient's opioid usage in the past 24 hours exceeded 90 mg of MME. 
                                Please re-evaluate the patient's pain management plan. If proceeding with discharge planning at ≥90 MME/day total, we recommend 
                                specialist referral, careful justification of the opioid prescription, and naloxone co-prescription.
                            </b-col>
                        </b-row>
                        <b-row class="mt-2">
                            <b-col>
                                <highchart 
                                    :options="road.chart.chartOptions"                                     
                                />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col offset="1" class="mb-2" cols="11">
                                Please maximize non-pharmacological and non-opioid analgesic options in addition to this opioid prescription recommendation.
                            </b-col>
                        </b-row>
                        <b-row class="mb-2">
                            <b-col cols="6" offset="1">
                                Distribution Start Date: 
                                <editable-date-picker v-model="road.distributionStartDate" style="width:30%;display:inline-block" class="ml-2" @change="testRoadChart()"/>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col cols="6" offset="1">
                                <b-table striped hover small
                                    :items="road.chart.dosageTable" :fields="road.dosageTableFields" 
                                    :total-rows="road.chart.dosageTable.length"
                                    per-page="10" :current-page="road.currentPage">
                                </b-table>
                                <b-pagination                                 
                                    :total-rows="road.chart.dosageTable.length" 
                                    per-page="10" 
                                    align="right"
                                    hide-ellipsis
                                    v-model="road.currentPage"  />
                                <h5 v-if="road.totalMME < 90">
                                    Total oxycodone 5mg tablets: {{totalNumberOfTablets}}
                                </h5>    
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="mt-3 ml-2" v-if="$store.getters.sealTeam">
            <b-col cols="11">
                <b-link @click="showDebug = !showDebug" style="font-size:small">SEAL Logs Link</b-link>
                <b-card v-show="showDebug">                    
                    <b-card-title>Debug Info</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="resultText" rows="10" auto-grow id="logText" />
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

        <!--<b-modal id="common-opioids-modal" size="lg" centered scrollable hide-footer title="Common Opioid MME Conversion Factors">-->
        <b-sidebar id="sidebar-right" right shadow width="25%" title="Common MME Conversion Factors" header-class="bg-primary">
            <template #footer="{ hide }">                
                <div class="text-right mr-3 mt-2 mb-2">
                    <b-button variant="primary" size="sm" @click="hide">Close</b-button>                
                </div>
            </template>            
            <b-container class="ml-1 mr-1">
                <b-row style="font-size:smaller">
                    <b-col>
                        <b-table :items="commonOpioids" :fields="opioidFields" small class="mb-0">
                            <template #cell(routes)="data">
                                <b-table :items="data.item.mmes" :fields="[{label: '', key: 'route'}]" thead-class="d-none" small class="mb-0">
                                </b-table>
                            </template>
                            <template #cell(factors)="data">
                                <b-table :items="data.item.mmes" :fields="[{label: '', key: 'mme'}]" thead-class="d-none" small class="mb-0">
                                </b-table>
                            </template>                        
                        </b-table>
                        <span style="font-style:italic;font-size:small">*The unit metric for Fentanyl is micrograms (mcg) as opposed to milligrams (mg).</span>
                    </b-col>
                </b-row>
                <b-row style="font-size:smaller" class="mt-3 mb-3">
                    <b-col>
                        References:
                        <ol>
                            <li><a href="https://www.cdc.gov/opioids/providers/prescribing/guideline.html">https://www.cdc.gov/opioids/providers/prescribing/guideline.html</a></li>
                            <li><a href="https://medicaid.utah.gov/Documents/files/Opioid-Morphine-EQ-Conversion-Factors.pdf">https://medicaid.utah.gov/Documents/files/Opioid-Morphine-EQ-Conversion-Factors.pdf</a></li>
                            <li><a href="https://www.unmc.edu/NebraskaGWEP/wp-content/uploads/2020/01/052718_COM-IntMEd_Opioid-Pocket-Card_4x6.pdf">https://www.unmc.edu/NebraskaGWEP/wp-content/uploads/2020/01/052718_COM-IntMEd_Opioid-Pocket-Card_4x6.pdf</a></li>
                        </ol>
                    </b-col>
                </b-row>                
            </b-container>
        </b-sidebar>
        <!--</b-modal>-->

        <b-modal id="a3pain-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
            body-bg-variant="dark">
            <ul class="text-white"> 
                <li><b>Inpatient Time Period:</b> Users are highly recommended to select a minimum of 3 days to prevent confusion for visualization of aggregate data.
                <li>
                    <b>Figure 1:</b> Users can view the administered analgesics based on MAR data for pain medication. Users may sort Administered Analgesics 
                    by Analgesic Category or Route of Administration. The most common pain medications are included. Please read the disclaimer for exclusions.
                </li>
                <li>
                    <b>Figure 2:</b> Users can view the auto-converted Opioid MME total overlayed with the patient’s pain score. Users may customize time intervals for 
                    Opioid MME graphs by selecting 24-hour, 12-hour, 8-hour, 4-hour or 1-hour intervals. By selecting a specific interval, this will dictate the X-axis 
                    for Figure 2 and Figure 3. Users may hover an MME data point in Figure 2 to view the MME opioid numerical distribution or refer to Figure 3 
                    for an MME opioid visual distribution.
                </li>
                <li><b>Figure 3:</b> Users can view  the MME  opioid  visual distribution.</li>
                <li>
                    <b>Zoom Function:</b> Users may zoom in for each data visualization figure by selecting a start point, left-click your mouse, drag over the 
                    desired zoom area, and release - which will result in a zoomed in view of that area. To reset, select the button labelled “Reset zoom” which appears 
                    only w hen you are zoomed in.
                </li>
                <li>
                    <b>Disclaimer:</b> Please exercise clinical judgment and discretion. There are certain pain medicines including patient-controlled analgesics (PCAs), 
                    patient-controlled epidural analgesics (PCEAs), and relatively rarely used pain medications that the SEAL team is working to include in 
                    future versions of the application. Morphine  milliequivalent  (MME)  conversion factors were provided from Epic, with some 
                    additional information derived from expert consultation from the Stanford Department of Anesthesiology.
                </li>
            </ul>
        </b-modal>
    </b-container>
</template>

<script>

/* eslint-disable */

import Highcharts from 'highcharts' ;
import offlineExporting from 'highcharts/modules/offline-exporting'
import EditableDatePicker from '~/components/EditableDatePicker.vue';
import VueTimepicker from 'vue2-timepicker'

import 'vue2-timepicker/dist/VueTimepicker.css';

offlineExporting(Highcharts) ;

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

    /**
     * Override the reset function, we don't need to hide the tooltips and
     * crosshairs.
     */

    Highcharts.Pointer.prototype.reset = function () {
        for (var i = 0; i < Highcharts.charts.length; i++) {
            var chart = Highcharts.charts[i];
            if (chart && chart.tooltip)
                chart.tooltip.hide() ;
        }                
        return undefined;
    };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype.highlight = function (event) {
        event = this.series.chart.pointer.normalize(event);
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    /**
     * Synchronize zooming through the setExtremes event handler.
     */
    function syncExtremes(e) {
        var thisChart = this.chart;

        if (e.trigger !== 'syncExtremes') { // Prevent feedback loop            
            Highcharts.charts.forEach(function(chart, idx) {
            //$.each(Highcharts.charts, function(idx, chart) {
                if (chart !== thisChart && chart.index != 3) {
                    try {
                        if (chart.xAxis[0].setExtremes) { // It is null while updating
                            setTimeout(function() {
                                chart.xAxis[0].setExtremes(
                                    e.min,
                                    e.max,
                                    true, //undefined,
                                    false,
                                    {trigger: 'syncExtremes'}
                                );
                            }, 0) ;
                        }
                    }catch (e) {
                        console.log("Error in synxExtrement for " + chart) ;
                        console.log(e) ;
                    }
                }
            });
        }
    }

    //https://identity.stanford.edu/design-elements/color/accent-colors/
    const sealColors = [ 
            "#820000" , // dark red
            "#00548f",  // Dark digital blue
            "#006F54", // Dark Green
            "#014240", // Palo Alto
            "#7A863B", // Olive
            "#016895", // Dark Sky
            "#006B81", // Dark Lagunita
            "#D1660F", // Dark Poppy
            "#C74632", // Dark Sprint
            "#FEC51D", // Dark Illumunicate
            "#350D36", // Dark Plum
            "#42081B", // Dark Brick
            "#544948", // Dark Stone
            "#B6B1A9", // Dark Fog
    ] ;

export default {
    components: { EditableDatePicker, VueTimepicker },  /* ,Calender */
    data () {
        return {
            resultText: "",
            medChartOptions: {},
            mmeChartOptions: {},
            mmeStackedChartOptions: {},
            medCategories: [],
            marData: [],
            painData: [],
            patient: {},
            medColors: {},
            mmeDuration: 1440,
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
            start_time: '12:00 am',
            divideOpioidsBy: 'opioids',
            analgesicCategory: 'All',
            routeOfAdmin: 'All',
            showDebug: false,
            commonOpioids: [
                { name: 'Fentanyl', mmes: [{route: 'Injection (mcg*)', mme: 0.3}, { route: 'Sublingual (mcg*)', mme: 0.16 }, { route: 'Transdermal (mcg*)', mme: 100 }], _rowVariant: 'secondary'},
                { name: 'Codeine', mmes: [{route: 'Oral (mg)', mme: 0.15}, { route: 'Injection (mg)', mme: 0.15 }]},
                { name: 'Hydrocodone', mmes: [{route: 'Oral (mg)', mme: 1}], _rowVariant: 'secondary'},  
                { name: 'Hydromorphone', mmes: [{route: 'Oral (mg)', mme: 4}, {route: 'Rectal (mg)', mme: 4}, 
                                    {route: 'Injection (mg)', mme: 20 }, {route: 'Epidural (mg)', mme: 100}, {route: 'Intrathecal (mg)', mme: 500 }]},
                { name: 'Meperidine', mmes: [{route: 'Oral (mg)', mme: 0.1}, { route: 'Injection (mg)', mme: 0.3 }], _rowVariant: 'secondary'},
                { name: 'Morphine', mmes: [{route: 'Oral (mg)', mme: 1}, { route: 'Intramuscular (mg)', mme: 3 }, { route: 'Injection (mg)', mme: 3 }]},
                { name: 'Oxycodone', mmes: [{route: 'Oral (mg)', mme: 1.5}], _rowVariant: 'secondary'}, 
                { name: 'Oxycodone Myristate', mmes: [{route: 'Oral (mg)', mme: 1.66}]}, 
                { name: 'Tramadol', mmes: [{route: 'Oral (mg)', mme: 0.1}], _rowVariant: 'secondary'}
            ],
            opioidFields: [
                {label: 'OPIOID', key: 'name'},
                {label: 'Route of Administration', key: 'routes'},
                {label: 'Conversion Factor', key: 'factors'}
            ],
            road : {
                discharge_date: "",
                discharge_time: "",
                distributionStartDate: "",
                totalMME: 0,
                currentPage: null,
                chart: { weeks: [], days: [], dosage: [], events: [], dosageTable: [] },
                dosageTableFields: [
                    {label: 'Day', key: 'day'} ,
                    {label: 'Date', key: 'date'} ,
                    {label: 'Dosage', key: 'dosage'} ,
                    {label: 'Total Opioid', key: 'total'},
                    {label: 'Total 5mg tablets', key: 'total_tablets', class: 'text-center'}
                ],
                chartOptions: {},
                opioidNaivePatient: true, // display the road by default
                hasSurgicalEncounter: true // has inpatient surgical record
            },
            statusMesg: "Init",
            painScoreText: "Hide Pain Score",
            marChartOpen: false
        }
    },
    computed : {
        startDateFormatted () {
            return this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;            
        },
        endDateFormatted() {
            return this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        totalNumberOfTablets() {
            var totalTablets =  0 ;
            this.road.chart.dosageTable.forEach(dose => totalTablets += dose.total_tablets) ;
            return totalTablets ;
        },
        roadEnabled() {
            return this.road.hasSurgicalEncounter && this.road.opioidNaivePatient ;
        }
    },
    async fetch() {
        this.log("In Fetch method of a3 pain tab page") ;        

        var response = await this.$services.seal.inpatientdate(this.$services.a3pain.APP_ID) ;                          
        this.log("Inpatient date :" + JSON.stringify(response)) ;
        if (response.inpatient_start_date) {
            this.road.hasSurgicalEncounter = await this.surgicalEncounter(response.inpatient_start_date) ;
            this.resultText += "\nHas Surgical Encounter :" + this.road.hasSurgicalEncounter ;            
            if (!this.road.hasSurgicalEncounter) return ;
            this.road.opioidNaivePatient = await this.opioidNaive(response.inpatient_start_date) ;
            this.resultText += "\nIs Opioid Naive Patient :" + this.road.opioidNaivePatient ;            
        }        
    },
    mounted () {
        this.log("In mounted method of the a3 pain tab page") ;    
        
        this.$store.commit('setAppId', this.$services.a3pain.APP_ID) ;
        this.$store.commit('setPageTitle', "Opioid MME and Pain Score Visualization") ;
        this.$store.commit('setCurrentApp', { help : "a3pain-help-modal" }) ;
        this.$services.a3pain.dblog("A3PainHome", "In A3 Pain Tab Home Page") ;

        this.launchModal.start_date = this.$moment().add(-3, 'days').format("MM/DD/YYYY") ;
        this.launchModal.end_date = this.$moment().format("MM/DD/YYYY") ;
        
        this.$bvModal.show("launch-modal") ;

        this.medChartOptions = {} ; //this.getMedsChart() ;
        this.mmeChartOptions = {} ; //this.getMMEChart() ;
        this.mmeStackedChartOptions = {} ; //this.getMMEStackedChart() ;
                
        this.road.discharge_date = this.$moment().format("YYYY-MM-DD") ;
        this.road.discharge_time = this.$moment().format("HH:mm") ;

        this.road.distributionStartDate = this.$moment().add(1, 'days').format("MM/DD/YYYY") ; 
        
        //this.$services.a3pain.processEpiduralInfusions(order) ;

    },
    watch: {
        'road.distributionStartDate': function (newVal, oldVal) { 
            if (oldVal == "") return ;
            this.testRoadChart() ;
        }
    },
    methods : {
        openMMEPopup() {
            this.$services.a3pain.dblog("A3PainOpenMMEPopup", "Clicked to open up MME Conversion factor popup") ;
        },
        toggleMarChart() {
            var _self = this ;
            this.marChartOpen = !this.marChartOpen ;
            if (this.marChartOpen) {
                this.$nextTick(() => {
                    _self.$refs.medChart.chart.reflow() ;
                }) ;                
                this.$services.a3pain.dblog("A3PainOpenMARChart", "Clicked to open MAR Chart") ;
            }
        },
        togglePainScores() {
            var idx = this.$refs.mmeChart.chart.series.findIndex(series => series.name == "Pain Score") ;            
            if (idx >= 0) {
                if (this.painScoreText == "Hide Pain Score") {
                    this.painScoreText = "Show Pain Score" ;                
                    this.$refs.mmeChart.chart.series[idx].hide() ;
                } else {
                    this.painScoreText = "Hide Pain Score"
                    this.$refs.mmeChart.chart.series[idx].show() ;
                }                                
            }
        },
        async surgicalEncounter(inpatientStartDate) {
            this.resultText += "\nIn Surgical Encountner Method...." ;

            var stdt = this.$moment(inpatientStartDate, "MM/DD/YYYY").format("YYYY-MM-DD") ;
            var enddt = this.$moment().format("YYYY-MM-DD") ;
            
            this.resultText += "\nFinding Surgical Encounters after " + stdt ;
            var encounters = await this.$services.seal.surgical_encounters(stdt, enddt, '', this.$services.a3pain.APP_ID) ;
            this.resultText += "\n Surgical Encounters :" + JSON.stringify(encounters) ;

            if (encounters.length > 0)
                return true ;
            else
                return false ;

        },
        
        async opioidNaive(inpatientStartDate) {
            this.resultText += "\nIn OpioidNative Method...." ;
            
            var responses = [] ;

            var enddt = this.$moment(inpatientStartDate, "MM/DD/YYYY").add(-1, "months") ;
            var stdt = enddt.clone().add(-2, "months") ;
            
            this.resultText += "\nOpioid Naive: Getting med data for st dt " + stdt.format("YYYY-MM-DD") + " end dt " + enddt.format("YYYY-MM-DD") ;
            var response = await this.$services.seal.medicationData(stdt.format("YYYY-MM-DD"), enddt.format("YYYY-MM-DD"), "ALL", '', this.$services.a3pain.APP_ID ) ;
            //response = await this.$services.a3pain.medstats(stdt.format("YYYY-MM-DD"), enddt.format("YYYY-MM-DD")) ;                
            responses.push(response) ;

            this.resultText += "\n MedStat3 Call1 nexturl :" + (response.nextUrl?response.nextUrl:"Doesn't exist") ;

            while (response.nextUrl) {
                response = await this.$services.seal.medicationData(stdt.format("YYYY-MM-DD"), enddt.format("YYYY-MM-DD"), "ALL", response.nextUrl, this.$services.a3pain.APP_ID ) ;
                for (var cIdx = 0; cIdx < response.cats.length ; cIdx++) {
                    var med = response.cats[cIdx] ;
                    if (!med.pharma_class) med.pharma_class = "" ;
                    var isOpioid = (med.pharma_class.toLowerCase().indexOf("opioid") >= 0) ;
                    this.resultText += "\nMedStat3 Processing Med :" + med.name + ": Pharma :" + med.pharma_class + ": Opioid: " + isOpioid ;
                    if (isOpioid) {
                        this.resultText += "\n Returing false for opioidNaive patient check" ;
                        return false ;
                    }                        
                }                                        
            }
            
            this.resultText += "\n Returing true for opioidNaive patient check" ;
            return true  ;
        }, 
        async populateData() {
            try {
            var _self = this ;

            this.resultText = "" ;  // reset the log

            this.launchModal.loading = true ;
            
            console.log("In populate data launchModal : {}", this.launchModal) ;

            this.launchModal.rpt_start_date = this.$moment(this.launchModal.start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
            this.launchModal.rpt_end_date = this.$moment(this.launchModal.end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;

            this.launchModal.rpt_start_date_long = this.$moment(this.launchModal.rpt_start_date + "T00:00:00").toDate().getTime() ; //"YYYY-MM-DDT00:00:01"
            this.launchModal.rpt_end_date_long = this.$moment(this.launchModal.rpt_end_date + "T00:00:00").add(1, 'days').toDate().getTime() ;

            var rpt_start_date_long = this.launchModal.rpt_start_date_long ;
            var rpt_end_date_long = this.launchModal.rpt_end_date_long ;
            console.log("in populatedata report end date long :" + rpt_end_date_long) ;

            this.patient = await this.$services.a3pain.patient() ;      

            var encounters = await this.$services.seal.encounters(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, '', this.$services.a3pain.APP_ID) ;

            var responses = [] ;
            var response = {} ;
            var medstats = {} ;

            response = await this.$services.a3pain.medstats(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;
            responses.push(response) ;

            this.resultText += "\n MedStat Call1 nexturl :" + (response.nextUrl?response.nextUrl:"Doesn't exist") ;

            while (response.nextUrl) {
                response = await this.$services.a3pain.medstats(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, response.nextUrl) ;
                this.resultText += "\n MedStat Call nexturl :" + (response.nextUrl?response.nextUrl:"Doesn't exist") ;
                responses.push(response) ;
            }
            
            medstats.cats = [] ;

            try {
            responses.forEach((response) => {

                response.cats.forEach((med) => {                                        
                    this.resultText += "\n MedStat Processing Med :" + med.name + " oids :" + med.med_order_ids + " routes: " + med.routes ;

                    try {
                    var medIdx = medstats.cats.findIndex(cat => cat.name == med.name) ;
                    if (medIdx === -1) {
                        medstats.cats.push(med) ;
                    } else {
                        medstats.cats[medIdx].data = [].concat(medstats.cats[medIdx].data, med.data) ;
                        medstats.cats[medIdx].mme = Object.assign({}, medstats.cats[medIdx].mme, med.mme) ;                        
                        medstats.cats[medIdx].routes = this.merge(medstats.cats[medIdx].routes, med.routes) ;
                        medstats.cats[medIdx].med_order_ids = [].concat(medstats.cats[medIdx].med_order_ids, med.med_order_ids) ;
                    }
                    } catch (err) {
                        this.resultText += "Error in merging medstat response for " + JSON.stringify(med) + "\n" ;
                        this.resultText += err + "\n" ;
                    }
                });              
            }) ;
            } catch (err) {
                this.resultText += "Error in merging medstat responses " + err + "\n" ;
            }

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

            medstats.cats.forEach(cat => {
                this.resultText += "\n MedStats Med Name:" + cat.name + " MedOrderIds: " + cat.med_order_ids + ": MME Info: " + JSON.stringify(cat.mme) ;
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
        
            console.log("Final ws call json : {}", wsjson) ;

            } catch (err) {
                console.log("no idea what this error is...{} " , err) ;
                this.resultText += "\n" + "Error in JS Call 1 :" + err ;
            }
            try {

                //MAR data for Patient Controlled Analgesics
                this.log("---- PCA MAR Data Request --------------") ;
                var pca_mars = await this.$services.a3pain.pca_mars(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;
                this.log(JSON.stringify(pca_mars)) ;

                this.log("---- MAR Data Webservice Request--------------") ;
                this.resultText += JSON.stringify(wsjson) ;

                this.$services.a3pain.mardata(wsjson).then(responses => {

                    console.log("responses length " + responses.length) ;
                    
                    this.log("----MARDATA webservice response START " + responses.length) ;
                    
                    //this.resultText += "\n---- MAR data Response JSON -------------------" ;
                    //this.resultText += JSON.stringify(responses) ;
                    
                    var categories = [] ;
                    var cdata = [] ;
                    var catIdx = -1 ;         
                    
                    responses.forEach(response => {
                        response.data.Orders.forEach(order => {                                                        
                            this.resultText += "\n----------------------------------Processing Order :" + order.Name + ": ID: " + order.OrderID.ID ;
                            //this.resultText += "\n" + JSON.stringify(order) ;
                            try {
                            
                            var cIdx = medstats.cats.findIndex(function (cat) { return (cat.med_order_ids.indexOf(order.OrderID.ID) >= 0) }) ;
                            if (cIdx < 0) {
                                this.resultText += "\nThis should NOT happen.. can't find MAR Order id (" + order.OrderID.ID + ") name " + order.Name + " in cat medorderids" ; 
                                return true ;
                            }                  
                            var mmeJSON = {} ;          
                            var mmeFactor = 0 ;
                            var isOpioid = false ;
                            var isOral = false ;
                            var genericName = "" ;

                            this.resultText += ": med order name :" + medstats.cats[cIdx].name + ": MME: " ;
                            this.resultText += JSON.stringify(medstats.cats[cIdx].mme) + ": ";

                            if (medstats.cats[cIdx].pharma_class)
                                isOpioid = (medstats.cats[cIdx].pharma_class.toLowerCase().indexOf("opioid") >= 0) ;
                            if (medstats.cats[cIdx].routes)
                                isOral = (medstats.cats[cIdx].routes.toLowerCase().indexOf("oral") >= 0) ;
                            
                            if (medstats.cats[cIdx].mme[order.OrderID.ID]) {
                                mmeJSON = medstats.cats[cIdx].mme[order.OrderID.ID] ;
                                mmeFactor = mmeJSON.conv_factor ;
                                this.resultText += " found mme data :" + mmeFactor + " json: " + JSON.stringify(mmeJSON) ;
                            } else {
                                this.resultText += " - no matching mme data ";
                            }
                            genericName = medstats.cats[cIdx].generic_name ;
                            if (genericName == '')
                                genericName = medstats.cats[cIdx].name ;

                            } catch (err) {
                                this.resultText += "\n" + "Error in JS Call 2" + err ;    
                            }                            
                            //catIdx = categories.findIndex(function(cat) { return cat.name == order.Name }) ;
                            catIdx = categories.findIndex(function(cat) { return cat.name == genericName }) ;

                            try {
                            var medColor = "" ;  
                            if (medstats.cats[cIdx].routes.toLowerCase().indexOf("transdermal") >= 0) {
                                var logMesg = this.$services.a3pain.explodePatchMARRecords(medstats.cats[cIdx], order) ;
                                this.resultText += "\n " + logMesg ;
                            }
                            // deal with epidural infusions - and not pca and pcea
                            if (order.Name.toLowerCase().indexOf("epidural") > 0 && order.Name.toLowerCase().indexOf("infusion") > 0
                                  && order.Name.toLowerCase().indexOf(" pca") < 0 && order.Name.toLowerCase().indexOf(" pcea") < 0  ) {
                                isOpioid = true ;
                                medstats.cats[cIdx].routes = "Epidural" ;
                                this.$services.a3pain.processEpiduralInfusions(order) ;
                            }

                            var ma = {} ; 
                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                ma = order.MedicationAdministrations[mIdx] ;
                                if (new Date(ma.AdministrationInstant).getTime() < rpt_start_date_long || new Date(ma.AdministrationInstant).getTime() > rpt_end_date_long) {
                                    console.log("Skipping mar " + JSON.stringify(ma) + " cause admin time is not within reporting period") ;
                                    continue ;
                                }
                                if (ma.Action != "Not Given" && ma.Action != 'Canceled Entry') {
                                    if (!ma.Dose["Value"] || ma.Dose.Value == null || ma.Dose.Value == "null") continue ;
                                    if (!ma.Dose.Unit) ma.Dose.Unit = "" ;
                                    ma.Dose.Unit = ma.Dose.Unit.toLowerCase() ;
                                    // Initializing here instead of before loop - so only cats added if there is data to be added
                                    if (catIdx == -1) {
                                        catIdx = categories.length ;
                                        //medColor = (catIdx < sealColors.length?sealColors[catIdx]:"") ;
                                                                                
                                        if (this.medColors[genericName]) {
                                            medColor = this.medColors[genericName] ;
                                        } else {
                                            var medColorIdx = Object.keys(this.medColors).length ;
                                            medColor = (medColorIdx < sealColors.length?sealColors[medColorIdx]:"") ;
                                            this.medColors[genericName] = medColor ;
                                        }
                                        
                                        categories.push({ name: genericName , pointWidth: 30, data: [], isOpioid: isOpioid, isOral: isOral, color: medColor, routes: medstats.cats[cIdx].routes } ) ;
                                    } else {
                                        medColor = categories[catIdx].color ;
                                    }
                                    
                                    mmeFactor = mmeJSON.conv_factor ;
                                    if (ma.Dose.Unit != mmeJSON.conv_unit) {
                                        if (ma.Dose.Unit == "mcg" && mmeJSON.conv_unit == "mg")
                                            mmeFactor = mmeFactor / 1000 ;
                                        else if (ma.Dose.Unit == "mg" && mmeJSON.conv_unit == "mcg")
                                            mmeFactor = mmeFactor * 1000 ;
                                        else if (ma.Dose.Unit == "ml" && mmeJSON.conv_unit == "mcg")
                                            mmeFactor = mmeFactor * 1000 ;
                                    } 

                                    ma.mme = parseFloat(ma.Dose.Value) * mmeFactor ;
                                    if (ma.mme)
                                        ma.mme = parseFloat(ma.mme.toFixed(2)) ;

                                    // ma.Dose.Value and ma.Dose.Unit
                                    var marTime = new Date(ma.AdministrationInstant).getTime() ;
                                    // same order same time means duplicate - happens when there is hosp enc and surgery encounters - which falls in same date range
                                    // so mar ws calls will have two set of csn ids with same order id                            
                                    var cdataIdx = cdata.findIndex(function(point) { 
                                            return point.x == marTime && point.meds.findIndex(function(med) { return med.order_id == order.OrderID.ID }) >= 0 
                                        }
                                    ) ;
                                    if (cdataIdx >= 0) {
                                        console.log("Skipping this MAR row cause of duplicate data") ; 
                                        continue ;
                                    }
                                    cdataIdx = cdata.findIndex(function(point) { return point.x == marTime && point.y == catIdx }) ;
                                    if (cdataIdx >= 0) {
                                        cdata[cdataIdx].mme = cdata[cdataIdx].mme + ma.mme ;
                                        cdata[cdataIdx].meds.push({name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme, order_id: order.OrderID.ID, route: medstats.cats[cIdx].routes })
                                    } else {
                                        cdata.push({ x: marTime, y: catIdx, mme: ma.mme, color: medColor, name: genericName, routes: medstats.cats[cIdx].routes,
                                            meds: [ {name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme, order_id: order.OrderID.ID, route: medstats.cats[cIdx].routes} ] } ) ;
                                    }
                                }
                            }
                            } catch (err) {
                                this.log("Error in MME aggregation :" + err) ;
                                this.log(JSON.stringify(ma));
                            }                            
                        }) ; 
                    }) ;
                    
                    if (pca_mars) {
                        pca_mars.forEach(med => {
                            try {
                            var genericName = med.generic_name ;
                            var medColor = "" ;
                            var pcaRoute = "PCA" ;
                            if (med.name.toLowerCase().indexOf("pcea") > 0)
                                pcaRoute = "PCEA" ;
                            this.log("Processing " + pcaRoute + ":" + med.name + "  Generic Name: " + genericName) ;

                            var catIdx = categories.findIndex(function(cat) { return cat.name == genericName }) ;
                            if (catIdx == -1) {
                                catIdx = categories.length ;

                                if (this.medColors[genericName]) {
                                    medColor = this.medColors[genericName] ;
                                } else {
                                    var medColorIdx = Object.keys(this.medColors).length ;
                                    medColor = (medColorIdx < sealColors.length?sealColors[medColorIdx]:"") ;
                                    this.medColors[genericName] = medColor ;
                                }
                                
                                categories.push({ name: genericName , pointWidth: 30, data: [], isOpioid: true, isOral: false, color: medColor, routes: pcaRoute} ) ;
                            } else {
                                medColor = categories[catIdx].color ;
                            }
                            } catch (err) {
                                this.resultText += "\n Error in PCA Mar outer loop " + err ;
                            }
                            med.data.forEach(point => {
                                try {                            
                                var marTime = point.recorded_time ;
                                point.mme = point.dosage * med.conv_factor ;
                                point.mme = parseFloat(point.mme.toFixed(2)) ;

                                var cdataIdx = cdata.findIndex(function(point1) { return point1.x == marTime && point1.y == catIdx }) ;                            
                                if (cdataIdx >= 0) {
                                    cdata[cdataIdx].mme = cdata[cdataIdx].mme + point.mme ;
                                    cdata[cdataIdx].meds.push({name: med.name, dose: point.dosage, unit: med.unit, mme: point.mme, route: pcaRoute })
                                } else {
                                    cdata.push({ x: marTime, y: catIdx, mme: point.mme, color: medColor, name: genericName, routes: pcaRoute,
                                        meds: [ {name: med.name, dose: point.dosage, unit: med.unit, mme: point.mme, route: pcaRoute } ] } ) ;
                                }    
                                } catch (err) {
                                    this.resultText += " Error in PCA Mar inside point loop " + err ;
                                }                        
                            }); 
                        }) ;
                    } ;

                    this.resultText += "\n Total chart data :" + cdata.length ;
                    
                    try {
                    this.medCategories = JSON.parse(JSON.stringify(categories)) ;
                    
                    // Sort the categories based on name - reverse
                    categories.sort(function(a, b) {
                        return b.name.localeCompare(a.name) ;
                    }) ; 
                    // create a map with name and idx
                    var catMap = {} ;
                    categories.forEach(function(cat, cIdx) {
                        catMap[cat.name] = cIdx ;
                    }) ;
                    // change the y to reflect new cat idx
                    cdata.forEach(function(cd) {                    
                        cd.y = catMap[cd.name] ;
                    }) ;
                                        

                    this.marData = JSON.parse(JSON.stringify(cdata)) ;

                    this.log("Before calling refreshMarChart method....") ;
                    this.refreshMarChart() ;
                    this.log("Before calling refreshMMEChart method....") ;
                    this.refreshMMEChart() ;
                    
                    this.log("Before calling generateROADChart method...") ;
                    
                    this.generateRoadChart() ;
                    
                    this.log("Done creating road chart") ;

                    } catch (err) {
                        this.log("Error in no idea 1 :" + err) ;                        
                    }

                    this.log(" Before Invoking pain data in BQ") ;
                    
                    // getting pain data                    
                    this.$services.a3pain.pain(_self.launchModal.rpt_start_date, _self.launchModal.rpt_end_date, _self.patient.epicPatientId)
                        .then(response => {
                            try {
                            this.log("response from pain call " + response.length) ;
                            console.log(response) ;
                            
                            //this.log(" Result from Pain BQ Call " + JSON.stringify(response) ;        
                            var cdata = response.map(function(pn) { return { x: pn.recorded_time, y: pn.meas_value }}) ;
                            // sort mdata
                            cdata.sort(function (a, b) {
                                return a.x - b.x ;
                            }) ;
                            
                            this.painData = cdata ;
                            
                            this.log("Before settinng the paindata for mmechartoptions") ;
                            window.setTimeout(function() {
                                _self.resultText += "\n" + "** In the timeout method to refresh the chart options" ;
                                try {
                                    _self.mmeChartOptions.series[1].data = cdata ;
                                } catch (err) {
                                     _self.resultText += "\n Error in timeout stuff :" +  err ; 
                                } 
                            }, 2000 ) ;                            
                                                        
                            } catch (err) {
                                this.log("Error in pain handler code :" + err) ;
                            }
                        }) ; 
                    
                    this.launchModal.loading = false ;
                    this.$bvModal.hide("launch-modal") ;

                }) ;
                
            } catch (err) {
                this.log("Error in JS Call : " + err) ;
            }

        },
        refreshMarChart() {
            try {
                var rpt_start_date_long = this.launchModal.rpt_start_date_long ;
                var rpt_end_date_long = this.launchModal.rpt_end_date_long ;
                console.log("in refreshmarchart report end date long :" + rpt_end_date_long) ;

                var _self = this ;

                this.log("in refreshMarChart START ") ;

                var categories = [] ;
                var cdata = [] ;

                if (this.analgesicCategory == 'Opioids Only') {
                    categories = this.medCategories.filter(function (cat) { return cat.isOpioid }) ;                    
                } else if (this.analgesicCategory == 'Non-Opioids Only') {
                    categories = this.medCategories.filter(function (cat) { return !cat.isOpioid }) ;                         
                } else {
                    categories = this.medCategories.filter(function(med) {return true ;}) ;  // clone the array
                }
                
                if (this.routeOfAdmin == 'Oral') {
                    categories = categories.filter(function (cat) { return cat.isOral }) ;                    
                } else if (this.routeOfAdmin == 'Non-Oral') {
                    categories = categories.filter(function (cat) { return !cat.isOral }) ;
                }
                
                // Sort the categories based on name
                categories.sort(function(a, b) {
                    return b.name.localeCompare(a.name) ;
                }) ; 
                // create a map with name and idxs
                var catMap = {} ;
                categories.forEach(function(cat, cIdx) {
                    catMap[cat.name] = cIdx ;
                }) ;
                
                this.log("Before Cat count :" + categories.length  + " marData count :" + this.marData.length) ;

                cdata = this.marData.filter(function (md) {
                    var cat = categories[catMap[md.name]] ;
                    if (!cat) {
                        //console.log(" Cat doesn't exist for mar data {}" , md.name) ;
                        return false;                        
                    }
                    var filtered = true ;
                    if (_self.analgesicCategory == 'All' && _self.routeOfAdmin == 'All') {
                        return true ;
                    }
                    if (_self.analgesicCategory == 'Opioids Only')
                        filtered = filtered && cat.isOpioid ;
                    else if (_self.analgesicCategory == 'Non-Opioids Only')
                        filtered = filtered && !cat.isOpioid ;
                    
                    if (_self.routeOfAdmin == 'Oral') 
                        filtered = filtered && cat.isOral ;
                    else if (_self.routeOfAdmin == 'Non-Oral') 
                        filtered = filtered && !cat.isOral ;
                    
                    console.log("filter status :" + filtered) ;

                    return filtered ;
                }) ;

                cdata = JSON.parse(JSON.stringify(cdata)) ;  // basic simple deep clone

                // change the y to reflect new cat idx
                cdata.forEach(function(cd) {
                    cd.y = catMap[cd.name] ;
                }) ;

                this.log("in refreshMarChart: filters & sorting completed ") ;
                this.log("After Cat count :" + categories.length  + " cdata count :" + cdata.length) ;

                //var medChartOptions = this.medChartOptions ;
                // No idea why - but if we use the this.medChartOptions, the chart does not render
                var medChartOptions = {} ;
                
                medChartOptions = this.getMedsChart(rpt_start_date_long, rpt_end_date_long) ;

                medChartOptions.yAxis[0].categories = categories.map(function(cat) { return cat.name }) ;
                medChartOptions.series[0].data = cdata ;

                this.$set(this, 'medChartOptions', medChartOptions) ;

                this.log(" in refreshMarChart: medchartoptions updated ") ;

                this.log("MEDCHARTOPTIONS " + JSON.stringify(_self.medChartOptions)) ;            
            
            } catch (err) {
                console.log("Error {}", err) ;
                this.log("Error in refreshMarChart " + err) ;
            }


        },
        refreshMMEChart() {
            
            this.log("in refreshMMEChart START start time: " + this.start_time + " durtaion: " + this.mmeDuration) ;

            var _self = this ;
            try {
                var hr = parseInt(this.start_time.split(":")[0])  ;
                var am_pm = this.start_time.substr(-2).toLowerCase() ;

                if (hr == 12 && "am" == am_pm) hr = 0 ;
                if (hr < 12 && "pm" == am_pm) hr = hr + 12 ;

                var min = parseInt( (this.start_time.split(":")[1]).substr(0, 2) ) ;

                var start_time_long = this.$moment(this.launchModal.rpt_start_date_long).startOf('day').add(hr, 'hours').add(min, 'minutes').valueOf() ;
                this.log("start time :" + this.$moment(start_time_long).format("MM/DD/YYYY HH:mm:ss")) ;

                var dateChunks = this.getTimePeriods(start_time_long, this.launchModal.rpt_end_date_long, this.mmeDuration) ;
                this.log("Date Chunks: " + JSON.stringify(dateChunks)) ;

                var mmeChartData = [] ;
                
                var categories = [] ;
                if (_self.divideOpioidsBy == "opioids") {
                    categories = this.medCategories.filter(cat => cat.isOpioid).map(function(cat) { 
                        return {
                                name: cat.name, type: 'column', data: [], isOpioid: cat.isOpioid, color: cat.medColor, 
                                pointPlacement: -0.25, pointInterval: (_self.mmeDuration * 60 * 1000), pointRange: ((_self.mmeDuration * 60 * 1000) * 1.95) 
                            } 
                    }) ;                    
                } else {
                    var fixedRoutes = ['Sublingual', 'Transdermal', 'Intravenous', 'Epidural', 'Oral', 'PCA', 'PCEA'] ; // 'Injection', 

                    this.medCategories.filter(cat => cat.isOpioid).forEach(function(cat) {
                        var catRoute = cat.routes ;
                        if (catRoute == "Injection") catRoute = "Intravenous" ;

                        if (fixedRoutes.indexOf(catRoute) < 0)
                            catRoute = "Others" ;
                        var rIdx = categories.findIndex(x => { return x.name == catRoute }) ;
                        if (rIdx < 0) {                            
                            categories.push({
                                name: catRoute, type: 'column', data: [], isOpioid: cat.isOpioid, color: cat.medColor, 
                                pointPlacement: -0.25, pointInterval: (_self.mmeDuration * 60 * 1000), pointRange: ((_self.mmeDuration * 60 * 1000) * 1.95) 
                            })
                        }                        
                    }) ;     
                }

                var mmeChartOptions = this.getMMEChart(this.launchModal.rpt_start_date_long, this.launchModal.rpt_end_date_long) ;
                mmeChartOptions.xAxis.tickInterval = (this.mmeDuration * 60 * 1000) ;

                this.marData.forEach(function (marPoint) {
                    
                    if (!marPoint.mme || marPoint.mme == 0) return ;

                    var chunkIdx = dateChunks.findIndex(period => { return (marPoint.x > period.start && marPoint.x <= period.end) }) ;
                    
                    //_self.log("Processing MarPoint :" + JSON.stringify(marPoint)) ;
                    
                    if (chunkIdx < 0) {
                        _self.log("This should not happen - chunkIdx is negative") ;
                        return ;
                    }
                    //_self.log(" period bucket end :" + dateChunks[chunkIdx].end + " : " + _self.$moment(dateChunks[chunkIdx].end).format("MM/DD/YYYY HH:mm")) ;

                    var chartPoint = {} ;
                    var chartDataIdx = mmeChartData.findIndex(point => { return (point.x == dateChunks[chunkIdx].end) }) ;                    
                    if (chartDataIdx > -1) {
                        chartPoint = mmeChartData[chartDataIdx] ;
                        chartPoint.y = chartPoint.y + marPoint.mme ;                        
                        marPoint.meds.forEach(med => {
                            var idx = chartPoint.meds.findIndex(function(point) { return point.name == med.name }) ;
                            if (idx >= 0) {
                                chartPoint.meds[idx].mme = chartPoint.meds[idx].mme + marPoint.mme ;
                                if (chartPoint.routes.toLowerCase() == "oral") {
                                    if (chartPoint.meds[idx].dose_qty) 
                                        chartPoint.meds[idx].dose_qty = chartPoint.meds[idx].dose_qty + 1 ;
                                    else
                                        chartPoint.meds[idx].dose_qty = 2 ;
                                }
                            } else {
                                chartPoint.meds.push(JSON.parse(JSON.stringify(med))) ;  // cloning and addding
                            }
                        }) ;

                    } else {
                        //chartPoint = { x: dateChunks[chunkIdx].end, y: marPoint.mme, start: dateChunks[chunkIdx].start, meds: [ { name: marPoint.name, mme: marPoint.mme } ] } ;
                        chartPoint = { x: dateChunks[chunkIdx].end, y: marPoint.mme, start: dateChunks[chunkIdx].start, routes: marPoint.routes, meds: JSON.parse(JSON.stringify(marPoint.meds)) } ;
                        mmeChartData.push( chartPoint ) ;
                    }

                    // for stacked chart
                    var catName = "" ;
                    if (_self.divideOpioidsBy == "opioids") {
                        catName = marPoint.name ;
                    } else {                        
                        catName = marPoint.routes ; 
                        if (catName == "Injection") catName = "Intravenous" ;
                    }

                    var catIdx = categories.findIndex(function(cat) { return cat.name == catName }) ;
                    _self.log(" Category: " + catName + " index :" + catIdx) ;
                    var dtIdx = categories[catIdx].data.findIndex(function(row) { return (row.x == dateChunks[chunkIdx].end) }) ;
                    if (dtIdx > -1) {
                        var catChartPoint = categories[catIdx].data[dtIdx] ;
                        //_self.log("Existing data :" + JSON.stringify(catChartPoint)) ;                        
                        catChartPoint.y = catChartPoint.y + marPoint.mme ;
                        marPoint.meds.forEach(med => {
                            var idx = catChartPoint.meds.findIndex(function(point) { return point.name == med.name }) ;
                            if (idx >= 0) {
                                catChartPoint.meds[idx].mme = catChartPoint.meds[idx].mme + marPoint.mme ;
                                if (catChartPoint.routes.toLowerCase() == "oral") {
                                    if (catChartPoint.meds[idx].dose_qty)
                                        catChartPoint.meds[idx].dose_qty = catChartPoint.meds[idx].dose_qty + 1 ;
                                    else
                                        catChartPoint.meds[idx].dose_qty = 2 ;
                                }
                            } else {
                                catChartPoint.meds.push(JSON.parse(JSON.stringify(med))) ;  // clone and add
                            }
                        }) ;
                        //_self.log("After merging chartPoit: " + JSON.stringify(catChartPoint)) ;
                    } else {
                        var catChartPoint = { x: dateChunks[chunkIdx].end, y: marPoint.mme, name: catName, start: dateChunks[chunkIdx].start, routes: marPoint.routes, meds: JSON.parse(JSON.stringify(marPoint.meds))} ;
                        categories[catIdx].data.push(catChartPoint) ;
                        //_self.log("New one - so pushing it to categories: " + JSON.stringify(catChartPoint)) ;                        
                    }   
                }) ;
                            
                // sort mdata
                mmeChartData.sort(function (a, b) {
                    return a.x - b.x ;
                }) ;

                this.log("Final MMEChartData: " + JSON.stringify(mmeChartData)) ;

                mmeChartOptions.series[0].data = mmeChartData ;
                
                if (this.painData && this.painData.length > 0) {
                    this.resultText += "\n Setting the pain data inside refreshMME chart" ;
                    mmeChartOptions.series[1].data = this.painData ;
                }

                categories.forEach(cat => {
                    cat.data.sort(function(a, b) { return b.x - a.x }) ;
                    cat.selected = true ;
                    mmeChartOptions.series.push(cat) ;
                }) ;
                           
                //mmeChartOptions = 
                //    {"chart":{"spacingTop":20,"zoomType":"x","displayErrors":true,"height":450},"exporting":{"libURL":"https://www.noidea.com","buttons":{"contextButton":{"menuItems":[{"text":"Print Chart"}]}},"fallbackToExportServer":false},"title":{"text":"","align":"center"},"credits":{"enabled":false},"legend":{"enabled":true},"xAxis":{"crosshair":true,"events":{},"type":"datetime","min":1638604800000,"max":1639209600000,"title":{"text":"Inpatient Time Period","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}},"tickInterval":86400000},"yAxis":[{"title":{"text":"Opioid Morphine Milliequivalemt (MME)","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}},"min":0},{"title":{"text":"Pain Scores","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}},"min":0,"max":10,"opposite":true}],"tooltip":{"shadow":false,"valueDecimals":2,"useHTML":true},"plotOptions":{"series":{"dataLabels":{"allowOverlap":true},"minPointLength":10},"line":{"dataLabels":{"enabled":true}},"column":{"stacking":"normal","dataLabels":{"enabled":false}}},"series":[{"name":"Total MME","yAxis":0,"color":"#999999","data":[{"x":1638691199000,"y":137.5,"start":1638604800000,"meds":[{"name":"fentaNYL 50 mcg/mL injection 50 mcg","dose":"50","unit":"mcg","mme":30,"order_id":"762968730"},{"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":45,"order_id":"762964795"},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":7.5,"order_id":"762898923"},{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":40,"order_id":"762916513"},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":15,"order_id":"762916516"}]},{"x":1638777599000,"y":258.84000000000003,"start":1638691200000,"meds":[{"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":75,"order_id":"763001719"},{"name":"remifentaniL (Ultiva) IV injection","dose":".05","unit":"mcg/kg/min","mme":90.84,"order_id":"763002638"},{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":40,"order_id":"762916514"},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":45,"order_id":"762916516"},{"name":"HYDROmorphone (Dilaudid) 2 mg/mL ampule inj","dose":".4","unit":"mg","mme":8,"order_id":"763030939"}]},{"x":1638863999000,"y":155,"start":1638777600000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":30,"order_id":"762916514"},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":30,"order_id":"762916516"},{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":80,"order_id":"763139159"},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":15,"order_id":"763139160"}]},{"x":1638950399000,"y":249.5,"start":1638864000000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":15,"order_id":"762916516"},{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":80,"order_id":"763139159"},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":52.5,"order_id":"763139160"},{"name":"HYDROmorphone (Dilaudid) 2 mg/mL ampule inj 1.2 mg","dose":"1.2","unit":"mg","mme":72,"order_id":"763396940"},{"name":"fentaNYL 50 mcg/mL injection","dose":"100","unit":"mcg","mme":30,"order_id":"763535238"}]},{"x":1639036799000,"y":139.5,"start":1638950400000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":7.5,"order_id":"763543168"},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":60,"order_id":"763547310"},{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":20,"order_id":"763547312"},{"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg","mme":12,"order_id":"763569839"},{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":20,"order_id":"763758134"},{"name":"hydromorphone pca total given (mg)","dose":1,"unit":"mg","mme":20}]},{"x":1639123199000,"y":166,"start":1639036800000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":60,"order_id":"763619585"},{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":20,"order_id":"763769860"},{"name":"HYDROmorphone (Dilaudid) 2 mg/mL ampule inj 1.2 mg","dose":"1.2","unit":"mg","mme":48,"order_id":"763854072"},{"name":"oxyCODONE (Roxicodone) tablet 20 mg","dose":"20","unit":"mg","mme":30,"order_id":"763983265"},{"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg","mme":8,"order_id":"763983306"}]},{"x":1639209599000,"y":182,"start":1639123200000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 20 mg","dose":"20","unit":"mg","mme":150,"order_id":"763983265"},{"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg","mme":32,"order_id":"763983306"}]}],"zIndex":20,"pointPlacement":-0.25,"selected":true},{"name":"Pain Score","yAxis":1,"color":"#00548f","data":[],"zIndex":19,"selected":true},{"name":"fentanyl citrate/pf","type":"column","data":[{"x":1638950399000,"y":30,"name":"fentanyl citrate/pf","start":1638864000000,"meds":[{"name":"fentaNYL 50 mcg/mL injection","dose":"100","unit":"mcg","mme":30,"order_id":"763535238"}]},{"x":1638777599000,"y":75,"name":"fentanyl citrate/pf","start":1638691200000,"meds":[{"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":75,"order_id":"763001719"}]},{"x":1638691199000,"y":75,"name":"fentanyl citrate/pf","start":1638604800000,"meds":[{"name":"fentaNYL 50 mcg/mL injection 50 mcg","dose":"50","unit":"mcg","mme":30,"order_id":"762968730"},{"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":45,"order_id":"762964795"}]}],"isOpioid":true,"pointPlacement":-0.25,"pointInterval":86400000,"pointRange":168480000,"selected":true},{"name":"remifentanil hcl","type":"column","data":[{"x":1638777599000,"y":90.84,"name":"remifentanil hcl","start":1638691200000,"meds":[{"name":"remifentaniL (Ultiva) IV injection","dose":".05","unit":"mcg/kg/min","mme":90.84,"order_id":"763002638"}]}],"isOpioid":true,"pointPlacement":-0.25,"pointInterval":86400000,"pointRange":168480000,"selected":true},{"name":"oxycodone hcl","type":"column","data":[{"x":1639209599000,"y":150,"name":"oxycodone hcl","start":1639123200000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 20 mg","dose":"20","unit":"mg","mme":150,"order_id":"763983265"}]},{"x":1639123199000,"y":90,"name":"oxycodone hcl","start":1639036800000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":60,"order_id":"763619585"},{"name":"oxyCODONE (Roxicodone) tablet 20 mg","dose":"20","unit":"mg","mme":30,"order_id":"763983265"}]},{"x":1639036799000,"y":67.5,"name":"oxycodone hcl","start":1638950400000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":7.5,"order_id":"763543168"},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":60,"order_id":"763547310"}]},{"x":1638950399000,"y":67.5,"name":"oxycodone hcl","start":1638864000000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":15,"order_id":"762916516"},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":52.5,"order_id":"763139160"}]},{"x":1638863999000,"y":45,"name":"oxycodone hcl","start":1638777600000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":30,"order_id":"762916516"},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":15,"order_id":"763139160"}]},{"x":1638777599000,"y":45,"name":"oxycodone hcl","start":1638691200000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":45,"order_id":"762916516"}]},{"x":1638691199000,"y":22.5,"name":"oxycodone hcl","start":1638604800000,"meds":[{"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":7.5,"order_id":"762898923"},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":15,"order_id":"762916516"}]}],"isOpioid":true,"pointPlacement":-0.25,"pointInterval":86400000,"pointRange":168480000,"selected":true},{"name":"hydromorphone hcl","type":"column","data":[{"x":1639209599000,"y":32,"name":"hydromorphone hcl","start":1639123200000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg","mme":32,"order_id":"763983306"}]},{"x":1639123199000,"y":28,"name":"hydromorphone hcl","start":1639036800000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":20,"order_id":"763769860"},{"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg","mme":8,"order_id":"763983306"}]},{"x":1639036799000,"y":52,"name":"hydromorphone hcl","start":1638950400000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":20,"order_id":"763547312"},{"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg","mme":12,"order_id":"763569839"},{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":20,"order_id":"763758134"}]},{"x":1638950399000,"y":80,"name":"hydromorphone hcl","start":1638864000000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":80,"order_id":"763139159"}]},{"x":1638863999000,"y":110,"name":"hydromorphone hcl","start":1638777600000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":30,"order_id":"762916514"},{"name":"HYDROmorphone (Dilaudid) syringe 1 mg","dose":"1","unit":"mg","mme":80,"order_id":"763139159"}]},{"x":1638777599000,"y":40,"name":"hydromorphone hcl","start":1638691200000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":40,"order_id":"762916514"}]},{"x":1638691199000,"y":40,"name":"hydromorphone hcl","start":1638604800000,"meds":[{"name":"HYDROmorphone (Dilaudid) syringe 0.5 mg","dose":"0.5","unit":"mg","mme":40,"order_id":"762916513"}]}],"isOpioid":true,"pointPlacement":-0.25,"pointInterval":86400000,"pointRange":168480000,"selected":true},{"name":"hydromorphone hcl/pf","type":"column","data":[{"x":1639123199000,"y":48,"name":"hydromorphone hcl/pf","start":1639036800000,"meds":[{"name":"HYDROmorphone (Dilaudid) 2 mg/mL ampule inj 1.2 mg","dose":"1.2","unit":"mg","mme":48,"order_id":"763854072"}]},{"x":1638950399000,"y":72,"name":"hydromorphone hcl/pf","start":1638864000000,"meds":[{"name":"HYDROmorphone (Dilaudid) 2 mg/mL ampule inj 1.2 mg","dose":"1.2","unit":"mg","mme":72,"order_id":"763396940"}]},{"x":1638777599000,"y":8,"name":"hydromorphone hcl/pf","start":1638691200000,"meds":[{"name":"HYDROmorphone (Dilaudid) 2 mg/mL ampule inj","dose":".4","unit":"mg","mme":8,"order_id":"763030939"}]}],"isOpioid":true,"pointPlacement":-0.25,"pointInterval":86400000,"pointRange":168480000,"selected":true},{"name":"hydromorphone","type":"column","data":[{"x":1639036799000,"y":20,"name":"hydromorphone","start":1638950400000,"meds":[{"name":"hydromorphone pca total given (mg)","dose":1,"unit":"mg","mme":20}]}],"isOpioid":true,"pointPlacement":-0.25,"pointInterval":86400000,"pointRange":168480000,"selected":true}]} ;

                mmeChartOptions.xAxis.plotBands = [] ;
                var fromTime = mmeChartOptions.xAxis.min ;
                var toTime = 0 ;
                var bandColor = "#E0E0E0" ;
                while (fromTime <= mmeChartOptions.xAxis.max) {                        
                    toTime = fromTime + ((24 * 60 * 60 * 1000)) ;
                    mmeChartOptions.xAxis.plotBands.push({
                        color: bandColor, from: fromTime, to: toTime
                    }) ;
                    fromTime = toTime ;
                    bandColor = (bandColor == "#E0E0E0"?"white":"#E0E0E0") ;
                }
                this.log("Completed MME Chart Options: " + JSON.stringify(mmeChartOptions)) ;

                this.mmeChartOptions = mmeChartOptions ;

            } catch (err) {
                this.log("*****Error in refreshMMEChart :"  + err) ;
            }
        },
        merge(string1, string2) {
            return this.$services.medreview.unique_merge(string1, string2) ;
        },        
        async generateRoadChart() {
            this.log("Generate Road for :" + this.road.discharge_date + " " + this.road.discharge_time) ;
            try {
                var disch_datetime = this.$moment(this.road.discharge_date + " " + this.road.discharge_time).valueOf() ;
                var dischargeDateLong = this.$moment(disch_datetime).startOf('day').valueOf() ;
                var dischargeDate24HrEarlierLong = this.$moment(dischargeDateLong).add(-1, 'days').valueOf() ;
                if (dischargeDateLong >= this.launchModal.rpt_start_date_long && dischargeDateLong <= this.launchModal.rpt_end_date_long
                    && dischargeDate24HrEarlierLong >= this.launchModal.rpt_start_date_long && dischargeDate24HrEarlierLong <= this.launchModal.rpt_end_date_long)
                    this.road.totalMME = await this.$services.a3pain.getTotalMMEForLast24Hours(disch_datetime, this.marData, this.patient.epicPatientId, this.log) ;
                else
                    this.road.totalMME = await this.$services.a3pain.getTotalMMEForLast24Hours(disch_datetime, null, this.patient.epicPatientId, this.log) ;
                
                this.log("In generateroadchart totalMME is: " + this.road.totalMME) ;
                
                this.road.chart.dosage = this.$services.a3pain.roadChart(this.road.totalMME, this.road.distributionStartDate).dosage ;

                if (this.road.chart.dosage.length == 0)
                {
                    this.log("No Dosage has bee computed.. returning") ;
                    return ;
                }
                var roadChartOptions = this.getDefaultChartConfig({
                    start_time: this.road.chart.dosage[0].date,
                    end_time: this.road.chart.dosage[this.road.chart.dosage.length - 1].date,                
                    //type: 'column', 
                    title: '',
                    height: 400
                }) ;
                roadChartOptions.events =  {} ; // resetting setExtremes method
                roadChartOptions.chart.id = 'roadChart' ;
                roadChartOptions.tooltip.useHTML = true ;
                roadChartOptions.yAxis[0].title = {
                    text: "Total mg of Oxycodone"
                }
                roadChartOptions.tooltip.formatter = function () {           
                    var tip = "" ;
                    if (this.point.freq > 0) { 
                        tip = this.point.y + " mg per day" ;
                        tip += "<br>" + this.point.strength + " mg " + this.point.freq + " times a day" ; 
                    } else {
                        tip = this.point.strength + " mg per day" ; 
                    }
                    tip += "<br><span style='font-size:smaller'>" + Highcharts.dateFormat('%m/%d/%Y', this.point.x) + "</span>" ;

                    return tip ;
                } ;

                roadChartOptions.plotOptions = {
                    line: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return this.y + " mg" ;
                            }
                        }
                    }
                } ;

                roadChartOptions.series = [{
                    data: this.road.chart.dosage.map(dose => { return { x: dose.date, y : (dose.freq > 0 ? dose.strength * dose.freq : dose.strength), freq: dose.freq, strength: dose.strength } }) ,
                    xDateFormat: '%m/%d/%Y',
                    type: 'line',
                    name: ''
                }] ;

                roadChartOptions.series[0].data = roadChartOptions.series[0].data.map(point => { 
                    point.color = (point.y > 60 ? "red": "green") ;
                    return point ;
                }) ;


                roadChartOptions.yAxis[0].plotLines = [{
                    color: '#FF0000',
                    dashStyle: 'ShortDash',
                    width: 2,
                    value: 60
                }] ;

                this.road.chart.chartOptions = roadChartOptions ;
                var key = 0 ;
                this.road.chart.events = this.road.chart.dosage.map(dose => {
                    if (dose.freq > 0)
                        return { key: key++, customData: { title: dose.strength + " mg " + dose.freq + " times a day", class: 'text-info text-small ml-2'} , dates: new Date(dose.date) } ;
                    else 
                        return { key: key++, customData: { title: dose.strength + " mg per day", class: 'text-info text-small ml-2'} , dates: new Date(dose.date) } ;
                }) ;

                var key = 1 ;
                this.road.chart.dosageTable = this.road.chart.dosage.map(dose => {
                    if (dose.freq > 0)
                        return { day: "day " + key++, date: this.$moment(dose.date).format("MM/DD/YYYY"),  dosage: dose.strength + " mg " + dose.freq + " times a day", 
                            total: (dose.freq * dose.strength) + " mg", total_tablets: ((dose.freq * dose.strength) / 5) } ;
                    else 
                        return { day: "day " + key++, date: this.$moment(dose.date).format("MM/DD/YYYY"), dosage: dose.strength + " mg per day", 
                            total: dose.strength + " mg" , total_tablets: (dose.strength / 5)} ;
                }) ;

                this.log("Road Chart Options") ;
                this.log(this.road.chart) ;
            } catch (err) {
                this.log("Error in generateRoadChart Method :" + err) ;
            }

        },
        testRoadChart() {
            console.log("road chart test invoked") ;                        
            this.road.chart = this.$services.a3pain.roadChart(this.road.totalMME, this.road.distributionStartDate) ;
            
            var chartOptions = this.getDefaultChartConfig({
                start_time: this.road.chart.dosage[0].date,
                end_time: this.road.chart.dosage[this.road.chart.dosage.length - 1].date,                
                //type: 'column', 
                title: '',
                height: 400
            }) ;

            chartOptions.tooltip.useHTML = true ;
            chartOptions.yAxis[0].title = {
                text: "Total mg of Oxycodone"
            }
            chartOptions.tooltip.formatter = function () {           
                var tip = "" ;
                if (this.point.freq > 0) { 
                    tip = this.point.y + " mg per day" ;
                    tip += "<br>" + this.point.strength + " mg " + this.point.freq + " times a day" ; 
                } else {
                    tip = this.point.strength + " mg per day" ; 
                }
                tip += "<br><span style='font-size:smaller'>" + Highcharts.dateFormat('%m/%d/%Y', this.point.x) + "</span>" ;

                return tip ;
            } ;

            chartOptions.plotOptions = {
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.y + " mg" ;
                         }
                    }                    
                }
            } ;

            chartOptions.series = [{
                data: this.road.chart.dosage.map(dose => { 
                    return { x: dose.date, y : (dose.freq > 0 ? dose.strength * dose.freq : dose.strength), 
                            freq: dose.freq, strength: dose.strength } 
                }) ,
                xDateFormat: '%m/%d/%Y',
                type: 'line'
            }] ;

            chartOptions.series[0].data = chartOptions.series[0].data.map(point => { 
                point.color = (point.y > 60 ? "red": "green") ;
                return point ;
            }) ;

            chartOptions.yAxis[0].plotLines = [{
                color: '#FF0000',
                dashStyle: 'ShortDash',
                width: 2,
                value: 60
            }] ;

            this.road.chart.chartOptions = chartOptions ;
            var key = 0 ;
            this.road.chart.events = this.road.chart.dosage.map(dose => {
                if (dose.freq > 0)
                    return { key: key++, customData: { title: dose.strength + " mg " + dose.freq + " times a day", class: 'text-info text-small ml-2'} , dates: new Date(dose.date) } ;
                else 
                    return { key: key++, customData: { title: dose.strength + " mg per day", class: 'text-info text-small ml-2'} , dates: new Date(dose.date) } ;
            }) ;

            var key = 1 ;
            this.road.chart.dosageTable = this.road.chart.dosage.map(dose => {
                if (dose.freq > 0)
                    return { day: "day " + key++, date: this.$moment(dose.date).format("MM/DD/YYYY"),  dosage: dose.strength + " mg " + dose.freq + " times a day", 
                        total: (dose.freq * dose.strength) + " mg", total_tablets: ((dose.freq * dose.strength) / 5) } ;
                else 
                    return { day: "day " + key++, date: this.$moment(dose.date).format("MM/DD/YYYY"), dosage: dose.strength + " mg per day", 
                        total: dose.strength + " mg" , total_tablets: (dose.strength / 5)} ;
            }) ;


            console.log(this.road.chart) ;
        },
        mousemove(e) {
            var chart,
                point,
                i,
                event;

            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                // Find coordinates within the chart
                if (chart && chart.pointer) {
                    event = chart.pointer.normalize(e);
                    // Get the hovered point
                    point = chart.series[0].searchPoint(event, false);
                    if (point) {
                        point.highlight(e);
                    }
                }
            }
        },
        getMMEChart(start_time_long, end_time_long) {

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                name: 'Total MME',
                type: 'line',
                title: '',
                height: 450                
            }) ;

            chartOptions.xAxis.title = {
                "text": "Inpatient Time Period",
                margin: 15,
                style: {
                    'font-size': '1.2em',
                    'font-weight': 'bold'
                }
            }
            chartOptions.yAxis = [
                {
                    "title": {
                        "text": "Opioid Morphine Milliequivalemt (MME)",
                        "margin": 15,
                        "style": {
                            "font-size": "1.2em",
                            "font-weight": "bold"
                        }                
                    },
                    "min": 0
                },
                {
                    "title": {
                        "text": "Pain Score",
                        "margin": 15,
                        "style": {
                            "font-size": "1.2em",
                            "font-weight": "bold",
                            "color": "#00548f"
                        }                
                    },
                    "labels": {
                        "style": {
                            "font-weight": "bold",
                            "color": "#00548f"
                        }
                    },
                    "min": 0,
                    "max": 10,
                    "opposite": true
                }        
            ] ; 
        
            chartOptions.series[0] = {
                name : "Total MME",
                yAxis: 0,
                color: "#999999", // #820000",
                data: [],
                zIndex: 20,
                pointPlacement: -0.25,
                selected: true
            } ;
            chartOptions.series[1] = {
                name : "Pain Score",
                yAxis: 1,
                color: "#00548f",
                data: [],
                zIndex: 19,
                selected: true
            } ;

            chartOptions.plotOptions.line = {
                dataLabels: {
                    enabled: true,
                    formatter: function() { 
                        if (this.series.name == "Total MME")
                            return parseFloat(this.y.toFixed(2))  + " MME" ;
                        else
                            return this.y ;                        
                    }
                }
            } ;
            chartOptions.plotOptions.column = {
                stacking: 'normal',               
                dataLabels: {
                    enabled: true,
                    formatter: function() { return parseFloat(this.y.toFixed(2)) }
                }                
            } ;
            
            chartOptions.tooltip.useHTML = true ;
            
            chartOptions.tooltip.formatter = function () {
                var tip = "" ;
                if (this.series.name == "Pain Score") {
                    tip = this.point.series.name + ": " + this.point.y ;
                } else if (this.series.name == "Total MME") {
                    tip = "Total MME: " + this.point.y ;                    
                } else {
                    tip = this.point.series.name + " <br> MME: " + this.point.y ;                    
                }
                if (this.point.start)
                    tip += "<BR> Period: <span style='font-size:smaller'>" + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.start) + " to " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) + "</span>";
                else 
                    tip += "<BR> Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;
                
                if (this.point.meds) {
                    tip += "<br><br><table cellspacing=2 cellpadding=2 border=1>" ;
                    tip += "<tr><th>Medication</th><th>Dose</th><th>MME</th></tr>"; 
                    this.point.meds.forEach(function(med) {
                        tip += "<tr><td>" + med.name + "</td>" + 
                            "<td style='text-align:center'>" + med.dose + " " + med.unit + (med.dose_qty?" x" + med.dose_qty:"") + "</td>" + 
                            "<td style='text-align:center'>" + med.mme + "</td></tr>"; 
                    }) ; 
                    tip += "</table>" ;
                }
                return tip ;
            }

            return chartOptions ;

        },
        getMMEStackedChart(start_time_long, end_time_long) {

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                name: 'MME',
                type: 'column',
                title: '',
                height: 400,
                color: "green"
            }) ;

            chartOptions.chart.type = 'column' ;
            chartOptions.plotOptions = {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    }                    
                }
            } ;

            chartOptions.xAxis.title = {
                "text": "Inpatient Time Period",
                margin: 15,
                style: {
                    'font-size': '1.2em',
                    'font-weight': 'bold'
                }
            }
            chartOptions.yAxis[0].title = {
                "text": "Opioid Morphine Milliequivalent (MME)",
                margin: 15,
                style: {
                    'font-size': '1.2em',
                    'font-weight': 'bold'
                }
            } 
            
            chartOptions.yAxis[0].stackLabels = {
                enabled: true,
                formatter: function() {
                    if (this.total)
                        return parseFloat(this.total.toFixed(2)) ;
                    else
                        return 0 ;                 
                }
            }
            

            chartOptions.tooltip.formatter = function () {
                //var tip =  this.point.series.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit + " <br> MME: " + this.point.y ;                
                var tip =  this.point.series.name + " <br> MME: " + this.point.y ;                
                return tip ;
            }
            return chartOptions ;

        },                
        getMedsChart(start_time_long, end_time_long) {

            var _self = this ;

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                type: 'scatter', 
                height: 500
            }) ;

            chartOptions.tooltip.useHTML = true ;
            chartOptions.tooltip.formatter = function () {             
                var tip =  this.point.name ;
                if (this.point.mme && this.point.mme > 0)
                    tip += " <br>Total MME: " + this.point.mme ;
                tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;
                tip += "<br><br><table cellspacing=2 cellpadding=2>" ;
                tip += "<tr><th>Medication</th><th>Dose</th><th>MME</th></tr>"; 
                this.point.meds.forEach(function(med) {                 
                    tip += "<tr><td>" + med.name + "</td><td style='text-align:center'>" + med.dose + " " + med.unit + "</td><td style='text-align:center'>" + med.mme + "</td></tr>"; 
                }) ; 
                tip += "</table>" ;
                return tip ;
            }

            chartOptions.xAxis.title = {
                "text": "Inpatient Time Period",
                margin: 15,
                style: {
                    'font-size': '1.2em',
                    'font-weight': 'bold'
                }
            }
            chartOptions.yAxis[0].title = {
                "text": "Administrered Analgesics",
                margin: 15,
                style: {
                    'font-size': '1.2em',
                    'font-weight': 'bold'
                }
            } 
                        
            chartOptions.yAxis[0].labels = {
                formatter () {
                    return "<span style='color: " + _self.medColors[this.value] + "'>" + this.value + "</span>" ;
                }
            } ;          
            

            chartOptions.series[0].showInLegend = false ;

            return chartOptions ;

        },
        getDefaultChartConfig(chartData)
        {
            var chartOptions ;

            chartOptions =
                {
                    chart: {
                        //marginLeft: 100, // Keep all charts left aligned
                        spacingTop: 20,
                        //spacingBottom: 20,
                        //plotBorderWidth:1,
                        zoomType: 'x',
                        displayErrors: true,
                        height: chartData.height
                        //plotBackgroundColor: '#F7F7F7'
                    },
                    exporting: 
                    {         
                        libURL: "https://www.noidea.com",           
                        buttons: {
                            contextButton: {
                                menuItems: [
                                {
                                    text: 'Print Chart',
                                    onclick: function() {
                                        this.print();
                                    }
                                }]
                            }
                        }, 
                        error: function(opt, err) {
                            console.log("Error in chart export " + err) ;
                            console.log(err) ;
                            console.log(opt) ;
                        },
                        fallbackToExportServer: false
                    },                                                 
                    title: {
                        text: chartData.title,
                        align: 'center'
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: true
                    },
                    xAxis: {                            
                        crosshair: true,
                        events: {
                            setExtremes: syncExtremes
                        },
                        type: 'datetime',
                        min: chartData.start_time,
                        max: chartData.end_time
                    },
                    yAxis: [{
                        title: {
                            text: null
                        },
                        min: chartData.min,
                        max: chartData.max
                    }],
                    tooltip: {
                        shadow: false,
                        formatter: function () {

                            if (this.point.x2) {
                                // This is to handle the no stop date case.  If the diff is 5 years (set in backend), display '(none'
                                var diffInYears = (new Date(this.point.x2)).getYear() - (new Date(this.point.x)).getYear() ;
                                //console.log("diff in years :" + diffInYears + " for " + this.point.name)  ;
                                if (diffInYears == 5) {
                                    return Highcharts.dateFormat('%d %b', this.point.x) + "-(none) " +
                                        "<br>" + this.point.name.toLowerCase() ;
                                        //"<br>" + this.point.pcat.toLowerCase() ;
                                } else {
                                    return Highcharts.dateFormat('%d %b', this.point.x) + "-" + Highcharts.dateFormat('%d %b', this.point.x2) +
                                        "<br>" + this.point.name.toLowerCase() ;
                                        //"<br>" + this.point.pcat.toLowerCase() ;
                                }
                            } else if (this.point.name) {
                                return this.point.name ;
                            } else {
                                return this.point.y + ((this.point.unit)?" " + this.point.unit:"") ;
                            }
                        },
                        //style: {
                        //    fontSize: '12px'
                        //},
                        valueDecimals: 2
                    },
                    plotOptions: {
                        series: {
                            dataLabels : {
                                allowOverlap: true
                            },
                            minPointLength: 10   // for the same date, xrange at least will display these many pixels
                        }
                    },
                    series: [{
                        //data: (data.dataset?data.dataset:[]),
                        name: chartData.name,
                        type: chartData.type,
                        color: chartData.color,
                        fillOpacity: 0.3,
                        xDateormat: '%m/%d/%Y',                        
                        tooltip: {
                            //valueSuffix: ' ' + chartData.unit,
                            shared: true
                        }
                    }]
                };

            return chartOptions ;

        },
        getTimePeriods(stdt, enddt, duration) {
            console.log("In getYimePeriods stdt: " + stdt + " enddt: " + enddt + " Duration: " + duration) ;
            var end = this.$moment(enddt) ;
            var arr = [] ;
            var currdt = stdt ;
            while (!this.$moment(currdt).isAfter(end)) {
                var nextdt = this.$moment(currdt).add(duration, 'minutes').valueOf() ;
                arr.push({ start: currdt , end: nextdt - 1000 }) ;
                currdt = nextdt ;
            }
            console.log("time periods") ;
            console.log(arr.map(xx => { return { start: this.$moment(xx.start).format("MM/DD/YYYY HH:mm:ss"), end: this.$moment(xx.end).format("MM/DD/YYYY HH:mm:ss") }})) ;
            return arr ;
        },
        getTimeChunks(duration) {
            var prd = [] ;
            var maxMinutes = 60 * 24 ;
            var start = 0 ;

            while (true) {
                var next = start + duration ;
                if (next == maxMinutes) {
                    prd.push(next) ;
                    break ;
                } else if (next > maxMinutes) {
                    prd.push(maxMinutes) ;
                    break ;
                } else {
                    prd.push(next) ;
                    start = next ;
                }
            }
            console.log("Periods {}", prd) ;
            return prd ;
        },
        log(mesg) {
            this.statusMesg = this.$moment().format("HH:mm:ss") + ": " + mesg ;            
            this.resultText += "\n" + this.$moment().format("HH:mm:ss") + ": " + mesg ;
            console.log(mesg) ;
        }        
    },
    head() {
        return {
            title: "Opioid MME and Pain Score Visualization"
        };
    }
}
</script>

<style scoped>
    .chart-title {
        color: rgb(54,38, 115) ;
        font-size: 1.1em ;
    }
    .sealtooltip {
        padding-right: 5px;
        padding-left: 5px;
        color: red ;
    }
</style>

<style>
    .custom-calendar.vc-container {
        --day-border: 1px solid #b8c2cc;
        --day-border-highlight: 1px solid #b8c2cc;
        --day-width: 90px;
        --day-height: 90px;
        --weekday-bg: #f8fafc;
        --weekday-border: 1px solid #eaeaea;
        border-radius: 0;
        width: 100%
    }

    .custom-calendar.vc-container .vc-header {
        background-color: #f1f5f8;
        padding: 10px 0
    }

    .custom-calendar.vc-container .vc-weeks {
        padding: 0
    }

    .custom-calendar.vc-container .vc-weekday {
        background-color: var(--weekday-bg);
        border-bottom: var(--weekday-border);
        border-top: var(--weekday-border);
        padding: 5px 0
    }

    .custom-calendar.vc-container .vc-day {
        padding: 0 5px 3px;
        text-align: left;
        height: 60px;
        min-width: 60px;
        background-color: #fff
    }

    .custom-calendar.vc-container .vc-day.weekday-1,
    .custom-calendar.vc-container .vc-day.weekday-7 {
        background-color: #eff8ff
    }

    .custom-calendar.vc-container .vc-day:not(.on-bottom) {
        border-bottom: var(--day-border)
    }

    .custom-calendar.vc-container .vc-day:not(.on-bottom).weekday-1 {
        border-bottom: var(--day-border-highlight)
    }

    .custom-calendar.vc-container .vc-day:not(.on-right) {
        border-right: var(--day-border)
    }

    .custom-calendar.vc-container .vc-day-dots {
        margin-bottom: 5px
    }

    .c-day:not(.in-month) {
        opacity: 0;
        pointer-events: none
    }

    .av-highlight {
        width: 100%;
        height: 100%
    }
    .text-small {
        font-size: .9em;        
    }
</style>