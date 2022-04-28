<template>
    <!-- eslint-disable -->
    <b-container fluid>
        <b-row>
            <b-col cols="10">
                <p class="mt-2">
                    SEAL Dashboard
                </p>
            </b-col>
        </b-row>
        <b-row>
            <b-col offset="1" cols="10">
                <b-card-group deck>
                    <b-card bg-variant="success" text-variant="white" header="Total Visits" class="text-center">
                        <b-card-text>
                            <b-row>
                                <b-col>Last Month</b-col>
                                <b-col>Current Month</b-col>
                            </b-row>                            
                            <b-row class="counts">
                                <b-col>{{counts.last_total_login}}</b-col>
                                <b-col>{{counts.current_total_login}}</b-col>
                            </b-row>
                        </b-card-text>
                    </b-card>
                    <b-card bg-variant="primary" text-variant="white" header="Unique Users" class="text-center">
                        <b-card-text>
                            <b-row>
                                <b-col>Last Month</b-col>
                                <b-col>Current Month</b-col>
                            </b-row>                            
                            <b-row class="counts">
                                <b-col>{{counts.last_unique_users}}</b-col>
                                <b-col>{{counts.current_unique_users}}</b-col>
                            </b-row>                            
                        </b-card-text>
                    </b-card>
                    <b-card bg-variant="info" text-variant="white" header="New Users" class="text-center">
                        <b-card-text>
                            <b-row>
                                <b-col>Last Month</b-col>
                                <b-col>Current Month</b-col>
                            </b-row>                            
                            <b-row class="counts" style="color:white">
                                <b-col>{{counts.last_new_users}}</b-col>
                                <b-col>{{counts.current_new_users}}</b-col>
                            </b-row>                            
                        </b-card-text>
                    </b-card>
                </b-card-group>                
            </b-col>
        </b-row>
        <!--
        <b-row class="mt-3">            
            <b-col cols="10" offset="1">                
                <b-card color="green">
                    <b-card-title>
                        <b-row>
                            <b-col style="text-align:left">
                                Seal App Views
                            </b-col>
                            <b-col style="text-align:right;font-size:.65em">
                                <b-btn size="sm" @click="viewTableData">View Data</b-btn>  View Chart By <b-form-select style="width:40%" size="sm" class="ml-3" :options="['Total Views', 'Unique Users', 'Unique Patients']" 
                                    v-model="statsViewBy" @change="updateChartSeries" />
                            </b-col>
                        </b-row>
                    </b-card-title>
                    <b-card-text>
                        <highchart                             
                            :options="chartOptions"
                            :modules="['exporting', 'export-data']"
                            ref="myChart"                             
                             />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        -->
        <b-row class="mt-3">            
            <b-col cols="10" offset="1">                
                <b-card color="green">
                    <b-card-title>
                        <b-row>
                            <b-col style="text-align:left" cols="2">
                                <editable-date-picker :required="true" v-model="startdate" />
                            </b-col>
                            <b-col style="text-align:left" cols="2">                                
                                <editable-date-picker :required="true" v-model="enddate" />
                            </b-col>
                            <b-col style="text-align:left" cols="2">                                
                                <b-form-select size="sm" :options="[{ text: 'Group By Month', value: 'yyyy-mm'}, { text: 'Group By Year', value: 'yyyy'}]"
                                    v-model="groupBy" @change="fetchChartData"/>
                            </b-col>                            
                            <b-col style="text-align:right;font-size:.65em">
                                View Chart By <b-form-select style="width:40%" size="sm" class="ml-3" :options="['Total Views', 'Unique Users', 'Unique Patients']" 
                                    v-model="statsViewBy" @change="updateChartSeries2" />
                            </b-col>
                        </b-row>
                    </b-card-title>
                    <b-card-text>
                        <highchart                             
                            :options="chartOptions2"
                            :modules="['offline-exporting', 'export-data']"
                            ref="myChart"                            
                             />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3">            
            <b-col cols="5" offset="1">                
                <b-card title="Top 10 Users for last 30 days">
                    <b-card-text>                        
                         <b-table striped :fields="top10Fields" :items="top10" small />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3 ml-2 mb-3" v-if="$store.getters.sealTeam">
            <b-col cols="10" offset="1">
                <b-link @click="showDebug = !showDebug" style="font-size:small">Logs Link</b-link>
                <b-card v-show="showDebug">                    
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
import EditableDatePicker from '~/components/EditableDatePicker.vue';

/* eslint-disable */

