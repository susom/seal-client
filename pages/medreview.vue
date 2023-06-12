<template>
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters id="appBlockDiv">
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="drug_reaction_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">                 
                <p class="pt-2">
                    Drug Reaction Diagnostic Assistant is a clinical decision support tool developed by SEAL.
                </p>
                <p>
                    This app allows clinicians to rapidly display a synchronized timeline showing the interactions over time between 
                    selected drug administration records and lab results.                    
                </p>                
            </b-col>
        </b-row>
        
        <b-row align-content="center">
            <b-col cols="10" class="text-center h5 pb-2">
                Medications administered and laboratory results between {{startDateFormatted}} and {{endDateFormatted}}  
                <b-button class="ml-4" size="sm" variant="primary" @click="systemError=false; loadingMessage=''; $bvModal.show('launch-modal')">Modify Report</b-button>
            </b-col>
            <!--
            <b-col class="mt-2">
                <b-button variant="primary" text disabled size="sm" v-if="showStatus">
                    <b-spinner small type="grow"></b-spinner>
                    {{loadingMessage}}
                </b-button>                
            </b-col>
            -->
        </b-row> 
        <b-row align-content="center">
            <b-col class="text-right">
                <span class="font-weight-bold">Syndrome:</span> 
                <b-select :options="syndromes" 
                    v-model="syndromeCode"                     
                    size="sm"
                    @change="syndromeChange"
                    class="ml-2 mb-2" style="width:60%"/>
            </b-col>
            <b-col class="text-left ml-3">
                <div v-if="syndromeCode != 'ALL'" style="display:inline">
                <b-link @click="showSyndromeModal('meds')">{{syndromeCode}} Meds</b-link>
                <b-link @click="showSyndromeModal('labs')" class="ml-3">{{syndromeCode}} Labs</b-link>
                <b-link @click="showSyndromeModal('vitals')" class="ml-3">{{syndromeCode}} Vitals</b-link>
                </div>
                <outside-meds v-model="patient" @change="popOutsideMeds" @deleted="deletedOutsideMed" />                
            </b-col>
        </b-row>
        <b-row class="ml-1 mr-1">
            <b-col cols="12">
                <splitpanes class="default-theme" id="splitPaneDiv" @resized="resizePane">
                    <pane size="40">
                        <div :style="rightPaneStyle()" id="leftPaneDiv">
                        <b-card no-body>
                            <b-tabs card  fill nav-wrapper-class="bg-white" active-nav-item-class="bg-primary">
                                <b-tab title="Meds" active>
                                    <b-card-text>   
                                        <b-input-group size="sm" class="mb-2">
                                            <b-form-input
                                                id="filter-input"
                                                v-model="meds.search"
                                                type="search"    
                                                placeholder="Type to Search"
                                                debounce="300"
                                                class="mb-2"
                                            ></b-form-input>
                                            <!--
                                            <b-input-group-append is-text class="mb-2">
                                                <b-icon icon="file-excel" @click="meds.search=''"></b-icon>
                                            </b-input-group-append>
                                            -->
                                        </b-input-group>
                                        <!-- @row-selected="onMedsRowSelect" 
                                            :filter="meds.search"
                                            :filter-function="filterMeds"
                                            @filtered="medsFiltered"
                                            :items="meds.list"
                                        -->
                                        <b-table striped 
                                            :items="medListFiltered" :fields="meds.fields"
                                            small :busy="meds.loading"
                                            selectable
                                            hover
                                            select-mode="multi"
                                            ref="medicationsTable"
                                            @row-clicked="onMedRowClick"                                            
                                            :sticky-header="tableHeight()">
                                            <template #table-busy>
                                                <div class="text-center text-primary my-2">
                                                    <b-spinner class="align-middle"></b-spinner>
                                                    <strong>Loading...</strong>
                                                </div>
                                            </template>
                                            <template #head(selected)="data">
                                                <b-checkbox v-model="toggleAllMeds"/>
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
                                            <template #cell(tags)="data">                                                
                                                <div v-if="data.item.pcat">{{data.item.pcat}}</div>
                                                <div v-if="data.item.routes">{{data.item.routes}}</div>                                                
                                                <div v-if="data.item.thera_class">{{data.item.thera_class}}</div>
                                                <div v-if="data.item.pharma_class">{{data.item.pharma_class}}</div>
                                                <div v-if="data.item.syndromes">{{data.item.syndromes}}</div>
                                            </template>
                                            <template #cell(total_doses)="data">
                                                {{data.item.data.length}}
                                            </template>                                        
                                        </b-table>
                                    </b-card-text>
                                </b-tab>
                                <b-tab title="Labs">
                                    <b-card-text>
                                        <med-review-table ref="labsChartTable" :labs="labs" @debug="log" @clicked="labChartSelected" :launchModal="launchModal" @moveToTop="moveLabToTop" />
                                    </b-card-text>                                        
                                </b-tab>
                                <b-tab title="Vitals">
                                    <b-card-text>                                     
                                        <med-review-table ref="vitalsChartTable" :labs="vitals" @debug="log" :launchModal="launchModal" @moveToTop="moveLabToTop" />
                                    </b-card-text>
                                </b-tab>                            
                            </b-tabs>
                        </b-card>
                        </div>
                    </pane>
                    <pane size="60">
                        <div :style="rightPaneStyle()" id="rightPaneDiv">
                        <b-row class="mt-3 ml-1 mr-1">
                            <b-col cols="12">
                                <b-card class="shadow-lg rounded-lg">
                                    <b-card-title class="chart-title">
                                        <b-row>
                                            <b-col>Medications</b-col>
                                            <b-col style="text-align:right" class="mr-3">
                                                <span>Group By:</span> 
                                                <b-select :options="['None', 'Ingredient']" 
                                                v-model="meds.groupBy" size="sm"
                                                @change="groupByChange"                                         
                                                class="ml-2" style="width:50%"/>
                                            </b-col>
                                        </b-row>                                        
                                    </b-card-title>
                                    <b-card-text>                                
                                        <b-row>
                                            <b-col>
                                                <highchart :modules="['xrange']" :options="medChartOptions" ref="medChart"/>
                                            </b-col>
                                        </b-row>
                                    </b-card-text>
                                </b-card>                                
                            </b-col>
                        </b-row>                        
                        <b-row class="mt-3 ml-1 mr-1">
                            <b-col cols="12">
                                <b-card class="shadow-lg rounded-lg">
                                    <b-card-title class="chart-title">
                                        <b-row>
                                            <b-col>Combined Lab Chart</b-col>
                                            <b-col style="text-align:right" class="mr-3">
                                                <b-icon :icon="combinedLabChartOpen?'arrow-up-circle-fill':'arrow-down-circle-fill'" @click="toggleChart()" 
                                                    variant="info" font-scale="1.5"/>
                                            </b-col>
                                        </b-row>
                                    </b-card-title>
                                    <b-card-text>
                                        <b-row v-show="combinedLabChartOpen">
                                            <b-col>
                                                <highchart :options="combinedLabChartOptions" />
                                            </b-col>
                                        </b-row>
                                    </b-card-text>
                                </b-card>                                
                            </b-col>
                        </b-row>                                           
                        <b-row class="mt-3 ml-1 mr-1" v-for="(labChart) in labs_visible_charts" :key="labChart.id">
                            <b-col cols="12">
                                <b-card class="shadow-lg rounded-lg"  :ref="labChart.id">
                                    <b-card-title class="chart-title">{{labChart.name}}</b-card-title>
                                    <b-card-text>
                                        <b-row>
                                            <b-col>
                                                <highchart :options="labChart.chartOptions" />
                                            </b-col>
                                        </b-row>
                                    </b-card-text>
                                </b-card>                                
                            </b-col>
                        </b-row>                            
                        <b-row class="mt-3 ml-1 mr-1" v-for="(vitalsChart) in vitals_visible_charts"  :key="vitalsChart.id">
                            <b-col cols="12">
                                <b-card class="shadow-lg rounded-lg" :ref="vitalsChart.id">
                                    <b-card-title class="chart-title">{{vitalsChart.name}}</b-card-title>
                                    <b-card-text>                                
                                        <b-row>
                                            <b-col>
                                                <highchart :options="vitalsChart.chartOptions" />
                                            </b-col>
                                        </b-row>
                                    </b-card-text>
                                </b-card>                                
                            </b-col>
                        </b-row>                                                    
                        </div>                     
                    </pane>
                </splitpanes>
            </b-col>
        </b-row>
        
        <b-modal id="syndrome-modal" button-size="sm" centered header-bg-variant="primary"
            :title="syndromeModal.title" scrollable ok-only ok-title="Close">
            <b-list-group style="height:400px">
                <b-list-group-item v-for="item in syndromeModal.items" :key="item.name">{{item.name}}</b-list-group-item>
            </b-list-group>
        </b-modal>

        <b-modal id="launch-modal" button-size="sm" 
            centered hide-footer no-close-on-backdrop 
            title="Report Criteria" title-class="mx-auto">
            <b-row>
                <b-col class="text-right" cols="4">
                    <label for="startDate">Start Date</label>
                </b-col>                
                <b-col>
                    <editable-date-picker v-model="launchModal.start_date" @error="(event) => {launchModal.errors.start_date = event}" />
                </b-col>
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">
                    <label for="endDate">End Date</label>
                </b-col>
                <b-col>
                    <editable-date-picker v-model="launchModal.end_date" @error="(event) => {launchModal.errors.end_date = event}"/>
                </b-col>                
            </b-row>  
            <b-row>
                <!--
                <b-col cols="1" class="text-left">
                    <b-link @click="showDebug = !showDebug" style="font-size:small;text-align:left;">Logs</b-link>  
                </b-col>
                -->
                <b-col cols="10" class="text-center">                    
                    <b-button pill variant="primary" class="ml-3 mt-3" @click="generateCharts" :disabled="!launchModal.errors.start_date || !launchModal.errors.end_date">Fetch Patient Data</b-button>  
                </b-col>
            </b-row> 
            <StatusMessage :loadingMessage="loadingMessage" :systemError="systemError" />
            <!--
            <b-row v-show="launchModal.loading">
                <b-col cols="12"  class="text-center">
                    <b-button variant="info" disabled size="sm" class="mt-3" style="width:100%">
                        <b-spinner small type="grow" class="mr-2"></b-spinner>
                        {{loadingMessage}}
                    </b-button>
                </b-col>
            </b-row> 
            -->
        </b-modal>
        <b-modal id="medreview-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
            body-bg-variant="dark">
            <ul class="text-white">
                <li>To get started, specify the start and end dates for the visualization.</li>

                <li>To populate the medication chart on the right hand side, make selections from the “Medications” tab by clicking on an entry of interest. 
                    Click a second time to clear your selection.</li>

                <li>To add a synchronized graph of labs or vitals, make selections from the “Labs” or “Vitals” tabs on the left hand side.</li>

                <li>To find a specific drug or lab, start typing its name into the search bar just below the tabs on the left hand side. 
                    Click the X on the far right of the search box to clear your search and see all available options again.</li>

                <li>To change the size of the left or right panels, click the white center bar and drag it to either side. 
                    Your mouse cursor will change shape when hovering over the active hotspot for panel resizing.</li>

                <li>Presets for common conditions are available in the “Syndrome” dropdown. If you would like to add your condition to the list of presets, 
                    please <a> open a help ticket </a></li>

                <li>To add medications not in the chart, use the “Outside Medications” button. Data entered into the outside medications form is not saved in Epic, only in SEAL.</li>    

            </ul>
        </b-modal>
        <b-modal id="session-expired-modal" size="lg" centered hide-footer title="Session Expired">                
            Your session with SEAL application has expired. Please close the current SEAL tab and reopen to establish new connection.
        </b-modal>
        <b-row class="mt-3 ml-2" v-if="$store.getters.sealTeam">
            <b-col cols="11">
                <b-link @click="showDebug = !showDebug" style="font-size:small">Logs Link</b-link>
                <b-card v-show="showDebug">                    
                    <b-card-title>Debug Info <b-btn @click="debugLog=''" size="sm" variant="primary">Reset</b-btn></b-card-title>
                    <b-card-text>
                        <b-textarea v-model="debugLog" rows="10" auto-grow />
                    </b-card-text>
                </b-card>
            </b-col>                        
        </b-row>        
    </b-container>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import MedReviewTable from '~/components/MedReviewTable.vue'
