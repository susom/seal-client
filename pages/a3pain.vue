<template>
    <v-container fluid>
        <v-row>
            <v-col cols="10">
                <p class="mt-2">
                    Something about the A3 Pain Management 
                </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10" offset="1">
                <v-card color="green">
                    <v-card-title>Report</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="3">
                                <v-text-field v-model="report_date" dense label="Report Date"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field v-model="number_of_weeks_back" dense label="Number of Weeks back"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field v-model="number_of_weeks_ahead" dense label="Number of Weeks ahead"></v-text-field>
                            </v-col>     
                            <v-col cols="2">
                                <v-btn @click="populateData" color="primary">Run Report</v-btn>
                            </v-col>     
                        </v-row>
                    </v-card-text>
                </v-card>                
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10" offset="1">
                <!-- :update="['options.title', 'options.series']" -->
                <v-card color="green">
                    <v-card-title>Pain Score</v-card-title>
                    <v-card-text>
                        <highchart :options="getPainChart()" :update="['options.series']" />
                    </v-card-text>
                </v-card>
            </v-col>            
        </v-row>        
        <!--
        <v-row>
            <v-col cols="10" offset="1">
                <v-card color="green">
                    <v-card-title>MME - morphine milligram equivalents</v-card-title>
                    <v-card-text>
                        <highchart :options="getMMEChart()" :update="['options.series']" />
                    </v-card-text>
                </v-card>
            </v-col>                        
        </v-row>
        -->
        <v-row>
            <v-col cols="10" offset="1">
                <!-- :update="['options.title', 'options.series']" -->
                <v-card color="green">
                    <v-card-title>Pain Meds</v-card-title>
                    <v-card-text>
                        <highchart 
                            :options="medChartOptions" 
                            :modules="['xrange']" 
                             />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10" offset="1">
                <!-- :update="['options.title', 'options.series']" -->
                <v-card color="green">
                    <v-card-title>MME - morphine milligram equivalents</v-card-title>
                    <v-card-text>
                        <highchart 
                            :options="mmeChartOptions" 
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>        
        <v-row>
            <v-col cols="10" offset="1">
                <v-card color="green">
                    <v-card-title>Result</v-card-title>
                    <v-card-text>
                        <v-textarea v-model="resultText" rows="10" auto-grow />
                    </v-card-text>
                </v-card>
            </v-col>                        
        </v-row>
    </v-container>
</template>

<script>

import Highcharts, { chart } from 'highcharts' ;

var colorIdx = 2 ;

