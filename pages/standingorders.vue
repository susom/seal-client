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
                <!--
                <p class="pt-2">
                    The Inpatient Standing Orders Utility Assessment is designed to help the care team assess which 
                    standing orders should be canceled due to low clinical utility. Canceling unnecessary standing orders 
                    reduces patient blood loss as well as saving money.
                </p>
                <p class="pt-2">
                    Abnormal results are <span style="color:red">red</span>, normal are <span  style="color:green">green</span>. 
                    Data shown in this report is up to 36 hours old. Click on panel name to see results.
                </p>
                -->
                <p class="mt-2">
                    Recurring Orders Dashboard App helps flags (<b-icon icon="flag-fill" font-scale="1" variant="info "/>)     recurring orders that might be canceled because they are predicted to be normal on the 
                    next blood draw. As always, use your clinical judgment to determine the best care plan for your patient.
                </p>
                <p>
                    <ul>
                        <li>Benefits: Reduce patient blood loss and discomfort, preserve blood tubes during the current national shortage, and reduce healthcare cost</li>
                        <li>Click <b-link style="color:blue">here</b-link> more information on the prediction mode </li>
                    </ul>
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
                    <b-card-title>Recurring Lab Orders with Predictions</b-card-title>
                    <b-card-text>
                        <b-row align-content="center"  v-if="!loading && !patient.hospitalized">
                            <b-col style="text-align:center" class="h5 mt-3" offset="2" cols="7">
                                {{patient.fullName}} is not currently hospitalized. To see this app in action, please open an inpatient record.
                                <br><br>
                            </b-col>
                        </b-row>
                        <b-row v-else>                            
                            <b-col>
                                <div class="text-center text-primary my-2" v-if="loading">
                                    <b-spinner class="align-middle"></b-spinner>
                                    <strong>Loading...</strong>
                                </div>                                
                                <div class="text-center h5 my-2" v-if="!loading && panelOrders.length + nonPanelOrders.length == 0">
                                    No active recurring orders available for this patient.
                                </div>                                                                
                                <b-table striped 
                                    :items="panelOrders" :fields="panelOrderFields"
                                    small
                                    selectable
                                    @row-clicked="onRowClick"
                                    hover
                                    show-empty
                                    v-if="panelOrders.length > 0"
                                    >
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">
                                            No active panel recurring orders available for this patient.
                                        </h5>
                                    </template>                                     
                                    <template #cell(display_name)="row">
                                        <b-icon icon="flag-fill" font-scale="1" variant="info" class="mr-1" v-if="row.item.prediction_perc > 85"/> {{row.item.display_name}}
                                    </template>
                                    <template #cell(recent_values)="data">
                                        <span v-html="data.value"></span>
                                    </template>
                                    <template #cell(show_details)="row">
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
                                                <template #cell(name)="irow">
                                                    <b-icon icon="flag-fill" font-scale="1" variant="info" class="mr-1" v-if="irow.item.prediction_perc > 85"/> {{irow.item.name}} 
                                                </template>                                                
                                                <template #cell(graph)="irow">
                                                    <highchart :options="sparklineChart(irow.item)" />                                                    
                                                </template>
                                                <template #cell(recent_values)="irow">
                                                    <span v-html="irow.value"></span>
                                                </template>       
                                                <template #cell(prediction_perc)="irow">
                                                    {{irow.value ? irow.value + " %":""}}
                                                </template>                                                                                                                                 
                                            </b-table>
                                        </b-card>
                                    </template>
                                </b-table> 
                                <b-table striped 
                                    :items="nonPanelOrders" :fields="orderFields"
                                    small
                                    selectable
                                    hover      
                                    show-empty                              
                                    v-if="nonPanelOrders.length > 0"
                                    >
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">
                                            No active non panel recurring orders available for this patient.
                                        </h5>
                                    </template>                                     
                                    <template #cell(display_name)="row">
                                        <b-icon icon="flag-fill" font-scale="1" class="mr-1" variant="info" v-if="row.item.prediction_perc > 85"/> {{row.item.display_name}}
                                    </template>
                                    <template #cell(recent_values)="data">
                                        <span v-html="data.value"></span>
                                    </template>
                                    <template #cell(graph)="row">
                                        <highchart :options="sparklineChart(row.item)" v-if="row.item.components.length == 1"/> 
                                    </template>
                                    <template #cell(prediction_perc)="row">
                                        {{row.value ? row.value + " %":""}}
                                    </template>                                        
                                </b-table>     

                                <!--                                 
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
                                -->                                
                            </b-col>                        
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="mt-3 ml-2" v-if="nonPredictedOrders.length > 0">
            <b-col cols="11">
                <b-card class="shadow-lg rounded-lg">
                    <b-card-title>Recurring Lab Orders without Predictions</b-card-title>
                    <b-card-text>
                        <b-table striped 
                            :items="nonPredictedOrders" :fields="nonPredictedOrderFields"
                            small
                            selectable                                    
                            hover
                            v-if="nonPredictedOrders.length > 0"
                            >
                            <template #cell(display_name)="row">
                                {{row.item.display_name}}
                            </template>
                            <template #cell(recent_values)="data">
                                <span v-html="data.value"></span>
                            </template>
                            <template #cell(graph)="row">
                                <highchart :options="sparklineChart(row.item)" v-if="row.item.components.length == 1"/> 
                            </template>
                        </b-table>                        
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
            predictedComponentCodes: [],
            predictedPanelCodes: [],
            orderFields: [
                {label: '', key: 'show_details'},
                {label: 'Order Name', key:'display_name', sortable: false},
                {label: 'Frequency', key:'frequency', sortable: false},
                {label: '# of Blood draws', key: 'specimen_count', sortable: false, tdClass:'text-center', thClass:'text-center'},
                {label: 'Graph', key: 'graph'},
                {label: 'Recent Values', key: 'recent_values'} ,
                {label: 'Predicted Normal', key: 'prediction_perc', tdClass:'text-center'}
            ],
            nonPredictedOrderFields: [                
                {label: 'Order Name', key:'display_name', sortable: false},
                {label: 'Frequency', key:'frequency', sortable: false},
                {label: '# of Blood draws', key: 'specimen_count', sortable: false, tdClass:'text-center', thClass:'text-center'},
                {label: 'Graph', key: 'graph'},
                {label: 'Recent Values', key: 'recent_values'}
            ],
            panelOrderFields: [
                {label: '', key: 'show_details'},
                {label: 'Order Name', key:'display_name', sortable: false},
                {label: 'Frequency', key:'frequency', sortable: false},
                {label: '# of Blood draws', key: 'specimen_count', sortable: false, tdClass:'text-center', thClass:'text-center'}                
            ],            
            compFields: [
                {label: 'Laboratory Test', key: 'name'},
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

        this.$store.commit('setAppId', this.$services.standingorders.APP_ID) ;
        this.$store.commit('setPageTitle', "Recurring Orders Dashboard") ;
        this.$store.commit('setCurrentApp', { help : "standingorders-help-modal" }) ;
        this.$services.standingorders.dblog("StandingOrdersHome", "In Standing Orders Home Page") ;
        
        var _self = this ;

        this.patient.hospitalized =  true ;

        this.patient = await this.$services.seal.patient(this.$services.standingorders.APP_ID) ;
        
        this.predictions = await this.$services.standingorders.predictions() ;
        console.log("predictions data") ;
        console.log(this.predictions) ;
        
        this.resultText = "" ;
        this.log("Invoking standing orders") ;
        var response = await this.$services.standingorders.orders(this.patient.epicPatientId) ;
        this.log("Got standing orders...") ;
        this.predictedComponentCodes = response.predictedComponentCodes ;
        this.predictedPanelCodes = response.predictedPanelCodes ;

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
        this.log("Predicted Panel Codes") ;
        this.log(JSON.stringify(this.predictedPanelCodes)) ;
        this.log("Predicted Panel Compo") ;
        this.log(JSON.stringify(this.predictedComponentCodes)) ;

        //var loincCodes = this.standingOrders.map(so => so.components.map(c => c.loinc_code).join(",")).join(",")
        for (var sIdx=0; sIdx<this.standingOrders.length; sIdx++) {
            try {
            var so = this.standingOrders[sIdx] ;
            
            this.log("Standing Order :" + so.display_name + " Proc Code:" + so.proc_code + ":  index :" + (this.predictedPanelCodes.indexOf(so.proc_code))) ;
            so.predicted = (this.predictedPanelCodes.indexOf(so.proc_code) >= 0) ;

            so.display = false ;
            totalSpecimenCount += so.specimen_count ;
            so.components.forEach(comp => {
                comp.predicted = (_self.predictedComponentCodes.indexOf(comp.base_name) >= 0) ;
            })
            
            // get loinc code only for panels with components whose predict is true
            // if it is a single order, then get all loinc codes
            var loincCodes = [] ;
            if (so.predicted)
                loincCodes = so.components.filter(c => c.predicted).map(c => c.loinc_code).join(",") ;
            else if (so.components.length == 1)
                loincCodes = so.components.map(c => c.loinc_code).join(",") ;
                
            //var loincCodes = so.components.filter(c => c.predicted).map(c => c.loinc_code).join(",") ;            
            //var loincCodes = so.components.map(c => c.loinc_code).join(",") ;            
            
            this.log("Lab data for Standing order " + so.display_name + "(" + so.standing_order_id + " min:" + so.order_time + ") loinc: " + loincCodes ) ;
            if (loincCodes.length > 0) {
                so.display = true ;
                this.processLabData(loincCodes, so) ;                
            }

            } catch (err) {
                _self.log("Error in for standing orders for loop1 : " + err) ;
            }
        }

        console.log("After going into for loop for standing orders...") ;
        this.patient.total_specimen_count = totalSpecimenCount ;
        console.log("Set loadidng to false") ;
        this.loading = false ;
    },
    computed: { 
        nonPredictedOrders() {
            return this.standingOrders.filter(ord => ord.display && !ord.predicted) ;
        },
        standingOrdersWithComponents () {
            return this.standingOrders.filter(ord => ord.display ) ;
        },
        panelOrders() {
            return this.standingOrders.filter(ord => ord.display && ord.components.length > 1 && ord.predicted ) ;
        },
        nonPanelOrders() {
            return this.standingOrders.filter(ord => ord.display && ord.components.length == 1 && ord.predicted) ;
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
            try {
            var recentCountMax = 3 ;        
            var _self = this;     
            so.components.forEach(comp => {
                try {
                this.log("Processing component " + comp.name + " for standing order " + so.standing_order_id) ;
                var recentValues = [] ;
                var cnt = 0 ; 
                for (var i=comp.data.length - 1; i >=0; i--) {
                    if (cnt < recentCountMax) {
                        recentValues.push("<span style='color:" + comp.data[i].color + "'>" + comp.data[i].y + "</span>");
                        cnt++ ;
                    } else {
                        break ;
                    }
                } 

                var prevConseqPositives ;
                // if no lab data or no lab data in last 7 days - set it to null condition - which is -1 in database
                if (comp.data.length == 0 || _self.$moment().diff(_self.$moment(new Date(comp.data[comp.data.length - 1].result_time)), "days") > 7)
                    prevConseqPositives = -1 ;
                else {                
                    prevConseqPositives = 0 ;  // this means there is a lab result but no positives yet
                    for (var i=comp.data.length - 1; i >=0; i--) {
                        // negative result or result is before 7 days
                        if (comp.data[i].result.trim().length > 0 || _self.$moment().diff(_self.$moment(new Date(comp.data[comp.data.length - 1].result_time)), "days") > 7 ) { 
                            break ;
                        }
                        prevConseqPositives++ ;
                    }
                }

                if (prevConseqPositives > 7) prevConseqPositives = 7 ;

                var baseName = comp.base_name.toLowerCase() ;
                //console.log("component :" + comp.name.toLowerCase() + ": result days :" + resultDays + " prevConseqPos :" + prevConseqPositives) ;
                if (this.predictions[baseName]) {
                    var predictions = this.predictions[baseName] ;
                    var predIdx = predictions.findIndex(pred => pred.prev_consecutive_normal == prevConseqPositives) ;
                    if (predIdx > -1) {                            
                        comp.prediction_perc = Math.round(predictions[predIdx].prediction_rate) ; // + ' %' ;
                    }
                } else {
                    this.log("Predictions Do not exist for :" + baseName + ":") ;
                }
                comp.recent_values = recentValues.reverse().join(", ") ;
                } catch (err) {
                  this.log("****Error in processComponents (foreach) for standing order :" + so.display_name + " : " + err) ;  
                }
            }) ;

            this.log("Processing components for predictions - end") ;
            
            if (so.components.length == 1) {
                so.data = so.components[0].data ;
                so.recent_values = so.components[0].recent_values ; 
                so.prediction_perc = so.components[0].prediction_perc ;   
                so.predicted = so.predicted || so.components[0].predicted ; // single row non panel orders
            }                    
            this.$set(so, "_showDetails", false) ; // triggers the chart display
                
            so.components = so.components.filter(comp1 => comp1.data.length > 0) ;
            so.components.forEach(comp => {
                comp.name = comp.name.replace(/\, ser\/plas/i, '') ;
                comp.name = comp.name.replace(/\,ser\/plas/i, '') ;
            }) ;
            
            so.display_name = so.display_name.replace(/\, serum\/plasma/i, '') ;
            so.display_name = so.display_name.replace(/\,serum\/plasma/i, '') ;

            so.display = so.components.length > 0 ; 
            this.log("******Processed standing order") ;            
            this.log(JSON.stringify(so)) ;  
            } catch (err) {
                this.log("****Error in processComponents for standing order :" + so.display_name + " : " + err) ;
            }          
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