import Highcharts from 'highcharts' ;
import offlineExporting from 'highcharts/modules/offline-exporting' ;
import exportData from 'highcharts/modules/export-data' ;
import EditableDatePicker from '~/components/EditableDatePicker.vue';
import OutsideMeds from '~/components/OutsideMeds.vue';
import StatusMessage from '~/components/StatusMessage.vue';

offlineExporting(Highcharts) ;
exportData(Highcharts) ;

export default {
    components: { Splitpanes, Pane, MedReviewTable, EditableDatePicker, OutsideMeds, StatusMessage },
    data() {
        return {
            launchModal : {              
                start_date: '',
                end_date: '',
                rpt_start_date: '',
                rpt_end_date: '',
                loading: false,
                errors : {
                    start_date: null,
                    end_date: null
                }
            },     
            showDebug: false,       
            showStatus: false,
            loadingMessage: "", 
            toggleAllMeds: false,
            syndromeCode: "ALL",
            syndrome: { 
                medications: {
                    highrisk: []
                }
            },
            syndromeModal :{
                title: '',
                items: []
            },
            syndromes: [],
            meds : {
                search: "",
                data: [],
                encounters: [],
                prevSelected: [],
                fields: [
                    {label: ' ', key: 'selected'},
                    {label: 'Medication', key: 'name', sortable: false},
                    {label: 'Tags', key: 'tags', sortable: false},
                    {label: 'Last MAR', key: 'last_used', sortable: false},
                    {label: 'Total Doses', key: 'total_doses', sortable: false}
                ],
                loading: false,
                ingredients: [],
                list: [],
                groupBy: 'None'
            },            
            labs : {
                search: "",
                charts: [],
                fields: [
                    {label: ' ', key: 'selected'},
                    {label: 'Lab', key: 'name', sortable: false},
                    {label: 'Tags', key: 'syndromes', sortable: false}
                ],
                loading: false
            },
            vitals : {
                search: "",
                charts: [],
                fields: [
                    {label: ' ', key: 'selected'},
                    {label: 'Lab', key: 'name', sortable: false},
                    {label: 'Tags', key: 'syndromes', sortable: false}                    
                ],
                loading: false
            },
            patient: {},
            debugLog:"",
            medChartOptions: {},
            combinedLabChartOpen: true,
            combinedLabChartOptions: { },            
            systemError: false
        }
    },
    watch : {
        toggleAllMeds: function(val) {
            console.log("Toggle all meds watched : {}", val) ;
            if (val) {
                this.$refs.medicationsTable.selectAllRows() ;
            } else {
                this.$refs.medicationsTable.clearSelected() ;
            }
            this.meds.data.forEach(med => {
                this.$set(med, "selected", val) ;
            }) ;
            this.redrawMedChart() ;
        }        
    },
    async fetch() {
        console.log("In fetch method of the med review page env " + process.env.BASE_URL) ;

        this.$store.commit('setAppId', this.$services.medreview.APP_ID) ;
        this.$store.commit('setPageTitle', "Drug Reaction Diagnostic Assistant") ;
        this.$store.commit('setCurrentApp', { help : "medreview-help-modal" }) ;
        this.$services.medreview.dblog("MedReviewHome", "In Med Review Home Page") ;

        var syndromes = await this.$services.medreview.syndromes() ;
        this.syndromes = syndromes.map(syndrome => {
            return {
                value: syndrome.code,
                text: (syndrome.code == 'ALL' ? syndrome.name : (syndrome.code + ' ' + syndrome.name))
            }
        })

        this.patient = await this.$services.seal.patient(this.$services.medreview.APP_ID) ;

        console.log("got patient data") ;
        console.log(this.patient) ;

    },
    mounted() {
        console.log("mounted for medreview page") ;
        this.launchModal.start_date = this.$moment().add(-7, 'days').format("MM/DD/YYYY") ;
        this.launchModal.end_date = this.$moment().format("MM/DD/YYYY") ;
        console.log(this.launchModal) ;
        this.$bvModal.show("launch-modal") ;        
    },
    computed : {
        startDateFormatted () {            
            return this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        endDateFormatted() {            
            return this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        labs_visible_charts: function() {
            return this.labs.charts.filter(chart => chart.visible) ;
        },
        vitals_visible_charts: function() {
            return this.vitals.charts.filter(chart => chart.visible) ;
        },
        medListFiltered: function() {
            var list = this.meds.list.filter((row) => {
                var searchTerms = row.name + " " + row.last_used + " " + row.pcat + " " 
                            + (row.routes?row.routes:"") + " " 
                            + (row.thera_class?row.thera_class:"") + " " 
                            + (row.pharma_class?row.pharma_class:"") + " " 
                            + (row.syndromes?row.syndromes:"") ;

                searchTerms = searchTerms.toLowerCase() ;
                
                var terms = this.meds.search.split(",") ;
                for (var i=0;i<terms.length;i++) {
                    if (searchTerms.indexOf(terms[i].trim().toLowerCase()) < 0) return false ;
                }
                return true ; 
            }) ;
            console.log("filter fired... original list size :" + this.meds.list.length + " fitlered size " + list.length) ;
            return list ;
        }
    },    
    methods : {
        toggleChart() {
            this.combinedLabChartOpen = !this.combinedLabChartOpen ;
        },
        labChartSelected(labItem, chartOptions) {
            try {
            console.log("Lab Chart Selected : {}", chartOptions) ;
            console.log("Lab Chart Selected row : {}", labItem) ;
            //var co = JSON.parse(chartOptions) ;
            var co = JSON.parse(JSON.stringify(chartOptions)) ;

            console.log("Lab Chart Selected Series[0]: {}", co.series[0]) ;
            
            if (labItem.selected) {
                if (!this.combinedLabChartOptions.series)
                    this.combinedLabChartOptions.series = [] ;
                
                var cIdx = this.labs.charts.findIndex(chart => chart.id == co.id ) ;
                console.log("Found chart id " + co.id + " at index " + cIdx) ;
                console.log(this.labs.charts[cIdx]) ;
                
                this.log("In LabChartSelected: chart " + this.labs.charts[cIdx].name + " min quantile :" + this.labs.charts[cIdx].min_quantile +  " max quantile :" + this.labs.charts[cIdx].max_quantile + " data size :" + co.series[0].data.length) ;

                if (this.labs.charts[cIdx].max_quantile > 0) {
                    co.series[0].data.forEach(point => {
                        point.orig_y = point.y ;
                        point.y = 5 + 90 * (point.y - this.labs.charts[cIdx].min_quantile ) / ( this.labs.charts[cIdx].max_quantile - this.labs.charts[cIdx].min_quantile ) ;
                        if (point.y > 100) point.y = 100 ;
                        if (point.y < 0) point.y = 0 ;
                        point.y = parseFloat(point.y.toFixed(2)) ;                        
                    }) ;
                    co.series[0].name = this.labs.charts[cIdx].name ;
                    this.combinedLabChartOptions.series.push(co.series[0]) ;
                    console.log("combined chart options>" + JSON.stringify(this.combinedLabChartOptions)) ;
                } else {
                    this.log("This chart doesn't have high low values :" + this.labs.charts[cIdx].name) ;
                }                
            } else {
                var cIdx = this.combinedLabChartOptions.series.findIndex(series => series.name == labItem.name) ;
                console.log("Found index to remove :" + cIdx) ;
                this.combinedLabChartOptions.series.splice(cIdx, 1) ;  // delete the row
            }
            } catch (err) {
                this.log("Error in combined chart :" + err) ;
            }
            this.log("In LabChartSelected: finished doing the calc stuff ") ;
        },
        groupByChange() {
            console.log("group by change fired " + this.meds.groupBy) ;            
            this.redrawMedChart() ;            
        },
        redrawMedChart() {
            console.log("Inside redrawMedChart method") ;
            this.log("Inside redrawMedChart method") ;
            var medChartOptions = this.getMedsChart() ;

            var filteredMeds = [] ;

            if (this.meds.groupBy == "None") {
                filteredMeds = this.meds.data.filter(med => med.selected) ;
            } else if (this.meds.groupBy == "Ingredient") {
                this.log("Inside group by Ingredients section") ;
                try {
                if (!this.meds.ingredients || this.meds.ingredients.length == 0 ) {
                    this.log("Got inside to loop thru each med for ingradients") ;
                    var ingredients = [] ;
                    this.meds.data.forEach(med => {
                        var ingIdx = ingredients.findIndex(function(ing) { return (ing.ingredient == med.ingredient) } ) ;
                        this.log("found ingredient " + med.ingredient + " in ingredients idx :" + ingIdx) ;
                        if (ingIdx > -1) {
                            ingredients[ingIdx] = this.$services.medreview.merge_meds(ingredients[ingIdx], med) ;
                        } else {
                            var ingObj = JSON.parse(JSON.stringify(med))  ;
                            ingObj.name = (med.ingredient?med.ingredient:med.name) ;
                            ingredients.push(ingObj) ;
                        }                
                    }) ;
                    this.log("Setting ingredients first time {}" + ingredients.map(ing => ing.name)) ;
                    this.$set(this.meds, 'ingredients', ingredients) ;
                }
                filteredMeds = this.meds.ingredients.filter(med => med.selected) ;
                } catch (err) {
                    this.log("Error in group by ingredients :" + err) ;
                }
            }
            try {
            // alpha sort on names
            filteredMeds.sort(function (a, b) {
                if (a.name > b.name) {
                    return -1;
                }
                if (a.name < b.name) {
                    return 1;
                }                
            }) ;

            for (var i=0;i<filteredMeds.length;i++) {
                filteredMeds[i].data.forEach(point => {point.y = i}) ;
            }
            
            var cdata = filteredMeds.flatMap(med => med.data) ;
            cdata  = JSON.parse(JSON.stringify(cdata)) ;  // basic simple deep clone

            medChartOptions.yAxis[0].categories = filteredMeds.map(med => med.name) ;
            medChartOptions.series[0].data = cdata ;

            var chartHeight = medChartOptions.yAxis[0].categories.length * 30 ;
            if (chartHeight < 300)
                chartHeight = 300;

            medChartOptions.chart.height = chartHeight ;

            var plotBands = [] ;
            this.meds.encounters.forEach(enc => {                
                plotBands.push({
                    color : "lightgrey" ,
                    borderwidth: 5 ,
                    borderColor: "lightgrey",
                    from : enc.start ,
                    to : enc.end,
                    zIndex : 1
                }) ;                
            }) ;

            medChartOptions.xAxis.plotBands = plotBands ;

            console.log(medChartOptions) ;
            
            this.resizePane() ;
            
            this.medChartOptions = medChartOptions ;
            
            if (this.meds.groupBy == "None")
                this.meds.data.sort(function(a,b) { return a.name.localeCompare(b.name) }) ;
            else
                this.meds.ingredients.sort(function(a,b) { return a.name.localeCompare(b.name) }) ;            

            if (this.meds.groupBy == "None") {
                this.meds.list = this.meds.data ;
            } else {
                this.meds.list = this.meds.ingredients ;
            }
            this.log("********Medication List***********") ;
            this.log(JSON.stringify(this.meds.list.map(med => med.name))) ;
            } catch (err) {
                this.log("Error in redrawchart 2 " + err) ;
            }

        },
        log(mesg) {
            this.debugLog += "\n" + mesg ;
        },
        moveLabToTop(itemId) {
            this.$refs[itemId][0].scrollIntoView() ;
        },
        popOutsideMeds(newPatient) {
            console.log("In medreview popOutsideMeds for patient data {}" , newPatient) ;
            if (!newPatient.cmeds) return ;
            newPatient.cmeds.forEach(omed => {
                var med = {selected: false, seal_medication_id: -1} ;
                med.name = omed.med_name ;
                med.seal_medication_id = omed.seal_medication_id ;                
                med.pcat = "OutsideMed" ;
                med.syndromes = omed.syndromes ;
                med.thera_class = omed.thera_class ;
                med.pharma_class = omed.pharma_class ;
                med.routes = omed.route ;
                med.ingredient = omed.ingredients ;
                med.id = this.meds.data.length ;
                med.data = [] ;

                var last_used_long = 0 ;
                var last_used = "" ;
                var inReportPeriod = false ;

                for (var pIdx = 0; pIdx < omed.med_periods.length; pIdx++) {                    
                    var prd = omed.med_periods[pIdx] ;
                    this.log("Process outside med period " + JSON.stringify(prd)) ;
                    var cdata = {} ;  // chart data
                    cdata.x = this.$moment(prd.start_date, "mm/dd/yy").valueOf() ;
                    cdata.x2 = this.$moment(prd.end_date, "mm/dd/yy").valueOf() ;
                    if (cdata.x2 > last_used_long) {
                        last_used_long = cdata.x2 ;
                        last_used = prd.end_date ;
                    }
                    
                    if ((cdata.x >= this.launchModal.rpt_start_date_long && cdata.x <= this.launchModal.rpt_end_date_long)  
                        || (cdata.x2 <= this.launchModal.rpt_end_date_long && cdata.x2 >= this.launchModal.rpt_start_date_long)
                        || (cdata.x < this.launchModal.rpt_start_date_long && cdata.x2 > this.launchModal.rpt_end_date_long)) 
                    {
                        inReportPeriod = true ;
                        cdata.y = med.id ;
                        cdata.name = med.name ;
                        cdata.pcat = prd.ptype ;
                        if (med.pcat.indexOf(prd.ptype) < 0) {
                            med.pcat = med.pcat + ", " + prd.ptype ;
                        }
                        cdata.color= "red" ;
                        med.data.push(cdata) ;                            
                    }
                } ;
                
                med.last_used_long = last_used_long ;
                med.last_used = last_used ;
                
                this.log("Process outside med " + omed.med_name + " inReportPeriod " + inReportPeriod + " med " + JSON.stringify(med)) ;

                if (inReportPeriod) {
                    console.log("Pushing outside med {}", med) ;
                    
                    var mIdx = this.meds.data.findIndex(function(med) { return med.seal_medication_id && med.seal_medication_id == omed.seal_medication_id }) ;
                    console.log("searching omed " + omed.med_name + " found index: " + mIdx) ;
                    if (mIdx > -1)
                        this.meds.data.splice(mIdx, 1, med) ;
                    else
                        this.meds.data.push(med) ;                
                } else {
                    console.log("Skipping outside med {} cause none of the periods falls in rprt range", {}) ;
                }
            }) ;
        },
        deletedOutsideMed(sealMedicationId) {
            console.log("In medreivew deleteOutsideMed methid :" + sealMedicationId) ;
            var mIdx = this.meds.data.findIndex(function(med) { return med.seal_medication_id && med.seal_medication_id == sealMedicationId }) ;
            this.meds.data.splice(mIdx, 1) ;
        },    
        async syndromeChange() {
            this.syndrome = await this.$services.medreview.syndrome(this.syndromeCode) ;             
            this.meds.data.forEach(med => {
                if (med.syndromes.indexOf(this.syndromeCode) > -1) {
                    this.$set(med, "selected", true) ;
                } else {
                    this.$set(med, "selected", false) ;
                }
            }) ;
            this.redrawMedChart() ;

            this.labs.charts.forEach(lab => {
                if (lab.syndromes.indexOf(this.syndromeCode) > -1) {
                    this.$set(lab, "visible", false) ;
                    this.$set(lab, "selected", false) ;
                } else {
                    this.$set(lab, "visible", true) ;
                    this.$set(lab, "selected", true) ;
                }
                this.$refs.labsChartTable.onLabRowClick(lab) ;
            }) ;
            this.vitals.charts.forEach(lab => {
                if (lab.syndromes.indexOf(this.syndromeCode) > -1) {
                    this.$set(lab, "visible", false) ;
                    this.$set(lab, "selected", false) ;
                } else {
                    this.$set(lab, "visible", true) ;
                    this.$set(lab, "selected", true) ;
                }
                this.$refs.vitalsChartTable.onLabRowClick(lab) ;                
            }) ;            
        },
        showSyndromeModal(type) {
            if (type == 'meds') {
                this.syndromeModal.title = this.syndrome.code + ' Medications' ;
                this.syndromeModal.items = this.syndrome.medications.highrisk ;
            } else if (type == 'labs') {
                this.syndromeModal.title = this.syndrome.code + ' Labs' ;
                this.syndromeModal.items = this.syndrome.labs ;                
            } else if (type == 'vitals') {
                this.syndromeModal.title = this.syndrome.code + ' Vitals' ;
                this.syndromeModal.items = this.syndrome.vitals ;                
            }
            this.$bvModal.show('syndrome-modal') ;
        },
        resizePane(dims) {
            Highcharts.charts.forEach(function(chart, idx) {  
                    if (chart) chart.reflow() ;
            }) ;
        },
        onMedsRowSelect(rows) {
            this.meds.prevSelected = rows.map(x => x.name) ;
            console.log("In onmedsrowseelct prevselected {}", this.meds.prevSelected) ;
        },
        rightPaneStyle() {
            var styles = {} ;

            var element = document.getElementById("appBlockDiv") ; // splitPaneDiv
            if (element) {
                styles = {
                    "height": (window.innerHeight - element.offsetTop) + "px" ,
                    "overflow-y": "scroll" 
                } ;
            }

            return styles ;
        },
        tableHeight() {
            //console.log(window.innerHeight + " 80% :" + (window.innerHeight * 80/100)) ;
            return (window.innerHeight * 75/100) + "px" ;
        },
        async generateCharts() {

            console.log("Generating charts for ") ;
            console.log(this.launchModal) ;
            
            this.debugLog = "Generating charts \n" ;

            this.launchModal.loading = true ;
            this.systemError = false ;                         

            this.launchModal.rpt_start_date = this.$moment(this.launchModal.start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
            this.launchModal.rpt_end_date = this.$moment(this.launchModal.end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;

            var rpt_start_date_long = this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").toDate().getTime() ;
            var rpt_end_date_long = this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").toDate().getTime() ;

            this.$set(this.launchModal, 'rpt_start_date_long', rpt_start_date_long) ;
            this.$set(this.launchModal, 'rpt_end_date_long', rpt_end_date_long) ;

            await this.$services.medreview.resetSession() ;
            // reset labs & vitals
            this.labs.charts = [] ;
            this.vitals.charts = [] ;

            this.combinedLabChartOptions = this.$services.medreview.getDefaultChartConfig({ 
                height: 500, title: '', 
                start_time: rpt_start_date_long, 
                end_time: rpt_end_date_long,
                min:0, max: 100,
                type: 'line',
                name: 'Lab Results' }) ;
            
            this.combinedLabChartOptions.legend.enabled = true ;
            this.combinedLabChartOptions.series = [] ;
            this.combinedLabChartOptions.plotOptions = {                            
                            series: {
                                dataLabels: {
                                enabled: false,
                                crop: false,
                                overflow: 'none',
                                align: 'left',
                                verticalAlign: 'middle',
                                formatter: function() {
                                    return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>';
                                }
                            }
                        } 
            } ;
            this.combinedLabChartOptions.tooltip.formatter = function() {
                var tip =  this.point.series.name ;
                tip += "<br>Value: " + this.point.orig_y + " " + this.point.unit ;
                tip += "<br>Time: " + Highcharts.dateFormat('%m/%d/%Y %I:%M %p', this.point.x) ;
                return tip ;
            }
            this.loadingMessage = "Fetching Medication Data" ;

            var _self = this ;

            var responses = [] ;
            var response = {} ;
            try {
                response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", '', this.$services.medreview.APP_ID ) ;
                responses.push(response) ;

                while (response.nextUrl) {
                    response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", response.nextUrl, this.$services.medreview.APP_ID) ;
                    responses.push(response) ;
                }
            } catch (err) {
                this.systemError = true ;
                this.debugLog += "Error in getting med data " + err + "\n" ;    
                return ;
            }

            console.log("med orders done") ;
            console.log(responses) ;
            this.debugLog += "Got med order responses\n" ;
            
            var medNames = [] ;
            var meds = [] ;  
            try {
                responses.forEach((response) => {
                    response.cats.forEach((med) => {
                        try {
                        var medIdx = medNames.indexOf(med.name) ;
                        if (medIdx === -1) {
                            medNames.push(med.name) ;
                            meds.push(med) ;
                        } else {
                            meds[medIdx].data = [].concat(meds[medIdx].data, med.data) ;
                            meds[medIdx].routes = this.merge(meds[medIdx].routes, med.routes) ;
                            meds[medIdx].pcat = this.merge(meds[medIdx].pcat, med.pcat) ;
                            meds[medIdx].med_order_ids = [].concat(meds[medIdx].med_order_ids, med.med_order_ids) ;
                        }
                        } catch (err) {
                            this.debugLog += "Error in merging medstat response for " + JSON.stringify(med) + "\n" ;
                            this.debugLog += err + "\n" ;
                        }
                    });              
                }) ;
            } catch (err) {
                this.debugLog += "Error in merging medstat responses " + err + "\n" ;
            }
            //this.medications = meds ;

            this.loadingMessage = "Fetching Encounter Data" ;
            
            var encounters = [] ;
            try {
                encounters = await this.$services.seal.encounters(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, '', this.$services.medreview.APP_ID) ;
            } catch (err) {
                this.systemError = true ;
                this.debugLog += "Error in getting encounter data " + err + "\n" ;    
                return ;
            }

            console.log("encounters....") ;
            console.log(encounters) ;

            var wsjson = {} ;

            this.debugLog += "Got encounters \n" ;

            console.log(" patient id :" + _self.patient.epicPatientId) ;

            encounters.forEach(enc => {
                wsjson[enc.pat_enc_csn_id] = {
                    "PatientID": _self.patient.epicPatientId,
                    "PatientIDType": "External", 
                    "ContactID": enc.pat_enc_csn_id,
                    "ContactIDType": "CSN",
                    "OrderIDs": []
                } ;
            });

            meds.forEach(med => {
                console.log(med) ;
                med.data.forEach(row => {
                    for (var i=0; i<encounters.length; i++) {
                        if ((row.x >= encounters[i].start && row.x <= encounters[i].end) || 
                            (row.x2 >= encounters[i].start && row.x2 <= encounters[i].end)) {
                            if (row.med_order_id) {   // for some reason row is created with empty ID
                                wsjson[encounters[i].pat_enc_csn_id].OrderIDs.push({ "ID": row.med_order_id, "Type" : "External"}) ;
                            }
                        }
                    }
                }) ;
            }) ;

            console.log("Final ws call json") ;
            console.log(wsjson) ;            
            
            this.debugLog += "before calling MAR data \n" ;

            // remove inpatient data                
            meds.forEach(function(med) {
                med.data = med.data.filter(function(elem) { return elem.pcat.toLowerCase().indexOf("inpatient") < 0 ; } ) ;
            }) ;
            this.debugLog += "after removing inpatient data: " + meds.map(med=>med.name) + "\n" ;

            try {
            // remove invalid data            
            encounters.forEach(function(enc) {
                console.log(" enc st dt :" + enc.start + " end dt :"  + enc.end) ;
                meds.forEach(med => {                        
                    med.data.forEach(function(point) {
                        // data starts inside the inpatient area
                        if (point.x >= enc.start && point.x <= enc.end) {
                            if (point.x2 <= enc.end) {
                                // somehow remove this row
                                _self.debugLog += "marked for removal : " + JSON.stringify(point) + "\n" ;
                                point.remove = true ;                                    
                            } else {
                                // resetting the start to end
                                point.x = enc.end ; // move the start of the data point to after end of 
                            }
                        } else if (point.x < enc.start && point.x2 >= enc.start) {
                            // data started earlier than in patient area
                            if (point.x2 <= enc.end) {
                                point.x2 = enc.start ;
                            } else {
                                // split the data into two sections
                                var ndata = JSON.parse(JSON.stringify(point)) ;  // clone data
                                ndata.x = enc.end ;
                                med.data.push(ndata) ;

                                point.x2 = enc.start ;
                            }
                        }                                                        
                    }) ;
                    med.data = med.data.filter(point => { return !point.remove } ) ;                        
                }) ;
            }) ;

            } catch (err) {
                alert("Error in removing invalid data " + err) ;
                _self.debugLog += "Error in removing invalid data :" + err + "\n" ;
            }

            this.loadingMessage = "Fetching MAR Data" ;

            this.$services.seal.mardata(wsjson, this.$services.medreview.APP_ID).then(responses => {
                console.log("responses length " + responses.length) ;
                this.debugLog += "Got MAR data responses " + responses.length + "\n" ;
                this.loadingMessage = "Processing MAR Data" ;

                responses.forEach(response => {                    
                    response.data.Orders.forEach(order => {
                        this.debugLog += "Processing MAR Data for order " + order.Name + "\n" ;
                        var medIdx = meds.findIndex(function (med) { return (med.med_order_ids.indexOf(order.OrderID.ID) >= 0) }) ;
                        var med = {} ;
                        if (medIdx >= 0) {
                            med = meds[medIdx] ;
                            med.name = order.Name ;
                        } else {
                            console.log("********* This should NOT happen - can't match order id for " + order.Name) ;
                            return ;
                        }
                        var last_used = "" ;
                        var last_used_long = 0 ;

                        for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                            var ma = order.MedicationAdministrations[mIdx] ;
                            if (ma.Action != "Not Given") {
                                var adminTime = new Date(ma.AdministrationInstant).getTime() ;
                                if (adminTime >= rpt_start_date_long && adminTime <= rpt_end_date_long) {
                                    if (last_used_long < adminTime) {
                                        last_used = this.$moment(new Date(adminTime)).format("MM/DD/YYYY") ;
                                        last_used_long = adminTime ;
                                    }
                                    if (ma.Dose) {
                                        med.data.push({ x: adminTime, x2: adminTime, y: medIdx, color: "darkgreen",
                                            name: order.Name, dose: ma.Dose.Value, unit: ma.Dose.Unit, action: ma.Action, pcat: "inpatient"  }) ;
                                    } else if (ma.Rate) {
                                        med.data.push({ x: adminTime, x2: adminTime, y: medIdx, color: "darkgreen",
                                            name: order.Name, dose: ma.Rate.Value, unit: ma.Rate.Unit, action: ma.Action, pcat: "inpatient"  }) ;                                            
                                    }
                                }
                            }
                        }
                        med.last_used_long = last_used_long ;
                        med.last_used = last_used ;
                        med.total_rows = med.data.length ;
                    }) ;
                }) ;

                // meds only with data is used
                meds = meds.filter(med => {return med.data.length > 0}) ;

                this.meds.data = meds ;
                this.popOutsideMeds(this.patient) ;
                this.meds.encounters = encounters ;                
                
                this.redrawMedChart() ;

                this.launchModal.loading = false ;
                this.debugLog += "All done \n" ;
                console.log(this.defaultMedChartOptions) ;
                console.log("final result of generate report call") ;
                console.log(this.medications) ;

                this.$bvModal.hide("launch-modal") ;
            }) ;

            this.debugLog += "Getting lab obs data \n" ;
            this.loadingMessage = "Fetching Lab Data" ;
            this.labs.charts = await this.getObsData("laboratory") ;
            this.log(this.labs.charts.map(lab => lab.name)) ;            
            console.log("Labs data : {}", this.labs) ;

            this.debugLog += "Getting vitals obs data \n" ;
            this.loadingMessage = "Fetching Vitals Data" ;
            this.vitals.charts = await this.getObsData("vital-signs") ;
            console.log("Vitals data : {}", this.vitals) ;
            this.log(this.vitals.charts.map(lab => lab.name)) ;

        },
        async getObsData(category) {
            try {
                var responses = [] ;
                var response = await this.$services.seal.obsData(category, this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", '', this.$services.medreview.APP_ID ) ;
                responses.push(response) ;
                while (response.nextUrl) {
                    response = await this.$services.seal.obsData(category, this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", response.nextUrl, this.$services.medreview.APP_ID) ;
                    responses.push(response) ;
                }
                
                var labs = [] ;
                this.debugLog += "Ajax calls done for " + category + " obs data \n" ;

                responses.forEach(function(response) {
                    response.data.forEach(function(lab) {
                        var labIdx = labs.findIndex(function(elem) { return elem.name == lab.name}) ;
                        if (labIdx === -1) {
                            lab.rendered = false ;
                            lab.visible = false ;
                            labs.push(lab) ;
                        }
                    });
                }) ;
            } catch (err) {
                this.log("Error in getObsData for " + category + ": " + err) ;
                this.systemError = true ;
                this.$bvModal.show("launch-modal") ;
            }
            return labs ;
        },
        getMedsChart() {
            var chartOptions = this.$services.medreview.getDefaultChartConfig({
                start_time: this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").toDate().getTime(),
                end_time: this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").toDate().getTime(),
                min: 0,
                //max: 10,
                //name: 'Medications Chart',
                type: 'xrange',
                title: '',
                height: 400
            }) ;

            return chartOptions ;
        },
        onMedRowClick(item, idx) {
            console.log(`OnMedRowClick item idx is ${idx}`) ;
            console.log(item) ;
            this.$set(item, 'selected', !item.selected) ;
            this.redrawMedChart() ;
        },
        merge(string1, string2) {
            return this.$services.medreview.unique_merge(string1, string2) ;        
        }
    },
    head() {
        return {
            title: "Drug Reactions Diagnostic Assistant"
        };
    } 
}

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

<style scoped>
    /* color: rgba(255, 255, 255, 0.6 
        display: flex;
    .splitpanes__pane {        
        justify-content: center;
        align-items: center;
        font-family: Helvetica, Arial, sans-serif;        
        font-size: 5em;
    }
    */
</style>

<style scoped>
    .chart-title {
        color: rgb(54,38, 115) ;
        font-size: 1.1em ;
    }
</style>