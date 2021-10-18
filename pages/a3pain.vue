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
                <b-card class="shadow-lg rounded-lg" bg-variant="secondary">
                    <b-card-title class="chart-title text-center">Select Time Interval</b-card-title>                    
                    <b-card-text>
                        <b-row>
                            <b-col class="text-center" offset="1" cols="10">
                                *This interval refers to the time interval periods for cumulative opioid and non-opioid data points. By selecting a specific interval, this will 
                                dictate the X-axis for the following three figures below: the Cumulative Opioid MME, Opioid MME Distribution, and Non-Opioid Distribution.
                            </b-col>
                        </b-row>
                        <b-row class="mt-4">
                            <b-col class="text-center">
                                <span class="font-weight-bold">Aggregated MME by Time Interval:</span> 
                                <b-select :options="[{value: 1440, text: '24 Hours'}, {value: 240, text: '4 Hours'}, {value: 120, text: '2 Hours'}, {value: 60, text:'1 Hour'}]" 
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
                        <!--
                        <b-row>
                            <b-col cols="12">
                                    <b-form-radio-group
                                        id="radio-group-1"
                                        v-model="mmeDuration"
                                        :options="[{value: 1440, text: 'Daily'}, {value: 240, text: '4 Hours'}, {value: 120, text: '2 Hours'}, {value: 60, text:'Hourly'}]"                                        
                                        name="radio-options"
                                        @change="refreshMMEChart"
                                        class="text-right mr-5"
                                    ></b-form-radio-group>
                            </b-col>
                        </b-row>
                        -->
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
        this.mmeStackedChartOptions = this.getMMEStackedChart() ;
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
            this.resultText += "\n___________________________MedStats Data \n" + JSON.stringify(medstats) ;

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
                            
                            try {
                            for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                                var ma = order.MedicationAdministrations[mIdx] ;
                                if (ma.Action != "Not Given" || ma.Action != 'Canceled Entry') {                                    
                                    if (!ma.Dose.Value) continue ;
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
                                            categories[catIdx].data.push({ x: dtlong, y: ma.mme, name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit }) ;
                                        }
                                    }                    
                                }
                            }
                            } catch (err) {
                                this.resultText += "\nError in MME aggregation :" + err ;
                                this.resultText += "\n" + JSON.stringify(ma) ;
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

                    } catch (err) {
                        this.resultText += "\nError in no idea 1 :" + err ;
                        this.resultText += "\n" + JSON.stringify(ma) ;
                    }

                    var mmeStackedChartOptions = this.getMMEStackedChart(medstats.start_time, medstats.end_time) ;
                    mmeStackedChartOptions.series = categories ;                    
                    _self.mmeStackedChartOptions = mmeStackedChartOptions ;

                    this.resultText += "\n--------------------******MME STACKED CHARTOPTIONS***************************" ;
                    this.resultText += JSON.stringify(mmeStackedChartOptions) ;


                    this.resultText += "\n Before Invoking pain data in BQ" ;

                    // getting pain data
                    this.$services.a3pain.pain(_self.launchModal.start_date, _self.launchModal.end_date, _self.patient.epicPatientId)
                        .then(response => {
                            try {
                            /*                                
                            mmeChartOptions.series[1] =  {
                                        "name": "Pain Score",
                                        "yAxis": 1,
                                        "color": "purple"
                            } ;
                            */
                            console.log("response from pain call") ;
                            console.log(response) ;
                            
                            this.resultText += "\n Result from Pain BQ Call " + JSON.stringify(response) ;        

                            mmeChartOptions.series[1].data = response.map(function(pn) { return { x: pn.recorded_time, y: pn.meas_value }}) ; ;
                            _self.mmeChartOptions = mmeChartOptions ;

                            this.resultText += "\n--------------------******MMECHARTOPTIONS after BQ Call only ***************************" ;
                            this.resultText += JSON.stringify(mmeChartOptions) ;
                            
                            } catch (err) {
                                this.resultText += "\nError in pain bq handler code :" + err ;                                    
                            }

                            this.resultText += "\n Before Invoking pain webservice data for csnids " + csnids ;

                            this.$services.a3pain.painwsdata(csnids, _self.patient.epicPatientId).then(presponses => {
                                try {
                                console.log("pain ws responses length " + presponses.length) ;
                                this.resultText += "\n------------------------------------Pain webservice response START " + presponses.length + "\n" ;
                                presponses.forEach(presponse => {
                                    this.resultText += "\n-------------- Pain ws response " + JSON.stringify(presponse) ;
                                    presponse.data.forEach(pn => {
                                        var rIdx = mmeChartOptions.series[1].data.findIndex(function(row) { return row.x == pn.recorded_time }) ;
                                        if (rIdx == -1)
                                            mmeChartOptions.series[1].data.push({x: pn.recorded_time, y: pn.meas_value}) ;                                        
                                    }) ;                                    
                                }) ;
                                
                                _self.mmeChartOptions = mmeChartOptions ;
                                this.resultText += "\n--------------------******MME CHARTOPTIONS after Pain WS Call***************************" ;
                                this.resultText += JSON.stringify(mmeChartOptions) ;
                                } catch (err) {
                                    this.resultText += "\nError in pain ws handler code :" + err ;                                    
                                }
                            }) ;
                        }) ;        
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
                //var categories = this.medChartOptions.yAxis[0].categories.map(function(cat) { return {name: cat, data: []}} ) ;
                var categories = this.medCategories.map(function(cat) { return {name: cat, data: []}} ) ;
                
                this.resultText += "\n In refreshMMEChart: Categories.... " + JSON.stringify(categories);

                this.marData.forEach(function (med) {
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

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                name: 'MME',
                type: 'line',
                title: '',
                height: 350,
                color: "green"
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
                    "opposite": true
                }        
            ] ; 
        
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

            chartOptions.tooltip.formatter = function () {
                var tip =  this.point.series.name + "<br>Dosage: " + this.point.dose + " " + this.point.unit + " <br> MME: " + this.point.y ;                
                return tip ;
            }
            return chartOptions ;

        },        
        getMedsChart(start_time_long, end_time_long) {

            var chartOptions = this.getDefaultChartConfig({
                start_time: start_time_long,
                end_time: end_time_long,
                min: 0,
                type: 'scatter',   //xrange 
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