export default {
  components: { EditableDatePicker },
    data () {
        return {
            appstats: [],            
            //chartseries: [],
            chartseries2: [],
            chartOptionCategories: [],
            startdate: '',
            enddate: '',
            groupBy: '',
            statsViewBy: "Total Views",
            counts: [{total_login: 0, unique_users: 0, new_users: 0}, {total_login: 0, unique_users: 0, new_users: 0}]  ,
            top10: [],
            top10Fields: [
                {key: 'user_id', label: 'ID', sortable: false},
                {key: 'full_name', label: 'Name', sortable: false},
                {key: 'total_login', label: '# of logins', sortable: false},
            ],
            showDebug: false,
            resultText: '',
            initApp: true
        }
    },
    async fetch() {

        console.log("In mounted method of the dashboard tab page") ;        
        this.$store.commit('setAppId', 6) ;
        this.$services.a3pain.dblog("DashboardHome", "In Dashboard Home Page") ;
        this.$store.commit('setPageTitle', "SEAL Dashboard") ;

        //this.appstats = await this.$services.dashboard.appstats() ;
        //this.updateChartSeries() ;
        this.log("In mounted method - before calling teh services to get counts") ;
        
        this.counts = await this.$services.dashboard.counts() ;

        this.log("In mounted method - before calling teh services to get top10") ;

        this.top10 = await this.$services.dashboard.top10() ;

        this.log("Got the top 10 result... " + JSON.stringify(this.top10)) ;

        //this.startdate = this.$moment().add(-1, 'years').format("MM/DD/YYYY") ;
        this.startdate = this.$moment().startOf('year').format("MM/DD/YYYY") ;
        this.enddate = this.$moment().format("MM/DD/YYYY") ;
        this.groupBy = 'yyyy-mm' ;

        this.log("In mounted method - before calling fetchchartdata") ;
        
        this.fetchChartData() ; 

    },
    watch: {
        startdate: function(newval) {
            console.log("New start date :" + newval + " initApp " + this.initApp) ;
            if (!this.initApp)
                this.fetchChartData() ;
        }, 
        enddate: function(newval) {
            if (!this.initApp)
                this.fetchChartData() ;
        }
    },
    computed : {
        chartOptions() {
            return {
                chart: {
                    type: 'column',
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
                                },
                            },
                            {
                                text: 'Show Table',
                                onclick: function() {
                                    try {
                                    console.log("Inside Show table method") ;
                                    if (this.dataTableDiv) console.log(this.dataTableDiv.style.display) ;
                                    if (this.dataTableDiv && this.dataTableDiv.style.display !== 'none') {
                                        this.dataTableDiv.style.display = 'none';
                                    } else {
                                        this.viewData();
                                        this.dataTableDiv.style.display = '';
                                    }    
                                    } catch (err) {
                                        console.log("Error in show table : " + err) ;
                                    }
                                },                                
                            },
                            {
                                text: 'Print Table',
                                onclick: function() {
                                    var divContents = this.dataTableDiv.innerHTML;
                                    var a = window.open('', '', 'height=500, width=500');
                                    a.document.write('<html>');
                                    a.document.write('<body>');
                                    a.document.write(divContents);
                                    a.document.write('</body></html>');
                                    a.document.close();
                                    a.print();
                                }
                            } ]
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
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec'
                    ],
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Views'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        dataLabels: {
                            enabled: true,  
                        }
                    }
                },
                series: this.chartseries           
            } ;
        },
        chartOptions2() {
            var _self = this ;
            return {
                chart: {
                    type: 'column',
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
                                },
                            },
                            {
                                text: 'View Tabular Data',
                                onclick: function() {
                                    _self.viewTableData() ;
                                }
                            } ]
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
                    text: ''
                },
                xAxis: {
                    categories: this.chartOptionCategories,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Views'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0;text-align:left"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        dataLabels: {
                            enabled: true,  
                        }
                    }
                },
                series: this.chartseries2           
            } ;
        }        
    },
    methods : {
        viewTableData() {
            try {
                this.log("In viewTableData method....") ;
                var hChart = this.$refs.myChart.chart ;
                hChart.isDataTableVisible = false ;
                if (hChart.dataTableDiv) {
                    hChart.dataTableDiv.parentNode.removeChild(hChart.dataTableDiv);  
                    //hChart.dataTableDiv.remove() ;
                    hChart.dataTableDiv = undefined;
                }
                hChart.viewData() ;
                var caption = hChart.dataTableDiv.querySelector(".highcharts-table-caption") ;
                caption.innerHTML = "SEAL " + this.statsViewBy + " from " + this.startdate + " to " + this.enddate + " - Grouped by " 
                                    + (this.groupBy == 'yyyy'?'year':'month') ;
            } catch (err) {
                this.log("err in viewtabledata method :" + err) ;
            }
        },
        printTableData() {
            var divContents = this.dataTableDiv.innerHTML;
            var a = window.open('', '', 'height=500, width=500');
            a.document.write('<html>');
            a.document.write('<body>');
            a.document.write(divContents);
            a.document.write('</body></html>');
            a.document.close();
            a.print();
        },
        log(mesg) {
            this.resultText += '\n' + mesg ;            
        },
        /*
        updateChartSeries () {
            var _self = this ;
            
            this.appstats.forEach(function(stat) {
                var cIdx = _self.chartseries.findIndex(function (cs) { return (cs.name == stat.app) }) ;
                if (cIdx < 0) {                
                    cIdx = _self.chartseries.length;
                    _self.chartseries.push({ name: stat.app, data: [0,0,0,0,0,0,0,0,0,0,0,0] }) ;                
                }
                if (_self.statsViewBy == 'Total Views')                    
                    _self.$set(_self.chartseries[cIdx].data, parseInt(stat.mm) - 1, parseInt(stat.total_visit)) ;                    
                else if (_self.statsViewBy == 'Unique Users')
                    _self.$set(_self.chartseries[cIdx].data, parseInt(stat.mm) - 1, parseInt(stat.unique_users)) ;
                else if (_self.statsViewBy == 'Unique Patients')
                    _self.$set(_self.chartseries[cIdx].data, parseInt(stat.mm) - 1, parseInt(stat.unique_patients)) ;
            });
            
            var hChart = this.$refs.myChart.chart ;
            console.log("Inside update series") ;
            if (hChart.dataTableDiv) {
                console.log(hChart.dataTableDiv.style.display) ;
                hChart.dataTableDiv.remove() ;
                //hChart.dataTableDiv.style.display = "none" ;
                this.$refs.myChart.chart.viewData()  ;
            } else {
                console.log("datatablediv is not visible") ;
            }            
        },
        */
        async fetchChartData() {
            this.log("Inside fetchChartData method..." + this.startdate + " to " + this.enddate + " group: " + this.groupBy) ;
            this.appstats2 = await this.$services.dashboard.appstats2(this.startdate, this.enddate, this.groupBy) ;
            this.updateChartSeries2() ;
        },
        async updateChartSeries2 () {

            this.log("Inside updateChartSeries2 Method") ;

            var _self = this ;
            var cats = [] ;
            
            this.chartseries2 = [] ;

            this.appstats2.forEach(function(stat) {
                if (cats.indexOf(stat.cat) < 0) cats.push(stat.cat) ;
            }) ;
            console.log("Categories: " + cats) ;
            this.chartOptionCategories = cats ;

            this.appstats2.forEach(function(stat) {
                try {
                var cIdx = _self.chartseries2.findIndex(function (cs) { return (cs.name == stat.app) }) ;
                if (cIdx < 0) {                
                    cIdx = _self.chartseries2.length;
                    _self.chartseries2.push({ name: stat.app, data: [] }) ;
                }

                var val = 0 ;
                if (_self.statsViewBy == 'Total Views')                    
                    val = parseInt(stat.total_visit) ;
                else if (_self.statsViewBy == 'Unique Users')
                    val = parseInt(stat.unique_users) ;
                else if (_self.statsViewBy == 'Unique Patients')
                    val = parseInt(stat.unique_patients) ;
                
                _self.chartseries2[cIdx].data.push({x: _self.chartOptionCategories.indexOf(stat.cat), y: val })
                } catch (err) {
                    console.log("error " + err) ;
                    _self.log("Error in ajax call processing : " + err) ;
                }
            });  
            this.log("all done in updatechartseries2 method") ;
            this.initApp = false ; // to reset the init process
            var hChart = this.$refs.myChart.chart ;
            if (hChart.isDataTableVisible) {
                _self.log("Settting window timeout method to refresh after 1 sec") ;
                setTimeout(function() { _self.viewTableData() ; }, 1000) ;
            }
        }        
    }
}
</script>

<style scoped>
    .counts {
        font-size: 1.5em;
        color: brown
    }
</style>
<style>
    .highcharts-data-table table {
        border-collapse: collapse;
        border-spacing: 0;
        background: white;
        min-width: 100%;
        margin-top: 10px;
        font-family: sans-serif;
        font-size: 0.9em;
    }
    .highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption {
        border: 1px solid silver;
        padding: 0.5em;
    }
    .highcharts-data-table tr:nth-child(even), .highcharts-data-table thead tr {
        background: #f8f8f8;
    }
    .highcharts-data-table tr:hover {
        background: #eff;
    }
    .highcharts-data-table caption {        
        caption-side: top;
        font-size: 1.1em;
        font-weight: bold;
    }
    .highcharts-data-table th {
        text-align: center;
    }
    .highcharts-data-table td.number {
        text-align: center ;
    }    
</style>