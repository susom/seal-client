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
                                <b-col>{{counts[0].total_login}}</b-col>
                                <b-col>{{counts[1].total_login}}</b-col>
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
                                <b-col>{{counts[0].unique_users}}</b-col>
                                <b-col>{{counts[0].unique_users}}</b-col>
                            </b-row>                            
                        </b-card-text>
                    </b-card>
                    <b-card bg-variant="info" text-variant="white" header="New Users" class="text-center">
                        <b-card-text>
                            <b-row>
                                <b-col>Last Month</b-col>
                                <b-col>Current Month</b-col>
                            </b-row>                            
                            <b-row class="counts">
                                <b-col>{{counts[0].new_users}}</b-col>
                                <b-col>{{counts[0].new_users}}</b-col>
                            </b-row>                            
                        </b-card-text>
                    </b-card>
                </b-card-group>                
            </b-col>
        </b-row>
        <b-row class="mt-3">            
            <b-col cols="10" offset="1">                
                <b-card color="green">
                    <b-card-title>
                        <b-row>
                            <b-col style="text-align:left">
                                Seal App Views
                            </b-col>
                            <b-col style="text-align:right;font-size:.65em">
                                View Chart By <b-form-select style="width:40%" size="sm" class="ml-3" :options="['Total Views', 'Unique Users', 'Unique Patients']" 
                                    v-model="statsViewBy" @change="updateChartSeries" />
                            </b-col>
                        </b-row>
                    </b-card-title>
                    <b-card-text>
                        <highchart                             
                            :options="chartOptions"
                            :modules="['offline-exporting']"                            
                             />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="mt-3">            
            <b-col cols="5" offset="1">                
                <b-card title="Top 10 Users for last 30 days">
                    <b-card-text>
                         <b-table striped :fields="top10Fields" :items="top10" />
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>

/* eslint-disable */

import offlineExporting from 'highcharts/modules/offline-exporting'

import Vue from 'vue' ;

export default {
    data () {
        return {
            appstats: [],
            chartseries: [],
            statsViewBy: "Total Views",
            counts: [{total_login: 0, unique_users: 0, new_users: 0}, {total_login: 0, unique_users: 0, new_users: 0}]  ,
            top10: [],
            top10Fields: [
                {key: 'user_id', label: 'ID', sortable: false},
                {key: 'full_name', label: 'Name', sortable: false},
                {key: 'total_login', label: '# of logins', sortable: false},
            ]
        }
    },
    async fetch() {

        console.log("In mounted method of the dashboard tab page") ;        
        this.$store.commit('setAppId', 6) ;
        this.$services.a3pain.dblog("DashboardHome", "In Dashboard Home Page") ;
        this.$store.commit('setPageTitle', "SEAL Dashboard") ;

        this.appstats = await this.$services.dashboard.appstats() ;
        this.updateChartSeries() ;

        this.counts = await this.$services.dashboard.counts() ;

        this.top10 = await this.$services.dashboard.top10() ;

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
                            } /*,
                            {
                                text: 'Download JPG',
                                onclick: function() {
                                    console.log("Inside download jpg dashboard") ;
                                    console.log(this);
                                    this.exportChartLocal({type:"image/jpeg"}) ;
                                }
                            },
                            {
                                text: 'Download PNG',
                                onclick: function() {
                                    this.exportChartLocal({type:"image/png"}) ;
                                }
                            }*/ ]
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
                        '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
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
        }
    },
    methods : {
        updateChartSeries () {
            var _self = this ;
            
            this.appstats.forEach(function(stat) {
                var cIdx = _self.chartseries.findIndex(function (cs) { return (cs.name == stat.app) }) ;
                if (cIdx < 0) {                
                    cIdx = _self.chartseries.length;
                    _self.chartseries.push({ name: stat.app, data: [0,0,0,0,0,0,0,0,0,0,0,0] }) ;                
                }
                if (_self.statsViewBy == 'Total Views')                    
                    Vue.set(_self.chartseries[cIdx].data, parseInt(stat.mm) - 1, parseInt(stat.total_visit)) ;                    
                else if (_self.statsViewBy == 'Unique Users')
                    Vue.set(_self.chartseries[cIdx].data, parseInt(stat.mm) - 1, parseInt(stat.unique_users)) ;
                else if (_self.statsViewBy == 'Unique Patients')
                    Vue.set(_self.chartseries[cIdx].data, parseInt(stat.mm) - 1, parseInt(stat.unique_patients)) ;
            });            
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