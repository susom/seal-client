<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="standing_orders_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <!--
                <p class="pt-2">
                    Inpatient Standing Orders Assessment is an utility app developed by SEAL in partnership with Dr. Naveed (SHC). 
                <p>
                -->
                <p class="pt-2">
                    The Inpatient Standing Orders Utility Assessment is designed to help the care team assess which 
                    standing orders should be canceled due to low clinical utility. Canceling unnecessary standing orders 
                    reduces patient blood loss as well as saving money.
                </p>
                <p class="pt-2">
                    Abnormal results are <span style="color:red">red</span>, normal are <span  style="color:green">green</span>. 
                    Data shown in this report is up to 36 hours old. Click on panel name to see results.
                </p>
            </b-col>
        </b-row>
        <b-row class="ml-2">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg"  bg-variant="secondary">
                    <b-card-text>
                        <b-row>
                            <b-col cols="3" class="pl-5">
                                Admitted: <b class="pl-2">{{patient.hospital_admission_time}}</b>
                            </b-col>
                            <!--
                            <b-col cols="4" class="pl-5">
                                Lab Result Dates: <b class="pl-2">{{patient.lab_result_min_date}} - {{patient.lab_result_max_date}}</b>
                            </b-col>
                            -->
                            <b-col cols="3">
                                Length of stay: <b class="pl-2">{{patient.length_of_stay}} days</b>
                            </b-col>
                            <b-col cols="3">
                                # blood draws: <b class="pl-2">{{patient.total_specimen_count}}</b>
                            </b-col>                            
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row> 
        <b-row class="mt-3 ml-2">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title>Active Recurring Lab Orders</b-card-title>
                    <b-card-text>
                        <b-row align-content="center"  v-if="!loading && !patient.hospitalized">
                            <b-col style="text-align:center" class="h5 mt-3" offset="2" cols="7">
                                {{patient.fullName}} is not currently hospitalized. To see this app in action, please open an inpatient record.
                                <br><br>
                            </b-col>
                        </b-row>
                        <b-row v-else>                            
                            <b-col>
                                <b-table striped 
                                    :items="standingOrdersWithComponents" :fields="orderFields"
                                    small :busy="loading"
                                    selectable
                                    @row-clicked="onRowClick"
                                    hover
                                    show-empty
                                    >
                                    <template #table-busy>
                                        <div class="text-center text-primary my-2">
                                            <b-spinner class="align-middle"></b-spinner>
                                            <strong>Loading...</strong>
                                        </div>
                                    </template>
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">
                                            No active standing orders available for this patient.
                                        </h5>
                                    </template>                                     
                                    <template #cell(display_name)="row">
                                        {{row.item.display_name}}  ({{row.item.standing_order_id}})
                                    </template>
                                    <template #cell(recent_values)="data">
                                        <span v-html="data.value"></span>
                                    </template>
                                    <template #cell(show_details)="row">
                                        <!-- @click="row.toggleDetails" -->
                                        <b-icon 
                                            :icon="row.detailsShowing ? 'chevron-down' : 'chevron-up'"                                             
                                            font-scale="1.3"
                                            v-if="row.item.components.length > 1" />
                                    </template>
                                    <template #cell(graph)="row">
                                        <highchart :options="sparklineChart(row.item)" v-if="row.item.components.length == 1"/> 
                                    </template>
                                    <template #row-details="row">
                                        <b-card>
                                            <b-table striped :items="row.item.components" :fields="compFields" hover>
                                                <template #cell(graph)="irow">
                                                    <highchart :options="sparklineChart(irow.item)" />                                                    
                                                </template>
                                                <template #cell(recent_values)="irow">
                                                    <span v-html="irow.value"></span>
                                                </template>                                                
                                            </b-table>
                                        </b-card>
                                    </template>
                                </b-table>                                
                            </b-col>                        
                        </b-row>
                        <!--
                        <b-row>
                            <b-col>
                                <highchart :options="localChart()" />                                                        
                            </b-col>
                        </b-row>                        
                        -->
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
        <b-modal id="standingorders-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
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

