<template>
    <!-- eslint-disable -->
    <b-container fluid>
        <b-row>
            <b-col cols="10">
                <p class="mt-2">
                    Something about the A3 Pain Management 
                </p>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="10" offset="1">
                <b-card bg-variant="success">
                    <b-card-title>Report</b-card-title>
                    <b-card-text>
                        <b-row>
                            <b-col cols="3">                                
                                <b-form-input v-model="report_date" dense label="Report Date"></b-form-input>
                            </b-col>
                            <b-col cols="3">
                                <b-form-input v-model="number_of_weeks_back" dense label="Number of Weeks back"></b-form-input>
                            </b-col>
                            <b-col cols="3">
                                <b-form-input v-model="number_of_weeks_ahead" dense label="Number of Weeks ahead"></b-form-input>
                            </b-col>     
                            <b-col cols="2">
                                <b-button @click="populateData" color="primary">Run Report</b-button>
                            </b-col>     
                        </b-row>
                    </b-card-text>
                </b-card>                
            </b-col>
        </b-row>
        <b-row class="mt-3">
            <b-col cols="10" offset="1">                
                <b-card color="green">
                    <b-card-title>Pain Meds</b-card-title>
                    <b-card-text>
                        <highchart 
                            :options="medChartOptions" 
                            :modules="['xrange']" 
                            @mousemove="mousemove"
                             />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3">
            <b-col cols="10" offset="1">
                <!-- :update="['options.title', 'options.series']" -->
                <b-card color="green">
                    <b-card-title>MME & Pain Level</b-card-title>
                    <b-card-text>
                        <highchart 
                            :options="mmeChartOptions" 
                            @mousemove="mousemove"
                        />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3">
            <b-col cols="10" offset="1">
                <b-card color="green">
                    <b-card-title>MME - Distribution</b-card-title>
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
            <b-col cols="10" offset="1">                
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
        <b-row class="mt-3">
            <b-col cols="10" offset="1">
                <b-card color="green">
                    <b-card-title>Debug Info</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="resultText" rows="10" auto-grow />
                    </b-card-text>
                </b-card>
            </b-col>                        
        </b-row>
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
            report_date: undefined ,
            number_of_weeks_ahead: 1,
            number_of_weeks_back: 12,
            resultText: "",
            medChartOptions: {},
            mmeChartOptions: {},
            mmeStackedChartOptions: {},
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
        this.mmeStackedChartOptions = this.getMMEStackedChart() ;

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

            //mmeChartOptions.tooltip.formatter = function () {
            //    return this.point.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit ;
            //}

            var _self = this ;

            var categories = [] ;
            var cdata = [] ;
            var catIdx = -1 ;
            
            var mdata = [] ;
            var mdata1 = {} ;

            var mmedata = await this.$services.a3pain.mmedata() ;
            console.log(mmedata) ;
            this.resultText += "\n--------------------******mme data***************************" ;
            this.resultText += JSON.stringify(mmedata) ;

            try {
                // https://masteringjs.io/tutorials/axios/all
                // https://www.storyblok.com/tp/how-to-send-multiple-requests-using-axios
                this.$services.a3pain.mardata(wsjson).then(responses => {
                    console.log("responses length " + responses.length) ;
                    
                    this.resultText += "\n------------------------------------MARDATA webservice response START " + responses.length + "\n" ;
                    //this.resultText += JSON.stringify(responses) ;
                    //this.resultText += "\n------------------------------------MARDATA webservice response  END " + "\n" ;

                    responses.forEach(response => {
                        response.data.Orders.forEach(order => {                                                        
                            this.resultText += "\n----------------------------------Processing Order :" + order.Name ;
                            var cIdx = medstats.cats.findIndex(function (cat) { return (cat.med_order_ids.indexOf(order.OrderID.ID) >= 0) }) ;
                            var mmeFactor = 0 ;

                            if (cIdx >= 0) {
                                this.resultText += " med order name :" + medstats.cats[cIdx].name ;
                                var mIdx = mmedata.findIndex(function (mme) { return (mme.med_name.toLowerCase() == medstats.cats[cIdx].name.toLowerCase() ) }) ;
                                if (mIdx >= 0) {
                                    this.resultText += " found mme data :" + mmedata[mIdx].mme_factor ;
                                    mmeFactor = parseFloat(mmedata[mIdx].mme_factor) ;
                                } else {
                                    this.resultText += " no matching mme data ";
                                }
                            }

                            this.resultText += "\nTotal MedAdmin Data :" + order.MedicationAdministrations.length ;
                            catIdx = categories.findIndex(function(cat) { return cat.name == order.Name }) ;

                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                var ma = order.MedicationAdministrations[mIdx] ;
                                if (ma.Action == "Given") {
                                    
                                    // Initializing here instead of before loop - so only cats added if there is data to be added
                                    if (catIdx == -1) {
                                        catIdx = categories.length ;
                                        categories.push({ name: order.Name, pointWidth: 30, data: [] } ) ;
                                    }
                                    ma.mme = parseFloat(ma.Dose.Value) * mmeFactor ;
                                    // ma.Dose.Value and ma.Dose.Unit
                                    cdata.push({ x: new Date(ma.AdministrationInstant).getTime(), x2: new Date(ma.AdministrationInstant).getTime(), y: catIdx, 
                                    name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, mme: ma.mme }) ;
                                    if (ma.mme && ma.mme > 0) {
                                        var dt = ma.AdministrationInstant.substr(0, ma.AdministrationInstant.indexOf("T")) ;
                                        ma.mme = (+ma.mme.toFixed(2)) ;
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
                                }
                            }
                        }) ; 
                    }) ;
        
                    this.resultText += "\nTotal chart data :" + cdata.length ;

                    medChartOptions.series[0].data = cdata ;
                    medChartOptions.yAxis[0].categories = categories.map(function(cat) { return cat.name }) ;

                    _self.medChartOptions = medChartOptions ;
                    
                    mdata = [] ;
                    Object.keys(mdata1).forEach(function(dt, idx) {
                        mdata.push({ x: new Date(dt).getTime(), y: mdata1[dt]}) ;
                    }) ;

                    // sort mdata
                    mdata.sort(function (a, b) {
                        return a.x - b.x ;
                    }) ;

                    var mmeChartOptions = this.getMMEChart2(medstats.start_time, medstats.end_time) ;
                    mmeChartOptions.series[0].data = mdata ;

                    // getting pain data
                    this.$services.a3pain.pain(this.report_date, this.number_of_weeks_ahead, this.number_of_weeks_back, _self.patient.epicPatientId)
                        .then(response => {
                            mmeChartOptions.series[1] =  {
                                        "name": "Pain Score",
                                        "yAxis": 1,
                                        "color": "purple"
                            } ;
                            console.log("response from pain call") ;
                            console.log(response) ;
                            
                            mmeChartOptions.series[1].data = response.map(function(pn) { return { x: pn.recorded_time, y: pn.meas_value }}) ; ;

                            _self.mmeChartOptions = mmeChartOptions ;
                            this.resultText += "\n--------------------******MME CHARTOPTIONS***************************" ;
                            this.resultText += JSON.stringify(mmeChartOptions) ;

                        }) ;
                    
                    /*
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
                            } ;
                    */

                    var mmeStackedChartOptions = this.getMMEStackedChart(medstats.start_time, medstats.end_time) ;
                    mmeStackedChartOptions.series = categories ;
                    _self.mmeStackedChartOptions = mmeStackedChartOptions ;

                    this.resultText += "\n--------------------******MME STACKED CHARTOPTIONS***************************" ;
                    this.resultText += JSON.stringify(mmeStackedChartOptions) ;

                }) ;

            } catch (err) {
                this.resultText += "\n---------------------------------------\n" + "Error in JS Call \n" + JSON.stringify(err) ;
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
                                    "text": "MME"
                                },
                                "min": 0
                            },
                            {
                                "title": {
                                    "text": "Pain Score"
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

            chartOptions.yAxis[0].title.text = "MME" ;

            chartOptions.yAxis[1] = {
                title: {
                    text: "Pain Score"
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
            /*
            chartOptions.series = [{
                name : "first med12",
                data: [
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
                ]                 
            }, 
            {
                name : "second med",
                //type: "column",
                data: [
                    {
                        "x": 1581105800000,
                        "y": 3
                    },                
                    {
                        "x": 1582105800000,
                        "y": 1
                    },
                    {
                        "x": 1583105800000,
                        "y": 1
                    },        
                    {
                        "x": 1584105800000,
                        "y": 5
                    },                        
                    {
                        "x": 1588105800000,
                        "y": 7
                    } ]               
            }
            ] ;  
            */   
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
                //title: 'Opioids Chart',
                height: 350,
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
