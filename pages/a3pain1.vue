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

                    <br/><br/><b>Warning: </b>The MME values seen here may not exactly reflect similar calculations seen within the patient’s primary documentation. 
                    Please exercise clinical judgment and discretion.
                </p>
            </b-col>
        </b-row> 
        <b-row class="ml-2">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg">
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
                                <b-button variant="primary" pill @click="$bvModal.show('launch-modal')">Modify Report</b-button>
                            </b-col>                    
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3 ml-2">
            <b-col cols="11">                
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title class="chart-title">Figure 1. Administered Analgesics {{analgesicCategory}} during date {{startDateFormatted}} and {{endDateFormatted}}</b-card-title>
                    <b-card-text>
                        <b-row>
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
                            <b-col>
                                <highchart 
                                    :options="medChartOptions" 
                                    :modules="['xrange']" 
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
                    <b-card-title class="chart-title">Figure 2. Opioid MME Aggregated at  and Pain Scores </b-card-title>                    
                    <b-card-text>
                        <b-row>
                            <b-col cols="12">
                                <!--<b-form-group label="Aggregate MME by " v-slot="{ ariaDescribedby }" class="text-right mr-10">-->
                                    <b-form-radio-group
                                        id="radio-group-1"
                                        v-model="mmeDuration"
                                        :options="[{value: 1440, text: 'Daily'}, {value: 240, text: '4 Hours'}, {value: 120, text: '2 Hours'}, {value: 60, text:'Hourly'}]"                                        
                                        name="radio-options"
                                        @change="refreshMMEChart"
                                        class="text-right mr-5"
                                    ></b-form-radio-group>
                                <!--</b-form-group>-->
                            </b-col>
                        </b-row>
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
                    <b-card-title class="chart-title">Figure 3. Opioid Distribution Aggregated at  </b-card-title>                    
                    <b-card-text>
                        <highchart 
                            :options="mmeStackedChartOptions" 
                            @mousemove="mousemove"
                        />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>        
        <!--
        <b-row class="mt-3">
            <b-col cols="11" offset="1">                
                <b-card color="green">
                    <b-card-title>Pain Score</b-card-title>
                    <b-card-text>
                        <highchart :options="getPainChart()" :update="['options.series']" 
                        @mousemove="mousemove"/>                        
                    </b-card-text>
                </b-card>
            </b-col>            
        </b-row>                
        -->
        <b-row class="mt-3 ml-2">
            <b-col cols="11">
                <b-card color="green">
                    <b-card-title>Debug Info</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="resultText" rows="10" auto-grow />
                    </b-card-text>
                </b-card>
            </b-col>                        
        </b-row>
        
        <b-modal id="launch-modal" button-size="sm" size="sm" centered hide-footer title="Inpatient Time Period" title-class="mx-auto">
            <b-row>
                <b-col class="text-right" cols="4">
                    <label for="startDate">Start Date</label>
                </b-col>                
                <b-col>
                    <b-form-datepicker                                                
                        id="startDate"
                        v-model="launchModal.start_date"                        
                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                        locale="en"
                        size="sm"                        
                    ></b-form-datepicker>                                                
                </b-col>
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">
                    <label for="endDate">End Date</label>
                </b-col>
                <b-col>
                    <b-form-datepicker                                                
                        id="endDate"
                        v-model="launchModal.end_date"                        
                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                        locale="en"
                        size="sm"                        
                    ></b-form-datepicker>                                                
                </b-col>
            </b-row>  
            <b-row>
                <b-col cols="12"  class="text-center">
                    <b-button pill variant="primary" class="ml-3 mt-3" @click="populateData">Run Report</b-button>  
                </b-col>
            </b-row> 
        </b-modal>
    </b-container>
</template>

<script>

/* eslint-disable */

