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
                            <b-col cols="2" class="pl-5">
                                Admitted: <b class="pl-2">{{patient.hospital_admission_time}}</b>
                            </b-col>
                            <b-col cols="4" class="pl-5">
                                Lab Result Dates: <b class="pl-2">{{patient.lab_result_min_date}} - {{patient.lab_result_max_date}}</b>
                            </b-col>
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
                                    :items="standingOrders" :fields="orderFields"
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
                                            :icon="row.detailsShowing ? 'arrow-up' : 'arrow-down'" 
                                            @click="row.toggleDetails"
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
import CalcResultDisplay from '~/components/CalcResultDisplay.vue' ;
import Highcharts from 'highcharts' ;

export default {
  components: { CalcResultDisplay },
    data() {
        return {
            patient: { length_of_stay: 0 },            
            standingOrders: [],
            orderFields: [
                {label: '', key: 'show_details'},
                {label: 'Order/Test (OrderId)', key:'display_name', sortable: false},
                {label: 'Frequency', key:'frequency', sortable: false},
                {label: '# of Blood draws', key: 'specimen_count', sortable: false, tdClass:'text-center'},
                {label: 'Graph', key: 'graph'},
                {label: 'Recent Values', key: 'recent_values'} ,
                {label: 'Predicted Utility', key: 'reevaluate'} ,
            ],
            compFields: [
                {label: 'Name', key: 'name'},
                {label: 'Graph', key: 'graph'},
                {label: 'Recent Values', key: 'recent_values'}
            ],
            loading: true
        }
    },
    async fetch() {
        console.log("In fetch method of the standing order page") ;

        this.$store.commit('setAppId', this.$services.standingorders.APP_ID) ;
        this.$store.commit('setPageTitle', "Inpatient Standing Orders Utility Assessment") ;
        this.$store.commit('setCurrentApp', { help : "standingorders-help-modal" }) ;
        this.$services.standingorders.dblog("StaindOrdersHome", "In Standing Orders Home Page") ;
        this.patient.hospitalized =  true ;
        try {
        this.patient = await this.$services.seal.patient(this.$services.standingorders.APP_ID) ;

        var response = await this.$services.standingorders.orders(this.patient.epicPatientId) ;
    
        this.patient.hospital_admission_time = response.hospital_admission_time ;
        this.patient.length_of_stay = response.length_of_stay ;
        this.patient.lab_result_min_date = response.min_result_date ;
        this.patient.lab_result_max_date = response.max_result_date ;

        this.patient.hospitalized = response.hospital_admission_time.length > 0 ;

        this.standingOrders = response.standing_orders ;
        } catch (err) {
            console.log("error before loop..." + err) ;
        }
        var totalSpecimenCount = 0 ;
        var recentCountMax = 3 ;
        console.log("looping thru standing orders") ;
        this.standingOrders.forEach(so => {
            try {
                console.log("process standiong order {}" , so) ;
            totalSpecimenCount += so.specimen_count ;
            so.components.forEach(comp => {
                var recentValues = [] ;
                var cnt = 0 ;                
                for (var i=comp.data.length - 1; i >=0; i--) {
                    if (cnt >= recentCountMax) break ;
                    //recentValues.push(comp.data[i].y);
                    recentValues.push("<span style='color:" + comp.data[i].color + "'>" + comp.data[i].y + "</span>");
                    cnt++ ;
                }
                comp.recent_values = recentValues.reverse().join(", ") ;
            }) ;
            if (so.components.length == 1) {
                so.data = so.components[0].data ;
                so.recent_values = so.components[0].recent_values ;                
            }
            console.log(so) ;
            } catch (err) {
                console.log("error :" + err) ;
            }
        }) ;

        this.patient.total_specimen_count = totalSpecimenCount ;
        this.loading = false ;

    },
    methods: {     
        onRowClick(item) {
            console.log("row clicked") ;
            if (item.components.length > 1)
                this.$set(item, "_showDetails", !item._showDetails) ;
        },
        reEvaluate(component) {
            return true ;
        },
        sparklineChart(component) {
            console.log("Sparklone Chart invoked for {}", component) ;
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
</script>


