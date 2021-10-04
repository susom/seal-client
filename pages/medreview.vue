<template>
    <b-container fluid  class="nopadding">
        <b-row align-content="center">
            <b-col cols="10" class="text-center h5 pt-2 pb-2">
                Medications administered and laboratory results between {{launchModal.start_date}} and {{launchModal.end_date}}
            </b-col>
            <b-col class="mt-2">
                <b-button variant="primary" text disabled size="sm" v-if="showStatus">
                    <b-spinner small type="grow"></b-spinner>
                    {{loadingMessage}}
                </b-button>                
            </b-col>
        </b-row>
        <b-row class="ml-1 mr-1">
            <b-col cols="12">
                <splitpanes style="height:100vh" class="default-theme">
                    <pane size="20">
                        <b-card no-body>
                            <b-tabs card>
                                <b-tab title="Meds" active>
                                    <b-card-text>
                                        <b-form-input
                                            id="filter-input"
                                            v-model="meds.search"
                                            type="search"    
                                            placeholder="Type to Search"
                                            size="sm"
                                            class="mb-2"
                                        ></b-form-input>                                        
                                        <b-table striped :items="meds.data" :fields="meds.fields"
                                            small :busy="meds.loading"
                                            selectable
                                            hover
                                            :select-mode="multi"
                                            ref="medicationsTable"
                                            :filter="meds.search"
                                            @row-selected="onRowSelect">
                                            <template #table-busy>
                                                <div class="text-center text-primary my-2">
                                                    <b-spinner class="align-middle"></b-spinner>
                                                    <strong>Loading...</strong>
                                                </div>
                                            </template>                                        
                                            <template #cell(selected)="{ rowSelected }">
                                                <b-checkbox disabled :value="rowSelected"/>
                                                <!--
                                                <template v-if="rowSelected">
                                                    <span aria-hidden="true">&check;</span>
                                                    <span class="sr-only">Selected</span>
                                                </template>
                                                <template v-else>
                                                    <span aria-hidden="true">&nbsp;</span>
                                                    <span class="sr-only">Not selected</span>
                                                </template>
                                                -->
                                            </template>
                                            <template #cell(tags)="data">
                                                {{data.item.pcat}}<br/>
                                                {{data.item.routes}}<br/>
                                                {{data.item.thera_class}}
                                            </template>
                                            <template #cell(total_doses)="data">
                                                {{data.item.data.length}}
                                            </template>                                        
                                        </b-table>
                                    </b-card-text>
                                </b-tab>
                                <b-tab title="Labs">
                                    <b-card-text>
                                        <b-form-input
                                            id="filter-input"
                                            v-model="labs.search"
                                            type="search"    
                                            placeholder="Type to Search"
                                            size="sm"
                                            class="mb-2"
                                        ></b-form-input>                                        
                                        <b-table striped :items="labs.data" :fields="labs.fields"
                                            small :busy="labs.loading"
                                            selectable
                                            hover
                                            :select-mode="multi"
                                            ref="labsTable"
                                            :filter="labs.search"
                                            @row-selected="onRowSelect">
                                            <template #table-busy>
                                                <div class="text-center text-primary my-2">
                                                    <b-spinner class="align-middle"></b-spinner>
                                                    <strong>Loading...</strong>
                                                </div>
                                            </template>                                        
                                            <template #cell(selected)="{ rowSelected }">
                                                <template v-if="rowSelected">
                                                    <span aria-hidden="true">&check;</span>
                                                    <span class="sr-only">Selected</span>
                                                </template>
                                                <template v-else>
                                                    <span aria-hidden="true">&nbsp;</span>
                                                    <span class="sr-only">Not selected</span>
                                                </template>
                                            </template>
                                        </b-table>                                        
                                    </b-card-text>
                                </b-tab>
                                <b-tab title="Vitals">
                                    <b-card-text>
                                        <b-form-input
                                            id="filter-input"
                                            v-model="vitals.search"
                                            type="search"    
                                            placeholder="Type to Search"
                                            size="sm"
                                            class="mb-2"
                                        ></b-form-input>                                        
                                        <b-table striped :items="vitals.data" :fields="vitals.fields"
                                            small :busy="vitals.busy"
                                            selectable
                                            hover
                                            :select-mode="multi"
                                            ref="vitalsTable"
                                            :filter="vitals.search"
                                            @row-selected="onRowSelect">
                                            <template #table-busy>
                                                <div class="text-center text-primary my-2">
                                                    <b-spinner class="align-middle"></b-spinner>
                                                    <strong>Loading...</strong>
                                                </div>
                                            </template>                                        
                                            <template #cell(selected)="{ rowSelected }">
                                                <template v-if="rowSelected">
                                                    <span aria-hidden="true">&check;</span>
                                                    <span class="sr-only">Selected</span>
                                                </template>
                                                <template v-else>
                                                    <span aria-hidden="true">&nbsp;</span>
                                                    <span class="sr-only">Not selected</span>
                                                </template>
                                            </template>
                                        </b-table>                                        
                                    </b-card-text>
                                </b-tab>                            
                            </b-tabs>
                        </b-card>
                    </pane>
                    <pane size="80">
                        <b-row>
                            <b-col cols="12">
                                <b-card>
                                    <b-card-title>Medication</b-card-title>
                                    <b-card-text>                                        
                                        <highchart :modules="['xrange']" :options="medChartOptions" />
                                    </b-card-text>
                                </b-card>                                
                            </b-col>
                        </b-row>                        
                    </pane>
                </splitpanes>
            </b-col>
        </b-row>
        <b-modal id="launch-modal" button-size="sm" centered hide-footer title="Report Criteria">
            <b-row>
                <b-col cols="6">
                    Chart Data from 
                    <b-form-datepicker
                        id="startDate"
                        v-model="launchModal.start_date"                        
                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                        locale="en"
                        size="sm"
                        class="mt-3 mb-3"
                    ></b-form-datepicker>
                </b-col>
                <b-col cols="6">
                    Chart Data to
                    <b-form-datepicker
                        id="endDate"
                        v-model="launchModal.end_date"                        
                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                        locale="en"
                        size="sm"
                        class="mt-3 mb-3"                        
                    ></b-form-datepicker>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-button variant="primary" @click="generateCharts()">Generate Charts</b-button>    
                </b-col>
                <b-col>
                    <b-button variant="primary" text disabled size="sm" v-if="showStatus">
                        <b-spinner small type="grow"></b-spinner>
                        {{loadingMessage}}
                    </b-button>                                    
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-textarea readonly rows="10" v-model="debugLog"></b-textarea>
                </b-col>
            </b-row>
        </b-modal>  

    </b-container>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
    components: { Splitpanes, Pane },
    data() {
        return {
            launchModal : {
                date_label: "Review Date",
                start_date: '',
                end_date: ''
            },
            showStatus: false,
            loadingMessage: "",

            meds : {
                search: "",
                data: [],
                fields: [
                    {label: ' ', key: 'selected'},
                    {label: 'Medication', key: 'name', sortable: false},
                    {label: 'Tags', key: 'tags', sortable: false},
                    {label: 'Last MAR', key: 'last_used', sortable: false},
                    {label: 'Total Doses', key: 'total_doses', sortable: false}
                ],
                loading: false
            },
            
            labs : {
                search: "",
                data: [],
                fields: [
                    {label: ' ', key: 'selected'},
                    {label: 'Lab', key: 'name', sortable: false},
                    {label: 'Category', key: 'syndromes', sortable: false}                    
                ],
                loading: false
            },

            vitals : {
                search: "",
                data: [],
                fields: [
                    {label: ' ', key: 'selected'},
                    {label: 'Lab', key: 'name', sortable: false},
                    {label: 'Category', key: 'syndromes', sortable: false}                    
                ],
                loading: false
            },            

            patient: {},
            medChartOptions: {},
            debugLog:""
        }
    },
    async fetch() {
        console.log("In fetch method of the med review page env " + process.env.BASE_URL) ;

        var _self = this ;

        this.$store.commit('setAppId', this.$services.medreview.APP_ID) ;
        this.$store.commit('setPageTitle', "Drug Reaction Diagnostic Assistant") ;
        this.$services.medreview.dblog("MedReviewHome", "In Med Review Home Page") ;

        this.patient = await this.$services.seal.patient(this.$services.medreview.APP_ID) ;
        console.log("got patient data") ;
        console.log(this.patient) ;
    },
    mounted() {
      this.$bvModal.show("launch-modal") ;
      //this.medChartOptions = this.getMedsChart() ;
    },
    methods : {
        async generateCharts() {

            console.log("Generating charts for ") ;
            console.log(this.launchModal) ;
            
            this.debugLog += "Generating charts \n" ;

            this.showStatus = true ;
            this.loadingMessage = "Medication Data" ;

            //this.$bvModal.hide("launch-modal") ;

            var _self = this ;                                  
            var responses = [] ;
            var response = {} ;

            response = await this.$services.seal.medicationData(this.launchModal.start_date, this.launchModal.end_date, "ALL", '', this.$services.medreview.APP_ID ) ;
            responses.push(response) ;

            while (response.nextUrl) {
                var response = await this.$services.seal.medicationData(this.launchModal.start_date, this.launchModal.end_date, "ALL", data.nextUrl, this.$services.medreview.APP_ID) ;
                responses.push(response) ;
            }
            //var responses = this.$services.medreview.getMedResponses() ;

            console.log("med orders done") ;
            console.log(responses) ;
            this.debugLog += "Got med order responses\n" ;

            var medNames = [] ;
            var meds = [] ;  
            responses.forEach(function(response) {
                response.cats.forEach(function(med) {
                    var medIdx = medNames.indexOf(med.name) ;
                    if (medIdx === -1) {
                        medNames.push(med.name) ;
                        meds.push(med) ;
                    } else {
                        meds[medIdx].data = [].concat(meds[medIdx].data, med.data) ;
                        meds[medIdx].routes = this.merge(meds[medIdx].routes, med.routes) ;
                        meds[medIdx].pcat = this.merge(meds[medIdx].pcat, med.pcat) ;
                        meds[medIdx].med_order_ids = [].contact(meds[medIdx].med_order_ids, med.med_order_ids) ;
                    }
                });              
            }) ;

            //this.medications = meds ;

            this.loadingMessage = "Encounter Data" ;

            var encounters = await this.$services.seal.encounters(this.start_date, this.end_date, '', this.$services.medreview.APP_ID) ;
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

            // remove inpatient data
            console.log("meds") ;
            meds.forEach(function(med) {
                console.log(med.name) ;
                med.data = med.data.filter(function(elem) { return elem.pcat.toLowerCase().indexOf("inpatient") < 0 ; } ) ;
            })

            var rpt_start_date_long = this.$moment(this.launchModal.start_date, "YYYY-MM-DD").toDate().getTime() ;
            var rpt_end_date_long = this.$moment(this.launchModal.end_date, "YYYY-MM-DD").toDate().getTime() ;

            this.loadingMessage = "MAR Data" ;
            
            this.debugLog += "before calling MAR data \n" ;
            
            this.$services.seal.mardata(wsjson, this.$services.medreview.APP_ID).then(responses => {
                console.log("responses length " + responses.length) ;
                this.debugLog += "Got MAR data responses " + responses.length + "\n" ;

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
                
                // remove all elements in the array
                this.meds.data = meds ;
                //this.medications = meds ;

                this.showStatus = false ;
            
                this.debugLog += "done processing MAR data- getting charts \n" ;
                var medChartOptions = this.getMedsChart() ;
                this.debugLog += "Before flatMap\n" ;
                medChartOptions.series[0].data = meds.flatMap(med => med.data) ;
                this.debugLog += "Before Map \n" ;
                medChartOptions.yAxis[0].categories = meds.map(med => med.name) ;

                this.medChartOptions = medChartOptions ;
                
                this.debugLog += "All done \n" ;
                console.log(this.medChartOptions) ;
                console.log("final result of generate report call") ;
                console.log(this.medications) ;

                //this.$bvModal.hide("launch-modal") ;
            }) ;

            this.debugLog += "Getting lab obs data \n" ;
            this.labs.data = await this.getObsData("laboratory") ;
            
            this.debugLog += "Getting vitals obs data \n" ;
            this.vitals.data = await this.getObsData("vital-signs") ;

        },
        async getObsData(category) {
            var responses = [] ;
            //responses.push(initResponse) ;
            var response = await this.$services.seal.obsData(category, this.launchModal.start_date, this.launchModal.end_date, "ALL", '', this.$services.medreview.APP_ID ) ;
            responses.push(response) ;
            //var response = initResponse ;
            while (response.nextUrl) {
                response = await this.$services.seal.obsData(category, this.launchModal.start_date, this.launchModal.end_date, "ALL", data.nextUrl, this.$services.medreview.APP_ID) ;
                responses.push(response) ;
            }
            
            var labs = [] ;
            this.debugLog += "Ajax calls done for " + category + " obs data \n" ;

            responses.forEach(function(response) {
                response.data.forEach(function(lab) {
                    var labIdx = labs.findIndex(function(elem) { return elem.name == lab.name}) ;
                    if (labIdx === -1) {
                        labs.push(lab) ;
                    }
                });              
            }) ;
            return labs ;
        },
        getMedsChart() {
            var chartOptions = this.$services.medreview.getDefaultChartConfig({
                start_time: this.$moment(this.launchModal.start_date, "YYYY-MM-DD").toDate().getTime(),
                end_time: this.$moment(this.launchModal.end_date, "YYYY-MM-DD").toDate().getTime(),
                min: 0,
                //max: 10,
                name: 'Medications Chart',
                type: 'xrange',
                title: 'Medications Chart',
                //height: 350,
                //color: "purple"
            }) ;

            return chartOptions ;
        },
        onRowSelect(item) {
            console.log("row selected") ;
            console.log(item) ;
            // this.$refs.selectableTable.clearSelected()
            // this.$refs.selectableTable.selectRow(2)  // third row
        },
        merge(string1, string2) {
            return this.$services.medreview.unique_merge(string1, string2) ;
        }
    }
}
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