import Highcharts, { chart } from 'highcharts' ;

    var colorIdx = 2 ;

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
                if (chart !== thisChart) {
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

export default {
    data () {
        return {
            resultText: "",
            medChartOptions: {},
            mmeChartOptions: {},
            mmeStackedChartOptions: {},
            medCategories: [],
            marData: [],
            patient: {},
            mmeDuration: 1440,
            launchModal : {              
                start_date: '',
                end_date: ''
            },
            analgesicCategory: 'All',
            routeOfAdmin: 'All'            
        }
    },
    computed : {
        startDateFormatted () {
            return this.$moment(this.launchModal.start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        endDateFormatted() {
            return this.$moment(this.launchModal.end_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        }
    },
    async fetch() {
        /*
        console.log("In fetch method of the a3 pain tab page") ;
        this.resultText += "\n___________________________In Fetch method before getting patient data\n" ; 
        this.patient = await this.$services.a3pain.patient() ;       
        this.resultText += "\n___________________________Fetch Patient data \n" + JSON.stringify(this.patient) ;
        console.log("patient data ") ;
        console.log(this.patient) ;
        */
    },
    mounted () {
        console.log("In mounted method of the a3 pain tab page") ;        
        this.$store.commit('setAppId', this.$services.a3pain.APP_ID) ;
        this.$services.a3pain.dblog("A3PainHome", "In A3 Pain Tab Home Page") ;
        this.$store.commit('setPageTitle', "Opioid MME and Pain Score Visualization") ;

        this.$bvModal.show("launch-modal") ;

        var dt = new Date() ;
        //this.report_date = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear() ;        
        
        this.medChartOptions = this.getMedsChart() ;
        this.mmeChartOptions = this.getMMEChart2() ;

        this.medChartOptions = this.getLocalMedChartOptions() ;
        this.medCategories = this.getLocalMedCategories() ;
        this.marData = this.getLocalMarData() ;
        
        this.mmeChartOptions = {
    "chart": {
        "spacingTop": 20,
        "zoomType": "x",
        "displayErrors": true,
        "height": 350
    },
    "title": {
        "align": "center",
        "text": ""
    },
    "credits": {
        "enabled": false
    },
    "legend": {
        "enabled": true
    },
    "xAxis": {
        "crosshair": true,
        "events": {},
        "type": "datetime",
        "min": 1620457200000,
        "max": 1621666800000,
        "title": {
            "text": "Inpatient Time Period",
            "margin": 15,
            "style": {
                "font-size": "1.2em",
                "font-weight": "bold"
            }
        }
    },
    "yAxis": [
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
            "opposite": true
        }        
    ],
    "tooltip": {
        "shadow": false,
        "valueDecimals": 2
    },
    "plotOptions": {
        "series": {
            "dataLabels": {
                "allowOverlap": true
            },
            "minPointLength": 10
        },
        "line": {
            "dataLabels": {
                "enabled": true
            }
        }
    },
    "series": [
        {
            "name": "MME",
            "yAxis": 0,
            "data": [
                {
                    "x": 1620543600000,
                    "y": 22.5
                },
                {
                    "x": 1620630000000,
                    "y": 22.5
                },
                {
                    "x": 1620716400000,
                    "y": 37.5
                },
                {
                    "x": 1620802800000,
                    "y": 30
                },
                {
                    "x": 1620889200000,
                    "y": 45
                },
                {
                    "x": 1620975600000,
                    "y": 45
                },
                {
                    "x": 1621062000000,
                    "y": 45
                },
                {
                    "x": 1621148400000,
                    "y": 45
                },
                {
                    "x": 1621234800000,
                    "y": 45
                },
                {
                    "x": 1621321200000,
                    "y": 30
                }
            ]
        },
        {
            "name": "Pain Score",
            "yAxis": 1,
            "color": "purple",
            "data": [
                {
                    "x": 1621641780000,
                    "y": 8
                },
                {
                    "x": 1621622040000,
                    "y": 5
                },
                {
                    "x": 1621618440000,
                    "y": 7
                },
                {
                    "x": 1621605360000,
                    "y": 4
                },
                {
                    "x": 1621595220000,
                    "y": 5
                },
                {
                    "x": 1621577100000,
                    "y": 5
                },
                {
                    "x": 1621573500000,
                    "y": 5
                },
                {
                    "x": 1621555980000,
                    "y": 6
                },
                {
                    "x": 1621552200000,
                    "y": 8
                },
                {
                    "x": 1621547580000,
                    "y": 6
                },
                {
                    "x": 1621533420000,
                    "y": 6
                },
                {
                    "x": 1621530300000,
                    "y": 7
                },
                {
                    "x": 1621521840000,
                    "y": 3
                },
                {
                    "x": 1621507620000,
                    "y": 8
                },
                {
                    "x": 1621486680000,
                    "y": 5
                },
                {
                    "x": 1621477800000,
                    "y": 5
                },
                {
                    "x": 1621468680000,
                    "y": 5
                },
                {
                    "x": 1621465080000,
                    "y": 8
                },
                {
                    "x": 1621451460000,
                    "y": 3
                },
                {
                    "x": 1621446420000,
                    "y": 5
                },
                {
                    "x": 1621442820000,
                    "y": 8
                },
                {
                    "x": 1621432980000,
                    "y": 0
                },
                {
                    "x": 1621426740000,
                    "y": 0
                },
                {
                    "x": 1621423140000,
                    "y": 7
                },
                {
                    "x": 1621401120000,
                    "y": 5
                },
                {
                    "x": 1621397520000,
                    "y": 8
                },
                {
                    "x": 1621382220000,
                    "y": 2
                },
                {
                    "x": 1621378620000,
                    "y": 5
                },
                {
                    "x": 1621365120000,
                    "y": 3
                },
                {
                    "x": 1621360200000,
                    "y": 0
                },
                {
                    "x": 1621356600000,
                    "y": 8
                },
                {
                    "x": 1621346820000,
                    "y": 0
                },
                {
                    "x": 1621340640000,
                    "y": 0
                },
                {
                    "x": 1621334340000,
                    "y": 8
                },
                {
                    "x": 1621333800000,
                    "y": 9
                },
                {
                    "x": 1621323480000,
                    "y": 0
                },
                {
                    "x": 1621317240000,
                    "y": 6
                },
                {
                    "x": 1621313640000,
                    "y": 8
                },
                {
                    "x": 1621307280000,
                    "y": 6
                },
                {
                    "x": 1621298520000,
                    "y": 2
                },
                {
                    "x": 1621294920000,
                    "y": 4
                },
                {
                    "x": 1621290600000,
                    "y": 6
                },
                {
                    "x": 1621290120000,
                    "y": 6
                },
                {
                    "x": 1621272900000,
                    "y": 4
                },
                {
                    "x": 1621269300000,
                    "y": 6
                },
                {
                    "x": 1621257780000,
                    "y": 0
                },
                {
                    "x": 1621254060000,
                    "y": 4
                },
                {
                    "x": 1621248540000,
                    "y": 2
                },
                {
                    "x": 1621242600000,
                    "y": 0
                },
                {
                    "x": 1621238220000,
                    "y": 6
                },
                {
                    "x": 1621229100000,
                    "y": 0
                },
                {
                    "x": 1621225500000,
                    "y": 7
                },
                {
                    "x": 1621218660000,
                    "y": 1
                },
                {
                    "x": 1621213680000,
                    "y": 6
                },
                {
                    "x": 1621211220000,
                    "y": 9
                },
                {
                    "x": 1621205880000,
                    "y": 5
                },
                {
                    "x": 1621195200000,
                    "y": 8
                },
                {
                    "x": 1621183500000,
                    "y": 4
                },
                {
                    "x": 1621179960000,
                    "y": 8
                },
                {
                    "x": 1621168140000,
                    "y": 0
                },
                {
                    "x": 1621162200000,
                    "y": 6
                },
                {
                    "x": 1621153440000,
                    "y": 0
                },
                {
                    "x": 1621149660000,
                    "y": 7
                },
                {
                    "x": 1621141500000,
                    "y": 9
                },
                {
                    "x": 1621137900000,
                    "y": 8
                },
                {
                    "x": 1621134240000,
                    "y": 9
                },
                {
                    "x": 1621123200000,
                    "y": 6
                },
                {
                    "x": 1621119720000,
                    "y": 7
                },
                {
                    "x": 1621108200000,
                    "y": 3
                },
                {
                    "x": 1621104600000,
                    "y": 8
                },
                {
                    "x": 1621092960000,
                    "y": 4
                },
                {
                    "x": 1621089360000,
                    "y": 8
                },
                {
                    "x": 1621078140000,
                    "y": 4
                },
                {
                    "x": 1621074120000,
                    "y": 8
                },
                {
                    "x": 1621061280000,
                    "y": 0
                },
                {
                    "x": 1621057560000,
                    "y": 10
                },
                {
                    "x": 1621048860000,
                    "y": 2
                },
                {
                    "x": 1621039440000,
                    "y": 2
                },
                {
                    "x": 1621035840000,
                    "y": 8
                },
                {
                    "x": 1621025340000,
                    "y": 1
                },
                {
                    "x": 1621021740000,
                    "y": 9
                },
                {
                    "x": 1621009320000,
                    "y": 2
                },
                {
                    "x": 1621005720000,
                    "y": 8
                },
                {
                    "x": 1620990840000,
                    "y": 7
                },
                {
                    "x": 1620990660000,
                    "y": 7
                },
                {
                    "x": 1620976080000,
                    "y": 7
                },
                {
                    "x": 1620972000000,
                    "y": 8
                },
                {
                    "x": 1620965160000,
                    "y": 4
                },
                {
                    "x": 1620961560000,
                    "y": 9
                },
                {
                    "x": 1620949500000,
                    "y": 9
                },
                {
                    "x": 1620945960000,
                    "y": 6
                },
                {
                    "x": 1620916140000,
                    "y": 8
                },
                {
                    "x": 1620915960000,
                    "y": 5
                },
                {
                    "x": 1620907140000,
                    "y": 1
                },
                {
                    "x": 1620904380000,
                    "y": 1
                },
                {
                    "x": 1620900780000,
                    "y": 8
                },
                {
                    "x": 1620889800000,
                    "y": 0
                },
                {
                    "x": 1620886140000,
                    "y": 8
                },
                {
                    "x": 1620884580000,
                    "y": 7
                },
                {
                    "x": 1620876420000,
                    "y": 6
                },
                {
                    "x": 1620874920000,
                    "y": 2
                },
                {
                    "x": 1620871200000,
                    "y": 7
                },
                {
                    "x": 1620856860000,
                    "y": 9
                },
                {
                    "x": 1620856620000,
                    "y": 8
                },
                {
                    "x": 1620844260000,
                    "y": 5
                },
                {
                    "x": 1620841860000,
                    "y": 8
                },
                {
                    "x": 1620832380000,
                    "y": 2
                },
                {
                    "x": 1620830340000,
                    "y": 3
                },
                {
                    "x": 1620826620000,
                    "y": 5
                },
                {
                    "x": 1620812460000,
                    "y": 8
                },
                {
                    "x": 1620800940000,
                    "y": 0
                },
                {
                    "x": 1620796800000,
                    "y": 8
                },
                {
                    "x": 1620788640000,
                    "y": 3
                },
                {
                    "x": 1620784080000,
                    "y": 2
                },
                {
                    "x": 1620783900000,
                    "y": 2
                },
                {
                    "x": 1620780300000,
                    "y": 9
                },
                {
                    "x": 1620762240000,
                    "y": 3
                },
                {
                    "x": 1620758700000,
                    "y": 7
                },
                {
                    "x": 1620744120000,
                    "y": 3
                },
                {
                    "x": 1620741540000,
                    "y": 0
                },
                {
                    "x": 1620737940000,
                    "y": 10
                },
                {
                    "x": 1620716940000,
                    "y": 9
                },
                {
                    "x": 1620716280000,
                    "y": 9
                },
                {
                    "x": 1620701820000,
                    "y": 5
                },
                {
                    "x": 1620700380000,
                    "y": 4
                },
                {
                    "x": 1620696780000,
                    "y": 9
                },
                {
                    "x": 1620678600000,
                    "y": 0
                },
                {
                    "x": 1620674400000,
                    "y": 7
                },
                {
                    "x": 1620657900000,
                    "y": 6
                },
                {
                    "x": 1620654300000,
                    "y": 8
                },
                {
                    "x": 1620635580000,
                    "y": 4
                },
                {
                    "x": 1620631980000,
                    "y": 7
                },
                {
                    "x": 1620620340000,
                    "y": 0
                },
                {
                    "x": 1620610500000,
                    "y": 8
                },
                {
                    "x": 1620610200000,
                    "y": 9
                },
                {
                    "x": 1620602460000,
                    "y": 0
                },
                {
                    "x": 1620584580000,
                    "y": 0
                },
                {
                    "x": 1620576660000,
                    "y": 5
                },
                {
                    "x": 1620575640000,
                    "y": 8
                },
                {
                    "x": 1620571080000,
                    "y": 0
                },
                {
                    "x": 1620558300000,
                    "y": 0
                },
                {
                    "x": 1620553080000,
                    "y": 0
                },
                {
                    "x": 1620549480000,
                    "y": 7
                },
                {
                    "x": 1620532920000,
                    "y": 8
                },
                {
                    "x": 1620531780000,
                    "y": 9
                },
                {
                    "x": 1620512460000,
                    "y": 6
                },
                {
                    "x": 1620512100000,
                    "y": 7
                },
                {
                    "x": 1620510420000,
                    "y": 9
                },
                {
                    "x": 1620501660000,
                    "y": 9
                },
                {
                    "x": 1620489300000,
                    "y": 7
                },
                {
                    "x": 1620488340000,
                    "y": 9
                },
                {
                    "x": 1620483240000,
                    "y": 9
                },
                {
                    "x": 1620478500000,
                    "y": 0
                },
                {
                    "x": 1620464880000,
                    "y": 0
                },
                {
                    "x": 1620461220000,
                    "y": 10
                },
                {
                    "x": 1620460920000,
                    "y": 8
                }
            ]
        }
    ]
} ;



        this.mmeStackedChartOptions = this.getMMEStackedChart() ;

        this.mmeStackedChartOptions = this.getLocalMMEStackedChartOptions() ;

    },
    methods : {
        async populateData() {
            try {
            var _self = this ;

            this.$bvModal.hide("launch-modal") ;    

            this.resultText += "\n___________________________Pop data: before Patient data" ;

            this.patient = await this.$services.a3pain.patient() ;      
            this.resultText += "\n___________________________Pop data: Patient data \n" + JSON.stringify(this.patient) ;

            //var encounters = await this.$services.a3pain.encounters(this.report_date, this.number_of_weeks_ahead, this.number_of_weeks_back) ;            
            var encounters = await this.$services.a3pain.encounters(this.launchModal.start_date, this.launchModal.end_date) ;
            console.log("encounters....{} ", encounters) ;
            
            //var medstats = await this.$services.a3pain.medstats(this.report_date, this.number_of_weeks_ahead, this.number_of_weeks_back) ;
            var medstats = await this.$services.a3pain.medstats(this.launchModal.start_date, this.launchModal.end_date) ;
            console.log("medstats....{}", medstats) ;

            var wsjson = {} ;
            var csnids = [] ;

            this.resultText += "\n___________________________Patient EPIC client id \n" + this.patient.epicPatientId ;

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

            var mmedata = await this.$services.a3pain.mmedata() ;
            console.log(mmedata) ;
            //this.resultText += "\n--------------------******mme data***************************" ;
            //this.resultText += JSON.stringify(mmedata) ;
            } catch (err) {
                console.log("no idea what this error is...{} " , err) ;
                this.resultText += "\n---------------------------------------\n" + "Error in JS Call 1 \n" + err ;
            }
            try {

                this.$services.a3pain.mardata(wsjson).then(responses => {

                    console.log("responses length " + responses.length) ;
                    
                    this.resultText += "\n------------------------------------MARDATA webservice response START " + responses.length + "\n" ;

                    var categories = [] ;
                    var cdata = [] ;
                    var catIdx = -1 ;                        
                    var mdata1 = {} ;

                    var prdList = this.getTimeChunks(this.mmeDuration) ;
                    
                    responses.forEach(response => {
                        response.data.Orders.forEach(order => {                                                        
                            this.resultText += "\n----------------------------------Processing Order :" + order.Name ;
                            try {
                            
                            var cIdx = medstats.cats.findIndex(function (cat) { return (cat.med_order_ids.indexOf(order.OrderID.ID) >= 0) }) ;
                            var mmeFactor = 0 ;
                            var isOpioid = false ;
                            var isOral = false ;

                            if (cIdx >= 0) {
                                this.resultText += " med order name :" + medstats.cats[cIdx].name ;
                                
                                if (medstats.cats[cIdx].pharma_class)
                                    isOpioid = (medstats.cats[cIdx].pharma_class.toLowerCase().indexOf("opioid") >= 0) ;
                                if (medstats.cats[cIdx].routes)
                                    isOral = (medstats.cats[cIdx].routes.toLowerCase().indexOf("oral") >= 0) ;

                                var mIdx = mmedata.findIndex(function (mme) { return (mme.med_name.toLowerCase() == medstats.cats[cIdx].name.toLowerCase() ) }) ;
                                if (mIdx >= 0) {
                                    this.resultText += " found mme data :" + mmedata[mIdx].mme_factor ;
                                    mmeFactor = parseFloat(mmedata[mIdx].mme_factor) ;
                                } else {
                                    this.resultText += " no matching mme data ";
                                }
                            }
                            } catch (err) {
                                this.resultText += "\n---------------------------------------\n" + "Error in JS Call 2 \n" + err ;    
                            }
                            this.resultText += "\nTotal MedAdmin Data :" + order.MedicationAdministrations.length ;
                            catIdx = categories.findIndex(function(cat) { return cat.name == order.Name }) ;

                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                var ma = order.MedicationAdministrations[mIdx] ;
                                if (ma.Action != "Not Given") {
                                    try {
                                    // Initializing here instead of before loop - so only cats added if there is data to be added
                                    if (catIdx == -1) {
                                        catIdx = categories.length ;
                                        categories.push({ name: order.Name, pointWidth: 30, data: [], isOpioid: isOpioid, isOral: isOral } ) ;
                                    }
                                    ma.mme = parseFloat(ma.Dose.Value) * mmeFactor ;
                                    // ma.Dose.Value and ma.Dose.Unit
                                    cdata.push({ x: new Date(ma.AdministrationInstant).getTime(), x2: new Date(ma.AdministrationInstant).getTime(), y: catIdx, 
                                    name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme, isOpioid: isOpioid, isOral: isOral }) ;
                                    
                                    if (ma.mme && ma.mme > 0) {
                                        var dt = new Date(ma.AdministrationInstant) ;
                                        var pIdx = prdList.findIndex(function(prd) { return ( (dt.getHours() * 60 + dt.getMinutes()) <= prd ) }) ;
                                        ma.mme = (+ma.mme.toFixed(2)) ;
                                        dt.setHours(Math.floor(prdList[pIdx] / 60), prdList[pIdx] % 60, 0, 0) ;
                                        if (mdata1[dt]) {
                                            mdata1[dt] = mdata1[dt] + ma.mme ;
                                        } else {
                                            mdata1[dt] = ma.mme ;
                                        }
                                        var dtlong = new Date(dt).getTime() ;
                                        var dtIdx = categories[catIdx].data.findIndex(function(row) { return (row.x == dtlong) }) ;
                                        if (dtIdx > -1) {
                                            categories[catIdx].data[dtIdx].y = categories[catIdx].data[dtIdx].y + ma.mme ;
                                        } else {
                                            categories[catIdx].data.push({ x: dtlong, y: ma.mme, name: order.Name }) ;
                                        }
                                    }
                                    } catch (err) {
                                        this.resultText += "\nError in MME aggregation :" + err ;
                                        this.resultText += "\n" + JSON.stringify(ma) ;
                                    }
                                }
                            }
                        }) ; 
                    }) ;

                    this.resultText += "\nTotal chart data :" + cdata.length ;
                    
                    try {
                    this.medCategories = categories.map(function(cat) { return { name: cat.name, isOpioid: cat.isOpioid, isOral: cat.isOral } }) ;
                    
                    var medChartOptions = this.getMedsChart(medstats.start_time, medstats.end_time) ;
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
                    cdata.forEach(function(cd, idx) {
                        cdata[idx].y = catMap[cdata[idx].name] ;
                    }) ;
                    
                    this.marData = cdata ;

                    medChartOptions.series[0].data = cdata ;
                    medChartOptions.yAxis[0].categories = categories.map(function(cat) { return cat.name }) ;

                    this.resultText += "\n MAR DATA " + JSON.stringify(this.marData) ;
                    this.resultText += "\n MED Categories " + JSON.stringify(this.medCategories) ;
                    this.resultText += "\n MEDCHARTOPTIONS " + JSON.stringify(medChartOptions) ;

                    _self.medChartOptions = medChartOptions ;
                    
                    var mdata = [] ;
                    Object.keys(mdata1).forEach(function(dt, idx) {
                        mdata.push({ x: new Date(dt).getTime(), y: mdata1[dt]}) ;
                    }) ;

                    // sort mdata
                    mdata.sort(function (a, b) {
                        return a.x - b.x ;
                    }) ;

                    var mmeChartOptions = this.getMMEChart2(medstats.start_time, medstats.end_time) ;
                    mmeChartOptions.series[0].data = mdata ;                    
                    mmeChartOptions.xAxis = { title : { text : "Inpatient Time Period"} } ;
                    mmeChartOptions.yAxis = { title : { text : "Opioid Morphene Milliequivalent (MME)"} } ;
                    } catch (err) {
                        this.resultText += "\nError in no idea 1 :" + err ;
                        this.resultText += "\n" + JSON.stringify(ma) ;
                    }

                    this.resultText += "\n Before Invoking pain data in BQ" ;

                    // getting pain data
                    this.$services.a3pain.pain(_self.launchModal.start_date, _self.launchModal.end_date, _self.patient.epicPatientId)
                        .then(response => {
                            mmeChartOptions.series[1] =  {
                                        "name": "Pain Score",
                                        "yAxis": 1,
                                        "color": "purple"
                            } ;
                            console.log("response from pain call") ;
                            console.log(response) ;
                            
                            this.resultText += "\n Result from Pain BQ Call " + JSON.stringify(response) ;        

                            mmeChartOptions.series[1].data = response.data.map(function(pn) { return { x: pn.recorded_time, y: pn.meas_value }}) ; ;
                            _self.mmeChartOptions = mmeChartOptions ;

                            this.resultText += "\n Before Invoking pain webservice data for csnids " + csnids ;

                            this.$services.a3pain.painwsdata(csnids, _self.patient.epicPatientId).then(presponses => {                                
                                console.log("pain ws responses length " + presponses.length) ;
                                this.resultText += "\n------------------------------------Pain webservice response START " + presponses.length + "\n" ;
                                presponses.forEach(presponse => {
                                    this.resultText += "\n-------------- Pain ws response " + JSON.stringify(presponse) ;
                                    presponse.forEach(pn => {
                                        var rIdx = mmeChartOptions.series[1].data.findIndex(function(row) { row.x == pn.recorded_time }) ;
                                        if (rIdx == -1)
                                            mmeChartOptions.series[1].data.push({x: pn.recorded_time, y: pn.meas_value}) ;                                        
                                    }) ;                                    
                                }) ;
                                
                                _self.mmeChartOptions = mmeChartOptions ;
                                this.resultText += "\n--------------------******MME CHARTOPTIONS***************************" ;
                                this.resultText += JSON.stringify(mmeChartOptions) ;
                            }) ;
                        }) ;
                    
                    var mmeStackedChartOptions = this.getMMEStackedChart(medstats.start_time, medstats.end_time) ;
                    mmeStackedChartOptions.xAxis = { title : { text : "Inpatient Time Period"} } ;
                    mmeStackedChartOptions.yAxis = { title : { text : "Opioid Morphene Milliequivalent (MME)"} } ;

                    mmeStackedChartOptions.series = categories ;                    
                    _self.mmeStackedChartOptions = mmeStackedChartOptions ;

                    this.resultText += "\n--------------------******MME STACKED CHARTOPTIONS***************************" ;
                    this.resultText += JSON.stringify(mmeStackedChartOptions) ;

                }) ;

            } catch (err) {
                this.resultText += "\n---------------------------------------\n" + "Error in JS Call \n" + err ;
            }

        },
        refreshMarChart() {
            var categories = [] ;
            var cdata = [] ;

            if (this.analgesicCategory == 'Opioids Only') {
                categories = this.medCategories.filter(function (cat) { return cat.isOpioid }) ;
                cdata = this.marData.filter(function (cat) { return cat.isOpioid }) ;
            } else if (this.analgesicCategory == 'Non-Opioids Only') {
                categories = this.medCategories.filter(function (cat) { return !cat.isOpioid }) ;
                cdata = this.marData.filter(function (cat) { return !cat.isOpioid }) ;            
            } else {
                categories = this.medCategories ;
                cdata = this.marData ;
            }

            if (this.routeOfAdmin == 'Oral') {
                categories = categories.filter(function (cat) { return cat.isOral }) ;
                cdata = cdata.filter(function (cat) { return cat.isOral }) ;
            } else if (this.routeOfAdmin == 'Non-Oral') {
                categories = categories.filter(function (cat) { return !cat.isOral }) ;
                cdata = cdata.filter(function (cat) { return !cat.isOral }) ; 
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
            // change the y to reflect new cat idx
            cdata.forEach(function(cd) {
                cd.y = catMap[cd.name] ;
            }) ;
            
            var medChartOptions = this.medChartOptions ;
            
            medChartOptions.yAxis[0].categories = categories.map(function(cat) { return cat.name }) ;
            medChartOptions.series[0].data = cdata ;
            
            //medChartOptions.yAxis[0].title = { text : "Administrered Analgesics"} ;
            //medChartOptions.xAxis[0].title = { text : "Inpatient Time Period"} ;

            this.resultText += "\n in refreshchart " ;
            this.resultText += "\n MEDCHARTOPTIONS " + JSON.stringify(medChartOptions) ;

            this.medChartOptions = medChartOptions ;

        },
        refreshMMEChart() {
            console.log("refreshMMEChart fired {}", this.mmeDuration) ;
            var _self = this ;

            this.resultText += "\n In refreshMMEChart " + this.mmeDuration ;
            try {
                var prdList = this.getTimeChunks(this.mmeDuration) ;
                var mdata1 = {} ;
                var catIdx = -1 ;
                var categories = this.medChartOptions.yAxis[0].categories.map(function(cat) { return {name: cat, data: []}} ) ;
                
                this.resultText += "\n In refreshMMEChart: Categories.... " + JSON.stringify(categories);

                this.medChartOptions.series[0].data.forEach(function (med) {
                    catIdx = categories.findIndex(function(cat) { return cat.name == med.name }) ;
                    if (med.mme && med.mme > 0) {
                        var dt = new Date(med.x) ;
                        var pIdx = prdList.findIndex(function(prd) { return ( (dt.getHours() * 60 + dt.getMinutes()) <= prd ) }) ;
                        //ma.mme = (+ma.mme.toFixed(2)) ;
                        dt.setHours(Math.floor(prdList[pIdx] / 60), prdList[pIdx] % 60, 0, 0) ;
                        if (mdata1[dt]) {
                            mdata1[dt] = mdata1[dt] + med.mme ;
                        } else {
                            mdata1[dt] = med.mme ;
                        }
                        var dtlong = new Date(dt).getTime() ;
                        var dtIdx = categories[catIdx].data.findIndex(function(row) { return (row.x == dtlong) }) ;
                        if (dtIdx > -1) {
                            categories[catIdx].data[dtIdx].y = categories[catIdx].data[dtIdx].y + med.mme ;
                        } else {
                            categories[catIdx].data.push({ x: dtlong, y: med.mme, name: med.name }) ;
                        }
                    }                
                }) ;
                var mdata = [] ;
                Object.keys(mdata1).forEach(function(dt, idx) {
                    mdata.push({ x: new Date(dt).getTime(), y: mdata1[dt]}) ;
                }) ;

                // sort mdata
                mdata.sort(function (a, b) {
                    return a.x - b.x ;
                }) ;
                        
                this.mmeChartOptions.series[0].data = mdata ;
                
                _self.mmeStackedChartOptions.series = categories ;

                this.resultText += "\n--------------------******MME CHARTOPTIONS data in REFRESH MME CHART***************************" ;
                this.resultText += JSON.stringify(this.mmeChartOptions.series[0].data) ;

            } catch (err) {
                this.resultText += "\n------******Error in refreshMMEChart :" + err ;                
            }
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
        getMMEChart2(start_time_long, end_time_long) {

            var co = {
                        "chart": {
                            "marginLeft": 100,
                            "spacingTop": 20,
                            "spacingBottom": 20,
                            "zoomType": "x",
                            "displayErrors": true,
                            "height": 350,
                            "title": ""
                        },
                        "title": {
                            "text": "MME",
                            "align": "center"
                        },
                        "credits": {
                            "enabled": false
                        },
                        "legend": {
                            "enabled": true
                        },
                        "xAxis": {
                            "crosshair": true,
                            "events": {},
                            "type": "datetime",
                            "min": 1619938800000,
                            "max": 1621148400000
                        },
                        "yAxis": [
                            {
                                "title": {
                                    "text": "Opioid Morphine Milliequivalent (MME)"
                                },
                                "min": 0
                            },
                            {
                                "title": {
                                    "text": "Pain Scores"
                                },
                                "opposite": true
                            }
                        ],
                        "tooltip": {
                            "shadow": false,
                            "valueDecimals": 2
                        },
                        "plotOptions": {
                            "series": {
                                "dataLabels": {
                                    "allowOverlap": true
                                },
                                "minPointLength": 10
                            },
                            "line": {
                                "dataLabels": {
                                    "enabled": true
                                }
                            }
                        },
                        "series": [
                            {
                                "name": "MME",
                                "yAxis": 0,
                                "data": [
                                    {
                                        "x": 1620172800000,
                                        "y": 30.8
                                    },
                                    {
                                        "x": 1620259200000,
                                        "y": 45.8
                                    },
                                    {
                                        "x": 1620345600000,
                                        "y": 45
                                    },
                                    {
                                        "x": 1620432000000,
                                        "y": 45
                                    },
                                    {
                                        "x": 1620518400000,
                                        "y": 22.5
                                    },
                                    {
                                        "x": 1620604800000,
                                        "y": 30
                                    },
                                    {
                                        "x": 1620691200000,
                                        "y": 30
                                    },
                                    {
                                        "x": 1620777600000,
                                        "y": 45
                                    },
                                    {
                                        "x": 1620864000000,
                                        "y": 52.5
                                    },
                                    {
                                        "x": 1620950400000,
                                        "y": 45
                                    },
                                    {
                                        "x": 1621036800000,
                                        "y": 37.5
                                    },
                                    {
                                        "x": 1621123200000,
                                        "y": 38.3
                                    },
                                    {
                                        "x": 1621209600000,
                                        "y": 7.5
                                    }
                                ]
                            },
                            {
                                "name": "Pain Score",
                                "yAxis": 1,
                                "color": "purple",
                                "data": [
                                    {
                                        "x": 1620172800000,
                                        "y": 4
                                    },
                                    {
                                        "x": 1620518400000,
                                        "y": 10
                                    },
                                    {
                                        "x": 1620691200000,
                                        "y": 7
                                    },
                                    {
                                        "x": 1620864000000,
                                        "y": 4
                                    },
                                    {
                                        "x": 1621209600000,
                                        "y": 2
                                    }
                                ]
                            }
                        ]
                    } ;

            //if (1 == 1) return co ;

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                name: 'MME',
                type: 'line',   //xrange 
                //title: 'MME',
                height: 350,
                color: "green"
            }) ;

            chartOptions.chart.title = "" ;

            chartOptions.yAxis[0].title.text = "Opioid Morphine Milligramequivalents (MME)" ;

            chartOptions.yAxis[1] = {
                title: {
                    text: "Pain Scores"
                },
                opposite: true
            }   
            chartOptions.series[0] = {
                name : "MME",
                yAxis: 0
            } ;
            chartOptions.series[1] = {
                name : "Pain Score",
                yAxis: 1
            } ;

            chartOptions.plotOptions.line = {
                dataLabels: {
                    enabled: true
                }
            } ;

            chartOptions.tooltip.formatter = function () {
                var tip =  this.point.series.name + ": " + this.point.y  ;
                tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;
                return tip ;
            }
            
            return chartOptions ;

        },
        getMMEStackedChart(start_time_long, end_time_long) {

            //start_time_long = 1619827200000 ;
            //end_time_long = 1622505600000 ;

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                name: 'MME',
                type: 'column',
                title: '',
                height: 350,
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

            chartOptions.tooltip.formatter = function () {
                var tip =  this.point.series.name + " <br> MME: " + this.point.y ;
                return tip ;
            }
            return chartOptions ;

        },        
        getMedsChart(start_time_long, end_time_long) {

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                //max: 10,
                //name: '',
                type: 'scatter',   //xrange 
                //title: 'Opioids Chart',
                height: 350,
                color: "purple"
            }) ;

            chartOptions.tooltip.formatter = function () {
                var tip =  this.point.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit ; " <br> MME: " + this.point.mme ;
                if (this.point.mme && this.point.mme > 0)
                    tip += " <br>MME: " + this.point.mme ;
                tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;

                return tip ;
            }

            chartOptions.yAxis[0].title = { text : "Administrered Analgesics"} ;
            chartOptions.xAxis = { title : { text : "Inpatient Time Period"} } ;

            return chartOptions ;

        },
        getDefaultChartConfig(chartData)
        {
            var chartOptions ;

            chartOptions =
                {
                    chart: {
                        marginLeft: 100, // Keep all charts left aligned
                        spacingTop: 20,
                        spacingBottom: 20,
                        zoomType: 'x',
                        displayErrors: true,
                        height: chartData.height
                        //plotBackgroundColor: '#F7F7F7'
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
                                        "<br>" + this.point.name.toLowerCase() +
                                        "<br>" + this.point.pcat.toLowerCase() ;
                                } else {
                                    return Highcharts.dateFormat('%d %b', this.point.x) + "-" + Highcharts.dateFormat('%d %b', this.point.x2) +
                                        "<br>" + this.point.name.toLowerCase() +
                                        "<br>" + this.point.pcat.toLowerCase() ;
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
        getLocalMarData() {
            return [{"x":1620943110000,"x2":1620943110000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942608000,"x2":1620942608000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942083000,"x2":1620942083000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620488340000,"x2":1620488340000,"y":4,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620780480000,"x2":1620780480000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620758640000,"x2":1620758640000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620737940000,"x2":1620737940000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620716280000,"x2":1620716280000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620696780000,"x2":1620696780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620675000000,"x2":1620675000000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620654300000,"x2":1620654300000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620631980000,"x2":1620631980000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620610380000,"x2":1620610380000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620575640000,"x2":1620575640000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620549480000,"x2":1620549480000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620531780000,"x2":1620531780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620510420000,"x2":1620510420000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620517560000,"x2":1620517560000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621254120000,"x2":1621254120000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621238100000,"x2":1621238100000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621211880000,"x2":1621211880000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621168140000,"x2":1621168140000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621149780000,"x2":1621149780000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621127940000,"x2":1621127940000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621102380000,"x2":1621102380000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621080900000,"x2":1621080900000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621058640000,"x2":1621058640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621044840000,"x2":1621044840000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621021560000,"x2":1621021560000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620997860000,"x2":1620997860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620976080000,"x2":1620976080000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620955440000,"x2":1620955440000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620886860000,"x2":1620886860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620867660000,"x2":1620867660000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620780480000,"x2":1620780480000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620758640000,"x2":1620758640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621210440000,"x2":1621210440000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621179960000,"x2":1621179960000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621164540000,"x2":1621164540000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621149840000,"x2":1621149840000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621134300000,"x2":1621134300000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621119780000,"x2":1621119780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621104600000,"x2":1621104600000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621089360000,"x2":1621089360000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621074540000,"x2":1621074540000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621057680000,"x2":1621057680000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621035840000,"x2":1621035840000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621021740000,"x2":1621021740000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621005720000,"x2":1621005720000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620990660000,"x2":1620990660000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620976080000,"x2":1620976080000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620961560000,"x2":1620961560000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620929820000,"x2":1620929820000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620915960000,"x2":1620915960000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620900780000,"x2":1620900780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620886200000,"x2":1620886200000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620871320000,"x2":1620871320000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620856620000,"x2":1620856620000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620841860000,"x2":1620841860000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620826740000,"x2":1620826740000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620812460000,"x2":1620812460000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620796800000,"x2":1620796800000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620943110000,"x2":1620943110000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942608000,"x2":1620942608000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942083000,"x2":1620942083000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620949560000,"x2":1620949560000,"y":3,"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621141620000,"x2":1621141620000,"y":6,"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg","mme":0,"isOpioid":true,"isOral":false},{"x":1621141560000,"x2":1621141560000,"y":1,"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621204440000,"x2":1621204440000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621204140000,"x2":1621204140000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621203240000,"x2":1621203240000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621201920000,"x2":1621201920000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"100","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621254180000,"x2":1621254180000,"y":0,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621239000000,"x2":1621239000000,"y":0,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621225500000,"x2":1621225500000,"y":0,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621213680000,"x2":1621213680000,"y":5,"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg","mme":0,"isOpioid":true,"isOral":false},{"x":1621623180000,"x2":1621623180000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621602300000,"x2":1621602300000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621579860000,"x2":1621579860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621559340000,"x2":1621559340000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621539960000,"x2":1621539960000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621515660000,"x2":1621515660000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621472460000,"x2":1621472460000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621450680000,"x2":1621450680000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621431540000,"x2":1621431540000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621404240000,"x2":1621404240000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621385520000,"x2":1621385520000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621340640000,"x2":1621340640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621323720000,"x2":1621323720000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621298460000,"x2":1621298460000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621278060000,"x2":1621278060000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true}]
        },
        getLocalMedCategories() {
            return [{"name":"fentaNYL 50 mcg/mL injection","isOpioid":true,"isOral":false},{"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","isOpioid":true,"isOral":true},{"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","isOpioid":true,"isOral":true},{"name":"acetaminophen (Tylenol) tablet 500 mg","isOpioid":false,"isOral":true},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","isOpioid":true,"isOral":true},{"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","isOpioid":true,"isOral":false},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","isOpioid":true,"isOral":true},{"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","isOpioid":true,"isOral":true},{"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","isOpioid":true,"isOral":false}]
        },
        getLocalMedChartOptions() {
            return {"chart":{"spacingTop":20,"zoomType":"x","displayErrors":true,"height":350},"title":{"align":"center"},"credits":{"enabled":false},"legend":{"enabled":true},"xAxis":{"crosshair":true,"events":{},"type":"datetime","min":1620457200000,"max":1621666800000,"title":{"text":"Inpatient Time Period","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}}},"yAxis":[{"title":{"text":"Administrered Analgesics","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}},"min":0,"categories":["oxyCODONE (Roxicodone) tablet 5-10 mg","oxyCODONE (Roxicodone) tablet 5 mg","oxyCODONE (Roxicodone) tablet 2.5-5 mg","oxyCODONE (Roxicodone) tablet 10 mg","oxyCODONE (Roxicodone) oral solution 5-10 mg","HYDROmorphone (Dilaudid) syringe 0.4 mg","HYDROmorphone (Dilaudid) syringe 0.2 mg","fentaNYL 50 mcg/mL injection","acetaminophen (Tylenol) tablet 500 mg"]}],"tooltip":{"shadow":false,"valueDecimals":2},"plotOptions":{"series":{"dataLabels":{"allowOverlap":true},"minPointLength":10}},"series":[{"type":"scatter","color":"purple","fillOpacity":0.3,"xDateormat":"%m/%d/%Y","tooltip":{"shared":true},"showInLegend":false,"data":[{"x":1620943110000,"x2":1620943110000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942608000,"x2":1620942608000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942083000,"x2":1620942083000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620488340000,"x2":1620488340000,"y":4,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620780480000,"x2":1620780480000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620758640000,"x2":1620758640000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620737940000,"x2":1620737940000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620716280000,"x2":1620716280000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620696780000,"x2":1620696780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620675000000,"x2":1620675000000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620654300000,"x2":1620654300000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620631980000,"x2":1620631980000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620610380000,"x2":1620610380000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620575640000,"x2":1620575640000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620549480000,"x2":1620549480000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620531780000,"x2":1620531780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620510420000,"x2":1620510420000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620517560000,"x2":1620517560000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621254120000,"x2":1621254120000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621238100000,"x2":1621238100000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621211880000,"x2":1621211880000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621168140000,"x2":1621168140000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621149780000,"x2":1621149780000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621127940000,"x2":1621127940000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621102380000,"x2":1621102380000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621080900000,"x2":1621080900000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621058640000,"x2":1621058640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621044840000,"x2":1621044840000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621021560000,"x2":1621021560000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620997860000,"x2":1620997860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620976080000,"x2":1620976080000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620955440000,"x2":1620955440000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620886860000,"x2":1620886860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620867660000,"x2":1620867660000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620780480000,"x2":1620780480000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1620758640000,"x2":1620758640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621210440000,"x2":1621210440000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621179960000,"x2":1621179960000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621164540000,"x2":1621164540000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621149840000,"x2":1621149840000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621134300000,"x2":1621134300000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621119780000,"x2":1621119780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621104600000,"x2":1621104600000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621089360000,"x2":1621089360000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621074540000,"x2":1621074540000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621057680000,"x2":1621057680000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621035840000,"x2":1621035840000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621021740000,"x2":1621021740000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621005720000,"x2":1621005720000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620990660000,"x2":1620990660000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620976080000,"x2":1620976080000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620961560000,"x2":1620961560000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620929820000,"x2":1620929820000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620915960000,"x2":1620915960000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620900780000,"x2":1620900780000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620886200000,"x2":1620886200000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620871320000,"x2":1620871320000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620856620000,"x2":1620856620000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620841860000,"x2":1620841860000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620826740000,"x2":1620826740000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620812460000,"x2":1620812460000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620796800000,"x2":1620796800000,"y":2,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1620943110000,"x2":1620943110000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942608000,"x2":1620942608000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620942083000,"x2":1620942083000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1620949560000,"x2":1620949560000,"y":3,"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621141620000,"x2":1621141620000,"y":6,"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg","mme":0,"isOpioid":true,"isOral":false},{"x":1621141560000,"x2":1621141560000,"y":1,"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg","mme":7.5,"isOpioid":true,"isOral":true},{"x":1621204440000,"x2":1621204440000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621204140000,"x2":1621204140000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621203240000,"x2":1621203240000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621201920000,"x2":1621201920000,"y":7,"name":"fentaNYL 50 mcg/mL injection","dose":"100","unit":"mcg","mme":0,"isOpioid":true,"isOral":false},{"x":1621254180000,"x2":1621254180000,"y":0,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621239000000,"x2":1621239000000,"y":0,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621225500000,"x2":1621225500000,"y":0,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg","mme":15,"isOpioid":true,"isOral":true},{"x":1621213680000,"x2":1621213680000,"y":5,"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg","mme":0,"isOpioid":true,"isOral":false},{"x":1621623180000,"x2":1621623180000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621602300000,"x2":1621602300000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621579860000,"x2":1621579860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621559340000,"x2":1621559340000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621539960000,"x2":1621539960000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621515660000,"x2":1621515660000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621472460000,"x2":1621472460000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621450680000,"x2":1621450680000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621431540000,"x2":1621431540000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621404240000,"x2":1621404240000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621385520000,"x2":1621385520000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621340640000,"x2":1621340640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621323720000,"x2":1621323720000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621298460000,"x2":1621298460000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true},{"x":1621278060000,"x2":1621278060000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg","mme":0,"isOpioid":false,"isOral":true}]}]}
        },
        getLocalMMEStackedChartOptions() {
            return {"chart":{"spacingTop":20,"zoomType":"x","displayErrors":true,"height":350,"type":"column"},"title":{"text":"","align":"center"},"credits":{"enabled":false},"legend":{"enabled":true},"xAxis":{"crosshair":true,"events":{},"type":"datetime","min":1620457200000,"max":1621666800000,"title":{"text":"Inpatient Time Period","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}}},"yAxis":[{"title":{"text":"Opioid Morphine Milliequivalent (MME)","margin":15,"style":{"font-size":"1.2em","font-weight":"bold"}}}],"tooltip":{"shadow":false,"valueDecimals":2},"plotOptions":{"column":{"stacking":"normal","dataLabels":{"enabled":true}}},"series":[{"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","pointWidth":30,"data":[{"x":1621321200000,"y":30,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg"},{"x":1621234800000,"y":15,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg"}],"isOpioid":true,"isOral":true},{"name":"oxyCODONE (Roxicodone) tablet 5 mg","pointWidth":30,"data":[{"x":1621148400000,"y":7.5,"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg"}],"isOpioid":true,"isOral":true},{"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","pointWidth":30,"data":[{"x":1620802800000,"y":30,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620716400000,"y":37.5,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620630000000,"y":22.5,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620543600000,"y":15,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621234800000,"y":30,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621148400000,"y":37.5,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621062000000,"y":45,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620975600000,"y":30,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620889200000,"y":45,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"}],"isOpioid":true,"isOral":true},{"name":"oxyCODONE (Roxicodone) tablet 10 mg","pointWidth":30,"data":[{"x":1620975600000,"y":15,"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg"}],"isOpioid":true,"isOral":true},{"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","pointWidth":30,"data":[{"x":1620543600000,"y":7.5,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"5","unit":"mg"}],"isOpioid":true,"isOral":true},{"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","pointWidth":30,"data":[],"isOpioid":true,"isOral":false},{"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","pointWidth":30,"data":[],"isOpioid":true,"isOral":false},{"name":"fentaNYL 50 mcg/mL injection","pointWidth":30,"data":[],"isOpioid":true,"isOral":false},{"name":"acetaminophen (Tylenol) tablet 500 mg","pointWidth":30,"data":[],"isOpioid":false,"isOral":true}]}
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
    .used_in_calc {
        color: blue;
        font-style: italic;
        font-weight: bold;
    }
    .chart-title {
        color: rgb(54,38, 115) ;
        font-size: 1.1em ;
    }
</style>
