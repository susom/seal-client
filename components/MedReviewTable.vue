<template>
    <b-container>
        <b-input-group size="sm" class="mb-2">
            <b-form-input
                v-model="labs.search"
                type="search"    
                placeholder="Type to Search"                                                
                class="mb-2"
            ></b-form-input>
            <!--
            <b-input-group-append is-text class="mb-2">
                <b-icon icon="file-excel" @click="labs.search=''"></b-icon>
            </b-input-group-append>                                            
            -->
        </b-input-group>
        <b-table striped :items="labs.charts" :fields="labs.fields"
            small :busy="labs.loading"
            selectable
            hover
            select-mode="multi"
            ref="labsTable"
            :filter="labs.search"
            @row-clicked="onLabRowClick">
            <template #table-busy>
                <div class="text-center text-primary my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
            </template>                            
            <template #head(selected)="data">
                <b-checkbox v-model="toggleAllLabs"/>
            </template>
            <template #cell(selected)="data">                                                
                <template v-if="data.item.selected">
                    <span aria-hidden="true">&check;</span>
                    <span class="sr-only">Selected</span>
                </template>
                <template v-else>
                    <span aria-hidden="true">&nbsp;</span>
                    <span class="sr-only">Not selected</span>
                </template>
            </template>
        </b-table>                                        
    </b-container>
</template>

<script>
export default {
    props : { 
        labs : {},
        launchModal: {}        
    }, 
    data () {
        return {
            toggleAllLabs: false,
            totalPoints: 0,
            mandatory: true,
            minusOne: -1,
            rpt_start_date_long: 0,
            rpt_end_date_long: 0
        }
    },
    mounted () {
        console.log("In MedReviewTable - mounted") ;
        console.log("launchModal {}", this.launchModal) ;
    },
    computed : {
    },
    watch : {
        toggleAllLabs: function(val) {
            console.log("Toggle all labs watched : {}", val) ;
            if (val) {
                this.$refs.labsTable.selectAllRows() ;                
            } else {
                this.$refs.labsTable.clearSelected() ;
            }
            this.labs.charts.forEach(lab => {
                lab.selected = !val ;
                this.onLabRowClick(lab) ;
            }) ;
        },
        launchModal: function(val) {
            console.log("In watch for launchmodal {}", val) ;
            this.rpt_start_date_long = val.rpt_start_date_long ;
            this.rpt_end_date_long = val.rpt_end_date_long ;
        }       
    },
    methods : {
        async onLabRowClick(item) {
            console.log("Row is cliked on") ;
            console.log(item) ;

            this.$set(item, 'selected', !item.selected) ;
            item.visible  = !item.visible ;            
            if (item.visible && !item.rendered) {
                var chartdata = await this.$services.medreview.chartdata(item.id) ;
                console.log("response from lab chart call {}", chartdata) ;
                if (chartdata.sessionExpired) {
                    this.$bvModal.show("session-expired-modal") ;
                    return ;
                }
                var chartOptions = this.$services.medreview.getDefaultChartConfig(chartdata.data[0]) ;
                chartOptions.xAxis.min = this.rpt_start_date_long ;
                chartOptions.xAxis.max = this.rpt_end_date_long ;
                chartOptions.series[0].type = "line" ;
                chartOptions.chart.height = 300 ;
                console.log("chartoptions before setting the plotlines,.....") ;
                console.log(JSON.stringify(chartOptions)) ;

                if (item.low) {
                    chartOptions.yAxis[0].plotLines = [{
                                    value: item.low,
                                    color: 'green',
                                    dashStyle: 'shortdash',
                                    width: 2,
                                    label: {
                                        text: 'low'
                                    }
                                }, {
                                    value: item.high,
                                    color: 'red',
                                    dashStyle: 'shortdash',
                                    width: 2,
                                    label: {
                                        text: 'high'
                                    }
                                }] ;
                }
                if (item.min) {
                    chartOptions.yAxis[0].min = item.min ;
                    chartOptions.yAxis[0].max = item.max ;
                }
                chartOptions.series[0].data = chartdata.data[0].dataset;
                
                // https://api.highcharts.com/highcharts/plotOptions.series.turboThreshold
                chartOptions.series[0].turboThrehold = 0 ; // disable the threshold test
                if (chartdata.data[0].dataset2) {
                    chartOptions.series[0].name = "Systolic blood pressure" ;
                    chartOptions.legend.enabled = true ;
                    chartOptions.series[1] = {} ;
                    chartOptions.series[1].name = "Diastolic blood pressure" ;
                    chartOptions.series[1].data = chartdata.data[0].dataset2 ;
                    chartOptions.series[1].turboThreshold = 0 ; // disable the threshold test
                    chartOptions.series[1].type = "line" ;
                    //this.$emit('debug', chartOptions) ;
                }
                this.$set(item, "chartOptions", chartOptions) ;
                item.rendered = true ;
                console.log("Chart Options for lab {}", chartOptions) ;
                chartOptions.id = item.id ;
                this.$emit('debug', JSON.stringify(chartOptions)) ;
            }
            if (item.visible) {
                this.$emit('moveToTop', item.id) ;
            }
        }
    }
}

</script>

<style scoped>
    * {
        text-transform: none !important;
    }
</style>