<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="opioid_mme_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    Opioid MME and Pain Score Visualization is a data visualization app developed by SEAL. 
                <p>
                <p>
                    The app uses data from the patient medical record at Stanford Health Care to visualize the administered 
                    opioid and non-opioid analgesics with the patient’s pain score during post-surgical inpatient care. 
                    The app auto-calculates the morphine milliequivalent (MME). This is a tool physicians may use for inpatient opioid management.                     
                    
                    <br/><br/><b style="color:red">Disclaimer: </b>Please exercise clinical judgment and discretion. The SEAL team is working to include 
                    additional pain medications in future versions of this application. If a drug that has been prescribed for the patient and is missing 
                    from the data visualization, please inform the SEAL team by submitting feedback using the ellipses icon (top right corner). 
                    Morphine milliequivalent (MME) conversion factors were provided from Epic, with additional information derived from expert 
                    consultation from the Stanford Department of Anesthesiology. 
                    Click here more info about <b-link style="color:blue" @click='$bvModal.show("common-opioids-modal")'>common opioid MME conversion factors.</b-link>                                        
                </p>
            </b-col>
        </b-row> 
        <b-row class="ml-2">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg"  bg-variant="secondary">
                    <b-card-text>
                        <b-row>
                            <b-col cols="12" style="text-align:center">
                                <span class="h5">Inpatient Time Period</span>
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
        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title class="chart-title">Figure 1. Administered Analgesics ({{analgesicCategory}}) during date {{startDateFormatted}} and {{endDateFormatted}}</b-card-title>
                    <b-card-text>
                        <b-row class="mb-2">
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
                        <b-row>
                            <b-col cols="12">
                                <!-- :modules="['xrange']" -->
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
        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg" bg-variant="secondary">
                    <b-card-title class="chart-title text-center">Select Time Interval</b-card-title>                    
                    <b-card-text>
                        <b-row>
                            <b-col class="text-center pr-4 pl-4">
                                <p>
                                    This interval refers to the duration of the aggregate MME of opioids administered in the selected time interval. By selecting a specific interval, 
                                    this will dictate the X-axis for Figure 2 and Figure 3. Users may hover an MME data point in Figure 2 to view the MME opioid numerical distribution
                                    or refer to Figure 3 for an MME opioid visual distribution.
                                </p> 
                                <p>
                                    For example, when the “Aggregated MME by Time Interval” is set to "24 Hours", this means that MME data point reflected the total MME that 
                                    was administered to the patient in a 24-hour time period (12:00am –11:59pm).
                                </p>
                            </b-col>
                        </b-row>
                        <b-row class="mt-4">
                            <b-col class="text-center">
                                <span class="font-weight-bold">Aggregated MME by Time Interval:</span>                             
                                <b-select :options="[{value: 1440, text: '24 Hours'}, {value: 720, text: '12 Hours'}, {value: 480, text: '8 Hours'}, {value: 240, text: '4 Hours'}, {value: 60, text:'1 Hour'}]" 
                                    v-model="mmeDuration" 
                                    @change="refreshMMEChart"
                                    class="ml-2" style="width:20%"/>
                                <!--<b-button pill variant="primary" class="ml-3" @click="populateData">Run Report</b-button> -->
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title class="chart-title">Figure 2. Opioid MME Aggregated at {{mmeDuration / 60}} Hours and Pain Scores </b-card-title>
                    <b-card-text>
                        <b-row>
                            <b-col>
                                <highchart 
                                    :options="mmeChartOptions" 
                                    @mousemove="mousemove"
                                />
                            </b-col>
                        </b-row>   
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
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

        <b-modal id="common-opioids-modal" size="lg" centered scrollable hide-footer title="Common Opioid MME Conversion Factors">
            <b-row style="font-size:smaller">
                <b-col>
                    References:
                    <ol>
                        <li><a href="https://www.cdc.gov/opioids/providers/prescribing/guideline.html">https://www.cdc.gov/opioids/providers/prescribing/guideline.html</a></li>
                        <li><a href="https://medicaid.utah.gov/Documents/files/Opioid-Morphine-EQ-Conversion-Factors.pdf">https://medicaid.utah.gov/Documents/files/Opioid-Morphine-EQ-Conversion-Factors.pdf</a></li>
                        <li><a href="https://www.unmc.edu/NebraskaGWEP/wp-content/uploads/2020/01/052718_COM-IntMEd_Opioid-Pocket-Card_4x6.pdf">https://www.unmc.edu/NebraskaGWEP/wp-content/uploads/2020/01/052718_COM-IntMEd_Opioid-Pocket-Card_4x6.pdf</a></li>
                    </ol>
                </b-col>
            </b-row>                
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
            <b-row>
                
            </b-row>
        </b-modal>

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
/* import Calendar from 'v-calendar/lib/components/calendar.umd' */

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
    components: { EditableDatePicker },  /* ,Calender */
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
            }
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
        console.log("In Fetch method of a3 pain tab page") ;
        
        var response = await this.$services.antimicrobial.inpatientdate() ;            
        this.resultText += "\nInpatient date :" + JSON.stringify(response) ;
        if (response.inpatient_start_date) {
            this.road.hasSurgicalEncounter = await this.surgicalEncounter(response.inpatient_start_date) ;
            this.resultText += "\nHas Surgical Encounter :" + this.road.hasSurgicalEncounter ;            
            if (!this.road.hasSurgicalEncounter) return ;
            this.road.opioidNaivePatient = await this.opioidNaive(response.inpatient_start_date) ;
            this.resultText += "\nIs Opioid Naive Patient :" + this.road.opioidNaivePatient ;            
        }        
    },
    mounted () {
        console.log("In mounted method of the a3 pain tab page") ;    
        
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

    },
    watch: {
        'road.distributionStartDate': function (newVal, oldVal) { 
            if (oldVal == "") return ;
            this.testRoadChart() ;
        }
    },
    methods : { 
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
                    
                    this.resultText += "\n MedStat Processing Med :" + med.name + " oids :" + med.med_order_ids ;

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
                this.resultText += "\n---- PCA MAR Data Request --------------" ;
                var pca_mars = await this.$services.a3pain.pca_mars(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date) ;                
                this.resultText += JSON.stringify(pca_mars) ;

                this.resultText += "\n---- MAR Data Webservice Request--------------" ;
                //this.resultText += JSON.stringify(wsjson) ;

                this.$services.a3pain.mardata(wsjson).then(responses => {

                    console.log("responses length " + responses.length) ;
                    
                    this.resultText += "\n----MARDATA webservice response START " + responses.length ;
                    
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
                            var ma = {} ; 
                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                ma = order.MedicationAdministrations[mIdx] ;
                                if (new Date(ma.AdministrationInstant).getTime() < rpt_start_date_long || new Date(ma.AdministrationInstant).getTime() > rpt_end_date_long) {
                                    console.log("Skipping mar " + JSON.stringify(ma) + " cause admin time is not within reporting period") ;
                                    continue ;
                                }
                                if (ma.Action != "Not Given" && ma.Action != 'Canceled Entry') {
                                    if (!ma.Dose["Value"] || ma.Dose.Value == "null") continue ;
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
                                        
                                        categories.push({ name: genericName , pointWidth: 30, data: [], isOpioid: isOpioid, isOral: isOral, color: medColor} ) ;
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
                                        cdata[cdataIdx].meds.push({name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme, order_id: order.OrderID.ID })
                                    } else {
                                        cdata.push({ x: marTime, y: catIdx, mme: ma.mme, color: medColor, name: genericName, 
                                            meds: [ {name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme, order_id: order.OrderID.ID} ] } ) ;
                                    }
                                }
                            }
                            } catch (err) {
                                this.resultText += "\nError in MME aggregation :" + err ;
                                this.resultText += "\n" + JSON.stringify(ma);
                            }                            
                        }) ; 
                    }) ;
                    
                    if (pca_mars) {
                        pca_mars.forEach(med => {
                            try {
                            var genericName = med.generic_name ;
                            var medColor = "" ;
                            this.resultText += "\n Processing PCA :" + med.name + "  Generic Name: " + genericName ;

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
                                
                                categories.push({ name: genericName , pointWidth: 30, data: [], isOpioid: true, isOral: false, color: medColor} ) ;
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
                                    cdata[cdataIdx].meds.push({name: med.name, dose: point.dosage, unit: med.unit, mme: point.mme })
                                } else {
                                    cdata.push({ x: marTime, y: catIdx, mme: point.mme, color: medColor, name: genericName, 
                                        meds: [ {name: med.name, dose: point.dosage, unit: med.unit, mme: point.mme } ] } ) ;
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

                    this.resultText += "\nBefore calling refreshMarChart method...." ;
                    this.refreshMarChart() ;
                    this.resultText += "\nBefore calling refreshMMEChart method...." ;
                    this.refreshMMEChart() ;
                    
                    this.resultText += "\nBefore calling generateROADChart method..." ;
                    
                    this.generateRoadChart() ;
                    
                    this.resultText += "\nDone creating road chart" ;
                    this.resultText += "\n Done...calling pain services now" ;

                    } catch (err) {
                        this.resultText += "\nError in no idea 1 :" + err ;                        
                    }

                    this.tlog(" Before Invoking pain data in BQ") ;
                    // getting pain data
                    this.$services.a3pain.pain(_self.launchModal.rpt_start_date, _self.launchModal.rpt_end_date, _self.patient.epicPatientId)
                        .then(response => {
                            try {
                            console.log("response from pain call") ;
                            console.log(response) ;
                            
                            //this.tlog(" Result from Pain BQ Call " + JSON.stringify(response) ;        
                            var cdata = response.map(function(pn) { return { x: pn.recorded_time, y: pn.meas_value }}) ;
                            // sort mdata
                            cdata.sort(function (a, b) {
                                return a.x - b.x ;
                            }) ;
                            
                            this.painData = cdata ;
                            
                            this.resultText += "\n Before settinng the paindata for mmechartoptions" ;
                            this.mmeChartOptions.series[1].data = cdata ;
                            
                            } catch (err) {
                                this.resultText += "\nError in pain handler code :" + err ;                                    
                            }
                        }) ; 
                    
                    this.launchModal.loading = false ;
                    this.$bvModal.hide("launch-modal") ;

                }) ;

            } catch (err) {
                this.resultText += "\nError in JS Call : " + err ;
            }

        },
        refreshMarChart() {
            try {
                var rpt_start_date_long = this.launchModal.rpt_start_date_long ;
                var rpt_end_date_long = this.launchModal.rpt_end_date_long ;
                console.log("in refreshmarchart report end date long :" + rpt_end_date_long) ;

                var _self = this ;

                this.resultText += "\n in refreshMarChart START " ;

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
                
                this.resultText += "\nBefore Cat count :" + categories.length  + " marData count :" + this.marData.length ;

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

                this.resultText += "\n in refreshMarChart: filters & sorting completed " ;
                this.resultText += "\nAfter Cat count :" + categories.length  + " cdata count :" + cdata.length ;

                //var medChartOptions = this.medChartOptions ;
                // No idea why - but if we use the this.medChartOptions, the chart does not render
                var medChartOptions = {} ;
                
                medChartOptions = this.getMedsChart(rpt_start_date_long, rpt_end_date_long) ;

                medChartOptions.yAxis[0].categories = categories.map(function(cat) { return cat.name }) ;
                medChartOptions.series[0].data = cdata ;

                this.$set(this, 'medChartOptions', medChartOptions) ;

                this.resultText += "\n in refreshMarChart: medchartoptions updated " ;

                this.resultText += "\n MEDCHARTOPTIONS " + JSON.stringify(_self.medChartOptions) ;            
            
            } catch (err) {
                console.log("Error {}", err) ;
                this.resultText += "\n Error in refreshMarChart " + err ;
            }


        },
        refreshMMEChart() {

            var _self = this ;
            var rpt_start_date_long = this.launchModal.rpt_start_date_long ;
            var rpt_end_date_long = this.launchModal.rpt_end_date_long ;

            this.resultText += "\n in refreshMMEChart START " ;
            
            try {
                var prdList = this.getTimeChunks(this.mmeDuration) ;
                var mdata1 = {} ;
                var catIdx = -1 ;

                var categories = this.medCategories.map(function(cat) { 
                    return {name: cat.name, data: [], isOpioid: cat.isOpioid, color: cat.medColor, pointWidth: 30 }} 
                ) ;
                
                this.resultText += "\n In refreshMMEChart: Categories.... " + JSON.stringify(categories) ;

                this.marData.forEach(function (marPoint) {
                    catIdx = categories.findIndex(function(cat) { return cat.name == marPoint.name }) ;
                    if (marPoint.mme && marPoint.mme > 0) {
                        var dt = new Date(marPoint.x) ;  
                        var pIdx = prdList.findIndex(function(prd) { return ( (dt.getHours() * 60 + dt.getMinutes()) <= prd ) }) ;                        
                        dt.setHours(Math.floor(prdList[pIdx] / 60), prdList[pIdx] % 60, 0, 0) ;
                        if (mdata1[dt]) {
                            mdata1[dt].mme = mdata1[dt].mme + marPoint.mme ;
                            var idx = mdata1[dt].meds.findIndex(function(point) { return point.name == marPoint.name }) ;
                            if (idx >= 0) {
                                mdata1[dt].meds[idx].mme = mdata1[dt].meds[idx].mme + marPoint.mme ;
                            } else {
                                mdata1[dt].meds.push({name: marPoint.name, mme: marPoint.mme}) ;
                            }
                        } else {
                            mdata1[dt] = { mme: marPoint.mme, meds: [ { name: marPoint.name, mme: marPoint.mme } ] }  ;
                        }
                        var dtlong = new Date(dt).getTime() ;
                        var dtIdx = categories[catIdx].data.findIndex(function(row) { return (row.x == dtlong) }) ;
                        if (dtIdx > -1) {
                            categories[catIdx].data[dtIdx].y = categories[catIdx].data[dtIdx].y + marPoint.mme ;
                        } else {
                            categories[catIdx].data.push({ x: dtlong, y: marPoint.mme, name: marPoint.name}) ;
                        } 
                    }                
                }) ;
                var mdata = [] ;
                Object.keys(mdata1).forEach(function(dt) {
                    mdata.push({ x: new Date(dt).getTime(), y: mdata1[dt].mme, meds: mdata1[dt].meds}) ;
                    //mdata.push({ x: new Date(dt).getTime(), y: mdata1[dt] }) ;
                }) ;

                // sort mdata
                mdata.sort(function (a, b) {
                    return a.x - b.x ;
                }) ;
                
                //var mmeChartOptions = {} ;
                var mmeChartOptions = this.getMMEChart(rpt_start_date_long, rpt_end_date_long) ;
                
                ///var mmeChartOptions = _self.mmeChartOptions ;                
                mmeChartOptions.series[0].data = mdata ;
                
                if (this.painData && this.painData.length > 0) {
                    this.resultText += "\n Setting the pain data inside refreshMME chart" ;
                    mmeChartOptions.series[1].data = this.painData ;
                }

                this.mmeChartOptions = mmeChartOptions ;

                //var mmeStackedChartOptions = this.getMMEStackedChart(rpt_start_date_long, rpt_end_date_long)
                var oCategories = categories.filter(function(c) { return c.isOpioid ; }) ;
                oCategories.forEach(cat => {
                    cat.data.sort(function(a, b) { return b.x - a.x }) ;
                }) ;

                var mmeStackedChartOptions = this.getMMEStackedChart(rpt_start_date_long, rpt_end_date_long) ;
                
                mmeStackedChartOptions.xAxis.tickInterval = (this.mmeDuration * 60 * 1000) ;
                
                mmeStackedChartOptions.series = oCategories ;
                
                this.mmeStackedChartOptions = mmeStackedChartOptions ;
                               
                window.setTimeout(function() {
                    _self.resultText += "\n" + "** In the timeout method to refresh the chart options" ;
                    try {
                    _self.$refs.stackedChart.chart.xAxis[0].setExtremes(rpt_start_date_long - 1000, rpt_end_date_long - 1000) ;
                    _self.$refs.stackedChart.chart.xAxis[0].setExtremes(rpt_start_date_long, rpt_end_date_long)
                    } catch (err) { _self.resultText += "\n Error in timeout stuff :" +  err ; } 
                }, 3000 ) ;

                this.resultText += "\n --------------------******MME CHARTOPTIONS data in REFRESH MME CHART***************************" ;
                this.resultText += "\n " + JSON.stringify(_self.mmeStackedChartOptions) ;

            } catch (err) {
                this.resultText += "\n ******Error in refreshMMEChart :" + err ;
                //this.tlog("------******Error in refreshMMEChart :" + err) ;                
            }
        },
        merge(string1, string2) {
            return this.$services.medreview.unique_merge(string1, string2) ;
        },        
        async generateRoadChart() {
            this.tlog("Generate Road for :" + this.road.discharge_date + " " + this.road.discharge_time) ;
            try {
                var disch_datetime = this.$moment(this.road.discharge_date + " " + this.road.discharge_time).valueOf() ;
                var dischargeDateLong = this.$moment(disch_datetime).startOf('day').valueOf() ;
                var dischargeDate24HrEarlierLong = this.$moment(dischargeDateLong).add(-1, 'days').valueOf() ;
                if (dischargeDateLong >= this.launchModal.rpt_start_date_long && dischargeDateLong <= this.launchModal.rpt_end_date_long
                    && dischargeDate24HrEarlierLong >= this.launchModal.rpt_start_date_long && dischargeDate24HrEarlierLong <= this.launchModal.rpt_end_date_long)
                    this.road.totalMME = await this.$services.a3pain.getTotalMMEForLast24Hours(disch_datetime, this.marData, this.patient.epicPatientId, this.tlog) ;
                else
                    this.road.totalMME = await this.$services.a3pain.getTotalMMEForLast24Hours(disch_datetime, null, this.patient.epicPatientId, this.tlog) ;
                
                this.tlog("In generateroadchart totalMME is: " + this.road.totalMME) ;
                
                this.road.chart.dosage = this.$services.a3pain.roadChart(this.road.totalMME, this.road.distributionStartDate).dosage ;

                if (this.road.chart.dosage.length == 0)
                {
                    this.tlog("No Dosage has bee computed.. returning") ;
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

                this.tlog("Road Chart Options") ;
                this.tlog(this.road.chart) ;
            } catch (err) {
                this.tlog("Error in generateRoadChart Method :" + err) ;
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
                name: 'MME',
                type: 'line',
                title: '',
                height: 400                
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
                        "text": "Pain Scores",
                        "margin": 15,
                        "style": {
                            "font-size": "1.2em",
                            "font-weight": "bold"
                        }                
                    },
                    "min": 0,
                    "max": 10,
                    "opposite": true
                }        
            ] ; 
        
            chartOptions.series[0] = {
                name : "MME",
                yAxis: 0,
                color: "#820000",
                data: []
            } ;
            chartOptions.series[1] = {
                name : "Pain Score",
                yAxis: 1,
                color: "#00548f",
                data: []
            } ;

            chartOptions.plotOptions.line = {
                dataLabels: {
                    enabled: true
                }
            } ;

            chartOptions.tooltip.useHTML = true ;
            chartOptions.tooltip.formatter = function () {                
                var tip =  this.point.series.name + ": " + this.point.y  ;
                tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;

                if (this.point.meds) {
                    tip += "<br><br><table cellspacing=2 cellpadding=2>" ;
                    tip += "<tr><th>Medication</th><th>MME</th></tr>"; 
                    this.point.meds.forEach(function(med) {
                        tip += "<tr><td>" + med.name + "</td><td style='text-align:center'>" + med.mme + "</td></tr>"; 
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
                height: 400
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
        tlog(mesg) {
            console.log(mesg) ;
            this.resultText += "\n" + mesg ;
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