export default {  
    data() {
        return {
            patient: { length_of_stay: 0 },            
            standingOrders: [],
            orderFields: [
                {label: '', key: 'show_details'},
                {label: 'Order/Test (OrderId)', key:'display_name', sortable: false},
                {label: 'Frequency', key:'frequency', sortable: false},
                {label: '# of Blood draws', key: 'specimen_count', sortable: false, tdClass:'text-center', thClass:'text-center'},
                {label: 'Graph', key: 'graph'},
                {label: 'Recent Values', key: 'recent_values'} ,
                {label: 'Predicted Normal', key: 'prediction_perc', tdClass:'text-center'}
            ],
            compFields: [
                {label: 'Name', key: 'name'},
                {label: 'Graph', key: 'graph'},
                {label: 'Recent Values', key: 'recent_values'},
                {label: 'Predicted Normal', key: 'prediction_perc', tdClass:'text-center', thClass:'text-center'}
            ],
            loading: true,
            predictions: {},
            showDebug: false,
            resultText: ""
        }
    },    
    async fetch() {
        console.log("In fetch method of the standing order page") ;
        
        var _self = this ;

        this.$store.commit('setAppId', this.$services.standingorders.APP_ID) ;
        this.$store.commit('setPageTitle', "Inpatient Standing Orders Utility Assessment") ;
        this.$store.commit('setCurrentApp', { help : "standingorders-help-modal" }) ;
        this.$services.standingorders.dblog("StandingOrdersHome", "In Standing Orders Home Page") ;
        this.patient.hospitalized =  true ;

        this.patient = await this.$services.seal.patient(this.$services.standingorders.APP_ID) ;
        
        this.predictions = await this.$services.standingorders.predictions() ;
        console.log("predictions data") ;
        console.log(this.predictions) ;
        
        this.resultText = "" ;
        this.log("Invoking standing orders") ;
        var response = await this.$services.standingorders.orders(this.patient.epicPatientId) ;
        this.log("Got standing orders...") ;

        if (response.hospital_admission_time) {
            this.patient.hospital_admission_time = response.hospital_admission_time ;
            this.patient.length_of_stay = response.length_of_stay ;
            this.patient.min_order_date = response.min_order_date ;
            //this.patient.lab_result_min_date = response.min_result_date ;
            //this.patient.lab_result_max_date = response.max_result_date ;

            this.patient.hospitalized = response.hospital_admission_time.length > 0 ;
        }
        this.standingOrders = response.standing_orders ;

        var totalSpecimenCount = 0 ;        

        console.log("Before going into for loop for standing orders...") ;
        //var loincCodes = this.standingOrders.map(so => so.components.map(c => c.loinc_code).join(",")).join(",")
        for (var sIdx=0; sIdx<this.standingOrders.length; sIdx++) {
            var so = this.standingOrders[sIdx] ;
            
            so.display = true ;
            totalSpecimenCount += so.specimen_count ;            
            var loincCodes = so.components.map(c => c.loinc_code).join(",") ;            
            
            this.log("Lab data for Standing order " + so.display_name + "(" + so.standing_order_id + " min:" + so.order_time + ") loinc: " + loincCodes ) ;

            this.processLabData(loincCodes, so) ;
        }

        console.log("After going into for loop for standing orders...") ;
        this.patient.total_specimen_count = totalSpecimenCount ;
        console.log("Set loadidng to false") ;
        this.loading = false ;
    },
    computed: {
        standingOrdersWithComponents () {
            return this.standingOrders.filter(ord => ord.display ) ;
        }
    },
    methods: {    
        log(mesg) {
            this.resultText += "\n" + this.$moment().format("LTS") + ": " + mesg ;
        },
        onRowClick(item) {
            console.log("row clicked") ;
            if (item.components.length > 1)
                this.$set(item, "_showDetails", !item._showDetails) ;
        },
        async processLabData(loincCodes, standingOrder, nextUrl) {
            var _self = this ;
            this.$services.standingorders.labdata(this.patient.epicPatientId, loincCodes, standingOrder.order_time, nextUrl).then (function (response) {
                var labdata = response.labdata ;
                _self.log("Got response to standing order :" + standingOrder.standing_order_id + " len: " + labdata.length) ;
                labdata.forEach(res => {
                    var idx = standingOrder.components.findIndex(comp => comp.loinc_code == res.loinc_code) ;
                    if (idx < 0) 
                        _self.log("This shouldn't happen - can't find loinc code :" + res.loinc_code + ": in standing order :" + standingOrder.display_name) ;
                    else {
                        res.color = (res.result == "")?"green":"red" ;
                        res.result_days = _self.$moment().diff(_self.$moment(new Date(res.result_time)), "days") ;
                        standingOrder.components[idx].data.push(res) ;
                    }
                }) ;
                _self.log("Next URL :" + response.nextUrl) ;
                if (response.nextUrl) {
                    _self.processLabData(loincCodes, standingOrder, response.nextUrl) ;
                } else {  // done fetching all labs data - now process the standing order
                    _self.processComponents(standingOrder) ;
                }
            }) ;
        },
        processComponents(so) {
            var recentCountMax = 3 ;            
            so.components.forEach(comp => {
                this.log("Processing component " + comp.name + " for standing order " + so.standing_order_id) ;
                var recentValues = [] ;
                var cnt = 0 ; 
                if (comp.data.length == 0) return ;                    
                var resultDays = comp.data[comp.data.length - 1].result_days ;
                var prevConseqPositives = 0 ;
                var negativeFound = false ; 
                for (var i=comp.data.length - 1; i >=0; i--) {
                    if (cnt < recentCountMax) {
                        recentValues.push("<span style='color:" + comp.data[i].color + "'>" + comp.data[i].y + "</span>");
                    }
                    if ( i == comp.data.length || !negativeFound)
                        negativeFound = (comp.data[i].result.trim().length > 0) ;
                    
                    if (!negativeFound) {
                        prevConseqPositives++ ;
                    }                    
                    cnt++ ;
                }    
                
                if (prevConseqPositives > 5) prevConseqPositives = 5 ;

                var compNameLower = comp.name.toLowerCase() ;
                //console.log("component :" + comp.name.toLowerCase() + ": result days :" + resultDays + " prevConseqPos :" + prevConseqPositives) ;
                if (this.predictions[compNameLower]) {
                    for (var j=0;j<this.predictions[compNameLower].length;j++) {
                        if (this.predictions[compNameLower][j].window_size >= resultDays) {
                            var leastWindowSize = this.predictions[compNameLower][j].window_size ;
                            //console.log("window size :" + leastWindowSize) ;
                            var wsizes = this.predictions[compNameLower].filter(ws => ws.window_size == leastWindowSize) ;
                            var predIdx = wsizes.findIndex(sz => sz.prev_consecutive_normal == prevConseqPositives) ;
                            if (predIdx > -1) {                            
                                comp.prediction_perc = Math.round(wsizes[predIdx].prediction_rate) + ' %' ;
                                //console.log("Pred Perc :" + comp.prediction_perc) ;
                            }
                            break ;
                        } 
                    }
                } else {
                    this.log("Predictions Do not exist for :" + compNameLower + ":") ;
                }
                comp.recent_values = recentValues.reverse().join(", ") ;
            }) ;

            this.log("Processing components for predictions - end") ;
            
            if (so.components.length == 1) {
                so.data = so.components[0].data ;
                so.recent_values = so.components[0].recent_values ; 
                so.prediction_perc = so.components[0].prediction_perc ;
            }                    
            this.$set(so, "_showDetails", false) ; // triggers the chart display
                
            so.components = so.components.filter(comp => comp.data.length > 0) ;
            so.display = so.components.length > 0 ;            
        },
        sparklineChart(component) {
            //console.log("Sparklone Chart invoked for {}", component) ;
            var chartOptions = {
                chart: {
                    backgroundColor: null,
                    borderWidth: 0,
                    type: 'line',
                    margin: [2, 0, 2, 0],
                    width: 150,
                    height: 40,
                    style: {
                        overflow: 'visible'
                    },
                    // small optimalization, saves 1-2 ms each sparkline
                    skipClone: true
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },                
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    //startOnTick: false,
                    //endOnTick: false,
                    //tickPositions: []
                },
                yAxis: {
                    //endOnTick: false,
                    //startOnTick: false,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    //tickPositions: [0]
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    hideDelay: 0,
                    outside: true,
                    shared: false
                },
                plotOptions: {
                    series: {
                        animation: true,
                        lineWidth: 2,
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 2
                            }
                        },
                        marker: {
                            radius: 3,
                            states: {
                                hover: {
                                    radius: 3
                                }
                            }
                        },
                        fillOpacity: 0.25
                    },
                    //column: {
                    //    negativeColor: '#910000',
                    //    borderColor: 'silver'
                    //}
                }
            } ;
            chartOptions.tooltip.useHTML = true ;
            chartOptions.tooltip.formatter = function () {            
                var tip =  this.point.y + " " + this.point.result_unit + (this.point.result == ""?"":" - " + this.point.result) ;                        
                tip += "<br><span style='font-size:smaller'>" + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.result_time) + "</span>" ;

                return tip ;
            } ;            
            chartOptions.series = [{
                        data: component.data ,
                        //pointStart: 1
                    }] ;
            console.log("chartoptions for " + (component.display_name?component.display_name:component.name)) ;
            //console.log(JSON.stringify(chartOptions)) ;

            return chartOptions ;
        },
        localChart() {
            var co = {
                "chart": {
                    //"backgroundColor": null,
                    "borderWidth": 0,
                    "type": "line",
                    "margin": [2,0,2,0],
                    "width": 120,
                    "height": 50,
                    "style": {
                        "overflow": "visible"
                    },
                    "skipClone": true
                },
                "title": {
                    "text": ""
                },
                "credits": {
                    "enabled": false
                },
                exporting: {
                    enabled: false
                },
                "xAxis": {
                    "labels": {
                        "enabled": false
                    },
                    "title": {
                        "text": null
                    },
                    //"startOnTick": false,
                    //"endOnTick": false,
                    //"tickPositions": []
                },
                "yAxis": {
                    //"endOnTick": false,
                    //"startOnTick": false,
                    "labels": {
                        "enabled": false
                    },
                    "title": {
                        "text": null
                    },
                    //"tickPositions": [
                    //    0
                    //]
                },
                "legend": {
                    "enabled": false
                },
                "tooltip": {
                    "hideDelay": 0,
                    "outside": true,
                    "shared": false,
                    //"headerFormat": "",
                    //"pointFormat": "<b>{point.y} - {point.result == ''?'Normal':point.result}</b>"
                },
                "plotOptions": {
                    "series": {
                        "animation": true,
                        "lineWidth": 2,
                        "shadow": true,
                        "states": {
                            "hover": {
                                "lineWidth": 2
                            }
                        },
                        "marker": {
                            "radius": 3,
                            "states": {
                                "hover": {
                                    "radius": 3
                                }
                            }
                        },
                        "fillOpacity": 0.25
                    },
                    //"column": {
                    //    "negativeColor": "#910000",
                    //    "borderColor": "silver"
                    //}
                },
                "series": [
                    {
                        "data": [
                            {y:133, result: "Low", color: "red"},
                            {y:136, result:""},
                            {y:135, result:""},
                            {y:137, result:"High", color: "red"},
                            {y:134, result:""},
                            {y:137, result:"High", color: "red"},
                            {y:136, result:""}
                        ],                         
                    }
                ]
            } ;
            co.tooltip.formatter = function () {            
                var tip =  this.point.y + (this.point.result == ""?"":" - " + this.point.result) ;                        
                return tip ;
            } ;

            return co ;
        }
    }
}

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

</script>