export default {
    data () {
        return {
            report_date: undefined ,
            number_of_weeks_ahead: 1,
            number_of_weeks_back: 12,
            resultText: "",
            medChartOptions: {},
            mmeChartOptions: {},
            patient: {}
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
        this.$store.commit('setPageTitle', "A3 Pain") ;
        var dt = new Date() ;
        this.report_date = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear() ;
        this.medChartOptions = this.getMedsChart() ;
        this.mmeChartOptions = this.getMMEChart2() ;
        //this.medChartOptions = this.noIdeaOptions() ;
     },
    computed : {
        chartOptions() {
            return {

                "chart": {
                    "marginLeft": 100,
                    "spacingTop": 20,
                    "spacingBottom": 20,
                    "zoomType": "x",
                    "displayErrors": true,
                    "height": 240
                },
                "title": {
                    "text": " ",
                    "align": "left"
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
                    "min": 1577865600000,
                    "max": 1589958000000
                },
                "yAxis": {
                    "title": {
                    "text": null
                    },
                    "plotLines": [
                    {
                        "color": "green",
                        "dashStyle": "shortdash",
                        "width": 2,
                        "label": {
                            "text": "low"
                        }
                    },
                    {
                        "color": "red",
                        "dashStyle": "shortdash",
                        "width": 2,
                        "label": {
                            "text": "high"
                        }
                    }
                    ],
                    "alternateGridColor": "#F7F7F7",
                    "categories": [
                    "triamterene 50 mg po caps",
                    "spironolactone 25 mg po tabs",
                    "potassium chloride crys er 20 meq po tbcr",
                    "losartan potassium 25 mg po tabs",
                    "lisinopril 2.5 mg po tabs",
                    "eplerenone 25 mg po tabs",
                    "amiloride hcl 5 mg po tabs",
                    "aliskiren fumarate 150 mg po tabs"
                    ]
                },
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
                    "xrange" : {
                        "dataLabels" : {
                            enabled: true
                        }
                    },
                    "line" : {
                        dataLabels: {
                            enabled: true
                        }
                        //enableMouseTracking: false
                    }                    
                },
                "series": [
                    {
                    "name": "Medications",
                    "type": "xrange",
                    "color": "#7cb5ec",
                    "fillOpacity": 0.3,
                    "xDateFormat": "%m/%d/%Y",
                    "tooltip": {
                        "valueSuffix": " undefined",
                        "shared": true
                    },
                    "data": [
                        {
                        "x": 1588104900000,
                        "x2": 1588106642000,
                        "y": 1,
                        "name": "spironolactone 25 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588104900000,
                        "x2": 1588106642000,
                        "y": 2,
                        "name": "potassium chloride crys er 20 meq po tbcr",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588105800000,
                        "x2": 1747724400000,
                        "y": 2,
                        "name": "potassium chloride crys er 20 meq po tbcr",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588105800000,
                        "x2": 1588106642000,
                        "y": 3,
                        "name": "losartan potassium 25 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588105800000,
                        "x2": 1588106642000,
                        "y": 4,
                        "name": "lisinopril 2.5 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588105800000,
                        "x2": 1588106642000,
                        "y": 5,
                        "name": "eplerenone 25 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588105800000,
                        "x2": 1588106642000,
                        "y": 6,
                        "name": "amiloride hcl 5 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588105800000,
                        "x2": 1588106642000,
                        "y": 7,
                        "name": "aliskiren fumarate 150 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588106642000,
                        "x2": 1588106642000,
                        "y": 0,
                        "name": "triamterene 50 mg po caps",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588106942000,
                        "x2": 1588106942000,
                        "y": 2,
                        "name": "potassium chloride crys er 20 meq po tbcr",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588107600000,
                        "x2": 1747724400000,
                        "y": 1,
                        "name": "spironolactone 25 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        },
                        {
                        "x": 1588107600000,
                        "x2": 1747724400000,
                        "y": 4,
                        "name": "lisinopril 2.5 mg po tabs",
                        "color": "green",
                        "pcat": "Inpatient"
                        }
                    ]
                    }
                ]
                                
            }
        }
    },
    methods : {
        async populateData() {
            /*
            if (1 == 1) {
                alert("I am in 1==1 area") ;
                this.resultText += "\n___________________________Static chartr data" ;
                var co =                 
                    {"chart":{"marginLeft":100,"spacingTop":20,"spacingBottom":20,"zoomType":"x","displayErrors":true},"title":{"text":"Opioids Chart","align":"center"},"credits":{"enabled":false},"legend":{"enabled":true},"xAxis":{"crosshair":true,"events":{},"type":"datetime","min":1620198000000,"max":1622012400000},"yAxis":[{"title":{"text":null},"min":0,"categories":["fentaNYL 50 mcg/mL injection","acetaminophen (Tylenol) oral solution 650 mg","HYDROmorphone (Dilaudid) syringe 0.2 mg","oxyCODONE (Roxicodone) oral solution 5-10 mg","acetaminophen (Tylenol) oral solution 325 mg","acetaminophen (Ofirmev) injection 500 mg","acetaminophen (Tylenol) oral solution 500 mg","oxyCODONE (Roxicodone) tablet 2.5-5 mg","acetaminophen (Tylenol) tablet 500 mg","oxyCODONE (Roxicodone) tablet 10 mg","oxyCODONE (Roxicodone) tablet 5 mg","oxyCODONE (Roxicodone) tablet 5-10 mg","HYDROmorphone (Dilaudid) syringe 0.4 mg"]}],"tooltip":{"shadow":false,"valueDecimals":2},"plotOptions":{"series":{"dataLabels":{"allowOverlap":true},"minPointLength":10}},"series":[{"name":"Opioids Chart","type":"scatter","fillOpacity":0.3,"xDateormat":"%m/%d/%Y","tooltip":{"shared":true},"data":[{"x":1620943110000,"x2":1620943110000,"y":0,"name":"fentaNYL 50 mcg/mL injection","color": "red", "dose":"25","unit":"mcg"},{"x":1620942608000,"x2":1620942608000,"y":0,"color":"red", "name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg"},{"x":1620942083000,"x2":1620942083000,"y":0,"name":"fentaNYL 50 mcg/mL injection","color":"red", "dose":"50","unit":"mcg"},{"x":1620239700000,"x2":1620239700000,"y":1,"name":"acetaminophen (Tylenol) oral solution 650 mg","dose":"650","unit":"mg"},{"x":1620227220000,"x2":1620227220000,"y":2,"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg"},{"x":1620461280000,"x2":1620461280000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620437220000,"x2":1620437220000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620414720000,"x2":1620414720000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620393420000,"x2":1620393420000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620366780000,"x2":1620366780000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620337560000,"x2":1620337560000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620316380000,"x2":1620316380000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620292680000,"x2":1620292680000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620252480000,"x2":1620252480000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620230640000,"x2":1620230640000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"10","unit":"mg"},{"x":1620263700000,"x2":1620263700000,"y":4,"name":"acetaminophen (Tylenol) oral solution 325 mg","dose":"325","unit":"mg"},{"x":1620239700000,"x2":1620239700000,"y":1,"name":"acetaminophen (Tylenol) oral solution 650 mg","dose":"650","unit":"mg"},{"x":1620273780000,"x2":1620273780000,"y":2,"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg"},{"x":1620488340000,"x2":1620488340000,"y":3,"name":"oxyCODONE (Roxicodone) oral solution 5-10 mg","dose":"5","unit":"mg"},{"x":1620780480000,"x2":1620780480000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620758640000,"x2":1620758640000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620737940000,"x2":1620737940000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620716280000,"x2":1620716280000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620696780000,"x2":1620696780000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620675000000,"x2":1620675000000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620654300000,"x2":1620654300000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620631980000,"x2":1620631980000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620610380000,"x2":1620610380000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620575640000,"x2":1620575640000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620549480000,"x2":1620549480000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620531780000,"x2":1620531780000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620510420000,"x2":1620510420000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620517560000,"x2":1620517560000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621254120000,"x2":1621254120000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621238100000,"x2":1621238100000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621211880000,"x2":1621211880000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621168140000,"x2":1621168140000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621149780000,"x2":1621149780000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621127940000,"x2":1621127940000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621102380000,"x2":1621102380000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621080900000,"x2":1621080900000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621058640000,"x2":1621058640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621044840000,"x2":1621044840000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621021560000,"x2":1621021560000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620997860000,"x2":1620997860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620976080000,"x2":1620976080000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620955440000,"x2":1620955440000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620886860000,"x2":1620886860000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620867660000,"x2":1620867660000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620780480000,"x2":1620780480000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1620758640000,"x2":1620758640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621210440000,"x2":1621210440000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621179960000,"x2":1621179960000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621164540000,"x2":1621164540000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621149840000,"x2":1621149840000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621134300000,"x2":1621134300000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621119780000,"x2":1621119780000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621104600000,"x2":1621104600000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621089360000,"x2":1621089360000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621074540000,"x2":1621074540000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621057680000,"x2":1621057680000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621035840000,"x2":1621035840000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621021740000,"x2":1621021740000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1621005720000,"x2":1621005720000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620990660000,"x2":1620990660000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620976080000,"x2":1620976080000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620961560000,"x2":1620961560000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620929820000,"x2":1620929820000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620915960000,"x2":1620915960000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620900780000,"x2":1620900780000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620886200000,"x2":1620886200000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620871320000,"x2":1620871320000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620856620000,"x2":1620856620000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620841860000,"x2":1620841860000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620826740000,"x2":1620826740000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620812460000,"x2":1620812460000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620796800000,"x2":1620796800000,"y":7,"name":"oxyCODONE (Roxicodone) tablet 2.5-5 mg","dose":"5","unit":"mg"},{"x":1620943110000,"x2":1620943110000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg"},{"x":1620942608000,"x2":1620942608000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg"},{"x":1620942083000,"x2":1620942083000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg"},{"x":1620949560000,"x2":1620949560000,"y":9,"name":"oxyCODONE (Roxicodone) tablet 10 mg","dose":"10","unit":"mg"},{"x":1621141620000,"x2":1621141620000,"y":2,"name":"HYDROmorphone (Dilaudid) syringe 0.2 mg","dose":"0.2","unit":"mg"},{"x":1621141560000,"x2":1621141560000,"y":10,"name":"oxyCODONE (Roxicodone) tablet 5 mg","dose":"5","unit":"mg"},{"x":1621204440000,"x2":1621204440000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg"},{"x":1621204140000,"x2":1621204140000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"25","unit":"mcg"},{"x":1621203240000,"x2":1621203240000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"50","unit":"mcg"},{"x":1621201920000,"x2":1621201920000,"y":0,"name":"fentaNYL 50 mcg/mL injection","dose":"100","unit":"mcg"},{"x":1621254180000,"x2":1621254180000,"y":11,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg"},{"x":1621239000000,"x2":1621239000000,"y":11,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg"},{"x":1621225500000,"x2":1621225500000,"y":11,"name":"oxyCODONE (Roxicodone) tablet 5-10 mg","dose":"10","unit":"mg"},{"x":1621213680000,"x2":1621213680000,"y":12,"name":"HYDROmorphone (Dilaudid) syringe 0.4 mg","dose":"0.4","unit":"mg"},{"x":1621450680000,"x2":1621450680000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621431540000,"x2":1621431540000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621404240000,"x2":1621404240000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621385520000,"x2":1621385520000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621340640000,"x2":1621340640000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621323720000,"x2":1621323720000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621298460000,"x2":1621298460000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"},{"x":1621278060000,"x2":1621278060000,"y":8,"name":"acetaminophen (Tylenol) tablet 500 mg","dose":"500","unit":"mg"}]}]}
                    ;

                co.tooltip.formatter = function () {
                        return this.point.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit ;
                } ;
                //co.series[0].color = "purple" ;
                co.plotOptions =  {column: {colorByPoint: true}} ;

                this.medChartOptions =  co ;
                return ;
            }
            */
            this.resultText += "\n___________________________Pop data: before Patient data" ;

            this.patient = await this.$services.a3pain.patient() ;      
            this.resultText += "\n___________________________Pop data: Patient data \n" + JSON.stringify(this.patient) ;

            var encounters = await this.$services.a3pain.encounters(this.report_date, this.number_of_weeks_ahead, this.number_of_weeks_back) ;
            //var encounters = response.data ;
            console.log("encounters....") ;
            console.log(encounters) ;

            var medstats = await this.$services.a3pain.medstats(this.report_date, this.number_of_weeks_ahead, this.number_of_weeks_back) ;
            //var medstats = response1.data ;
            console.log("medstats....") ;
            console.log(medstats) ;

            var wsjson = {} ;
            var _self = this ;

            this.resultText += "\n___________________________Patient EPIC client id \n" + this.patient.epicPatientId ;

            encounters.forEach(enc => {
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

            console.log("Final ws call json") ;
            console.log(wsjson) ;

            var medChartOptions = this.getMedsChart(medstats.start_time, medstats.end_time) ;
            medChartOptions.tooltip.formatter = function () {
                var tip =  this.point.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit ; " <br> MME: " + this.point.mme ;
                if (this.point.mme && this.point.mme > 0)
                    tip += " <br>MME: " + this.point.mme ;
                return tip ;
            }

            var mmeChartOptions = this.getMMEChart2(medstats.start_time, medstats.end_time) ;

            //mmeChartOptions.tooltip.formatter = function () {
            //    return this.point.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit ;
            //}

            var _self = this ;

            var categories = [] ;
            var cdata = [] ;
            var catIdx = -1 ;
            
            var mdata = [] ;
            var mdata1 = {} ;

            try {

                // https://masteringjs.io/tutorials/axios/all
                // https://www.storyblok.com/tp/how-to-send-multiple-requests-using-axios
                

                //this.$services.a3pain.mardata(wsjson).then(this.$axios.spread((...responses) => {
                this.$services.a3pain.mardata(wsjson).then(responses => {
                    console.log("responses length " + responses.length) ;
                    
                    this.resultText += "\n------------------------------------MARDATA webservice response START " + responses.length + "\n" ;
                    //this.resultText += JSON.stringify(responses) ;
                    //this.resultText += "\n------------------------------------MARDATA webservice response  END " + "\n" ;

                    responses.forEach(response => {
                        response.data.Orders.forEach(order => {
                            this.resultText += "\n----------------------------------Processing Order :" + order.Name ;
                            this.resultText += "\nTotal MedAdmin Data :" + order.MedicationAdministrations.length ;
                            if (categories.indexOf(order.Name) > -1)
                                catIdx = categories.indexOf(order.Name) ;
                            else {
                                catIdx = categories.length ;
                                categories.push(order.Name) ;                                
                            }
                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                var ma = order.MedicationAdministrations[mIdx] ;
                                if (ma.Action == "Given") {
                                    // ma.Dose.Value and ma.Dose.Unit
                                    cdata.push({ x: new Date(ma.AdministrationInstant).getTime(), x2: new Date(ma.AdministrationInstant).getTime(), y: catIdx, 
                                    name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme }) ;
                                    if (ma.mme && ma.mme > 0) {
                                        var dt = ma.AdministrationInstant.substr(0, ma.AdministrationInstant.indexOf("T")) ;
                                        if (mdata1[dt]) {
                                            mdata1[dt] = mdata1[dt] + ma.mme ;
                                        } else {
                                            mdata1[dt] = ma.mme ;
                                        }
                                    }
                                    mdata.push({ x: new Date(ma.AdministrationInstant).getTime(), y: ma.mme }) ;
                                }
                            }
                        }) ; 
                    }) ;
        
                    this.resultText += "\nTotal chart data :" + cdata.length ;

                    medChartOptions.series[0].data = cdata ;
                    medChartOptions.yAxis[0].categories = categories ;

                    _self.medChartOptions = medChartOptions ;
                    
                    // sort mdata
                    mdata.sort(function (a, b) {
                        return a.x - b.x ;
                    }) ;

                    mdata = [] ;
                    Object.keys(mdata1).forEach(function(dt, idx) {
                        mdata.push({ x: new Date(dt).getTime(), y: mdata1[dt]}) ;
                    }) ;

                    mmeChartOptions.series[0].data = mdata ;
                    _self.mmeChartOptions = mmeChartOptions ;

                    //this.resultText += "\n--------------------******MME CHARTOPTIONS***************************" ;
                    //this.resultText += JSON.stringify(mmeChartOptions) ;

                }) ;

            } catch (err) {
                this.resultText += "\n---------------------------------------\n" + "Error in JS Call \n" + JSON.stringify(err) ;
            }

        },
        getMMEChart2(start_time_long, end_time_long) {

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                //max: 10,
                name: 'MME',
                type: 'line',   //xrange 
                title: 'MME',
                //height: 350,
                color: "green"
            }) ;

            chartOptions.chart.title = "MME" ;

            chartOptions.yAxis[0].title.text = "MME" ;

            /*
            chartOptions.yAxis[1] =  {
                linkedTo: 0,
                opposite: true,
                title: { text: "MME" }
            } ;
            */
            chartOptions.plotOptions.line = {
                    dataLabels: {
                        enabled: true
                    }
            } ;

            return chartOptions ;

        },
        getMedsChart(start_time_long, end_time_long) {

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                //max: 10,
                name: 'Opioids Chart',
                type: 'scatter',   //xrange 
                title: 'Opioids Chart',
                //height: 350,
                color: "purple"
            }) ;

            return chartOptions ;

        },

        getPainChart() {
            
            console.log("In getPainChart Method...") ;

            var chartOptions = this.getDefaultChartConfig({
                start_time: 1577865600000,
                end_time: 1589958000000,
                min: 0,
                max: 10,
                name: 'Pain Score',
                type: 'line', 
                title: 'Pain Score',
                height: 350,
                color: "purple"
            }) ;

            chartOptions.chart.zoomType = "x",

            chartOptions.yAxis[0].title.text = "Score" ;

            chartOptions.yAxis[1] =  {
                linkedTo: 0,
                opposite: true,
                title: { text: "Score" }
            } ;

            chartOptions.plotOptions.line = {
                    dataLabels: {
                        enabled: true
                    }
            } ;
    
            chartOptions.series[0].data = [
                {
                    "x": 1581105800000,
                    "y": 4
                },                
                {
                    "x": 1582105800000,
                    "y": 2
                },
                {
                    "x": 1583105800000,
                    "y": 2
                },        
                {
                    "x": 1584105800000,
                    "y": 6
                },                        
                {
                    "x": 1588105800000,
                    "y": 8
                }
            ] ;
            
            return chartOptions ;

        }, 
        getMMEChart() {
            
            var chartOptions = this.getDefaultChartConfig({
                start_time: 1577865600000,
                end_time: 1589958000000,
                min: 0,
                max: 100,
                name: 'MME',
                type: 'line', 
                title: 'MME',
                height: 350,
                color: "green"
            }) ;

            chartOptions.chart.title = "MME" ;

            chartOptions.yAxis[0].title.text = "MME" ;

            chartOptions.yAxis[1] =  {
                linkedTo: 0,
                opposite: true,
                title: { text: "MME" }
            } ;

            chartOptions.plotOptions.line = {
                    dataLabels: {
                        enabled: true
                    }
            } ;
    
            chartOptions.series[0].data = [
                {
                    "x": 1581105800000,
                    "y": 10
                },                
                {
                    "x": 1582105800000,
                    "y": 40
                },
                {
                    "x": 1583105800000,
                    "y": 20
                },        
                {
                    "x": 1584105800000,
                    "y": 52
                },                        
                {
                    "x": 1588105800000,
                    "y": 40
                }
            ] ;
            
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
                            //setExtremes: syncExtremes
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

        }
    },
    head() {
        return {
            title: "A3 Pain"
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
</style>
