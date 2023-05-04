<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="antimicrobial_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left ml-2">                
                <p class="pt-2">
                    Antimicrobial app developed by SEAL. 
                </p>
                <p>
                    The app uses real time data to get information about anti microbials, cultures and some data.
                </p>
            </b-col>
        </b-row>
        <b-row align-content="center">
            <b-col cols="10" class="text-center h5 pb-2">
                Antimicrobial summary between {{startDateFormatted}} and {{endDateFormatted}}  
                <b-button class="ml-4" size="sm" variant="primary" @click="$bvModal.show('launch-modal')">Modify Period</b-button>
            </b-col>            
        </b-row> 
        <b-row class="mt-1 ml-2">
            <b-col cols="11">
                <b-tabs content-class="" justified card>
                    <b-tab title="Antibiotics Summary" active>
                        <b-card>                            
                            <b-card-text>                                           
                                <h5 class="d-none">Summary:</h5>
                                <b-form-textarea max-rows="20" plaintext size="sm" v-model="notes" id="result" class="mt-3 d-none"/>
                                <h5>Inpatient Antibiotics</h5>
                                <b-table :items="inpatient_arr"  @sort-changed="inpatientSortChanged"
                                    :fields="[{label: 'Medication', key: 'med_name', sortable: true}, {label: 'Therapeutic Class', key: 'thera_class', sortable: true}, 
                                              {label: 'Date Range (sort by earliest date)', key: 'earliest_date', sortable:true}, {label: 'Most Recent', key: 'recent_date', sortable: true}]" 
                                    small bordered head-variant="light"
                                    show-empty>
                                    <template #empty>
                                        <h5 style="text-align:center;height:40px;" class="mt-3">
                                            No antibiotics administered in the given time frame.
                                        </h5>
                                    </template>                                    
                                    <template #cell(earliest_date)="data">
                                        {{ data.item.dates }}
                                    </template>                                    
                                    <template #cell(recent_date)="data">
                                        {{ $moment(data.value).format("MM/DD/YYYY") }}
                                    </template>
                                </b-table> 
                                <copy-to-clipboard-btn label="Copy Inpatient Summary to Clipboard" :content="abxInpatientSummary" key="abxInpatientSummary"/>       
                                <h5 class="mt-3">Outpatient Antibiotics</h5>
                                <b-table :items="outpatient_arr"  @sort-changed="outpatientSortChanged"
                                    :fields="[{label: 'Medication', key: 'med_name', sortable: true}, {label: 'Therapeutic Class', key: 'thera_class', sortable: true}, 
                                            {label: 'Date Range (sort by earliest date)', key: 'earliest_date', sortable:true}, {label: 'Most Recent', key: 'recent_date', sortable: true}, 
                                            {label:'Quantity', key: 'qty'}, {label: 'Refills', key: 'refills'}]" 
                                    small bordered head-variant="light" show-empty>
                                    <template #empty>
                                        <h5 style="text-align:center;height:40px;" class="mt-3">
                                            No antibiotics ordered in the given time frame.
                                        </h5>
                                    </template>                                                                        
                                    <template #cell(earliest_date)="data">
                                        {{ data.item.dates }}
                                    </template>                                                                        
                                    <template #cell(recent_date)="data">
                                        {{ $moment(data.value).format("MM/DD/YYYY") }}
                                    </template>                                    
                                </b-table>        
                                <copy-to-clipboard-btn label="Copy Outpatient Summary to Clipboard" :content="abxOutpatientSummary" key="abxOutpatientSummary"/>       
                                <!--<copy-to-clipboard-btn label="Copy Notes to Clipboard" :content="abxSummary" key="abxSummary"/>-->
                            </b-card-text>
                        </b-card>
                    </b-tab>
                    <b-tab title="Culture Summary">
                        <b-card>                            
                            <b-card-text>                        
                                <b-form-input
                                    id="filter-input"
                                    v-model="cultureFilter"
                                    type="search"    
                                    placeholder="Type to Search"
                                    size="sm"
                                    debounce="300"
                                    class="mb-2"
                                    style="width:20%;display:inline"
                                ></b-form-input>
                                
                                <b-form-select
                                    :options="[{text:'All Fields', value: ''}, {text: 'Date', value: 'collection_dttm'}, {text:'Specimen ID', value: 'specimen_id'}, {text: 'Specimen', value:'specimen_test'}, {text: 'Specimen Source', value:'specimen_source'}, {text:'Result', value: 'result'}, {text: 'Susceptibility', value: 'susceptibility' }]"
                                    v-model="cultureFilterOn"
                                    size="sm"
                                    style="width:20%;display:inline"
                                    class="ml-3"
                                />
                                <div style="font-size:small" class="mb-2">Hint: Please enter "Abnormal" to search for abnormal results. Enter "View" to get all results with susceptability report.</div>

                                <b-table :items="cultureData" :fields="cultureFields" 
                                    small bordered        
                                    :sticky-header="tableHeight()"                            
                                    ref="cultureResultsTable"
                                    v-model="displayedRows"                                    
                                    :filter="cultureFilter"
                                    :filter-included-fields="cultureFilterOn"
                                    @filtered="onFiltered"                                                                
                                    :tbody-tr-class="cultureRowCSS"                                     
                                    sort-icon-left                          
                                    >
                                    
                                    <template #head(rowSelected)="data">
                                        <b-checkbox v-model="toggleAllResults"/>
                                    </template>

                                    <template #cell(rowSelected)="row">                                
                                        <b-form-checkbox v-model="row.item.rowSelected" size="sm" @change="checkboxClicked(row.item)"/>
                                    </template>

                                    <template #cell(collection_dttm_long)="row">
                                        {{row.item.collection_dttm}}
                                    </template>

                                    <template #cell(specimen_test)="row">
                                        {{row.value}}
                                        <div v-if="row.item.surgery_name">
                                            Surgery: {{row.item.surgery_name}} on {{row.item.surgery_start_dttm}}
                                        </div>
                                    </template>
                                    
                                    <template #cell(susceptibility)="row">                                
                                        <b-link @click="showSucepModal(row.item)" v-if="row.value == 'View Report'" style="color:blue">View</b-link>
                                        <span v-else>{{row.value}}</span>
                                    </template>

                                </b-table>

                                <copy-to-clipboard-btn label="Copy Notes to Clipboard" :content="cultureSummary" key="cultureSummary"/>

                                <b-btn @click="compareSusceptabilityReports" variant="primary" size="sm" class="mb-2 mt-2 mr-2" style="float:right">Compare Susceptability</b-btn>                        
                                
                                <b-form-textarea max-rows="20" plaintext size="sm" v-model="cultureNotes" class="box"/>                                                              
                            </b-card-text>
                        </b-card>
                    </b-tab>                    
                </b-tabs>                
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
        
        <b-modal id="susp-modal" button-size="sm" 
            centered hide-footer no-close-on-backdrop  scrollable
            title="Susceptability Report" title-class="mx-auto" size="lg">
            <h5>{{susceptability_data_row.specimen_test}} collected at {{susceptability_data_row.collection_dttm}}</h5>
            <b-table-simple>
                <b-tr>
                    <b-th> Test </b-th>
                    <b-th> Result </b-th>
                    <b-th> Value </b-th>
                    <b-th> Note </b-th>
                </b-tr>
                <b-tr v-for="sdata in susceptability_data" :key="sdata.test">
                    <b-td> {{ sdata.test }} </b-td>
                    <b-td> {{ sdata.result }} </b-td>
                    <b-td> {{ sdata.value }} </b-td>
                    <b-td> {{ sdata.note }} </b-td>
                </b-tr>
            </b-table-simple>
        </b-modal>

        <b-modal id="susp-compare-modal" button-size="sm" 
            centered hide-footer no-close-on-backdrop  scrollable
            title="Susceptability Comparison Report" title-class="mx-auto" size="lg">
            <b-table :items="suscepComparisonRows" striped small thead-class="d-none" />
        </b-modal>

        <b-modal id="launch-modal" button-size="sm" 
            centered hide-footer no-close-on-backdrop 
            title="Report Criteria" title-class="mx-auto">
            <b-row>
                <b-col class="text-center">
                    <b-form-radio-group
                        v-model="launchModal.period_type"
                        :options="[{value: 'I', text: 'Current Inpatient Period', disabled: (inpatient_start_date == '')}, {value:'C', text: 'Custom Period'}]"                        
                    ></b-form-radio-group>                    
                </b-col>                
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">
                    <label for="startDate">Start Date</label>
                </b-col>                
                <b-col>
                    <b-form-input disabled="true" v-if="launchModal.period_type == 'I'" size="sm" :value="inpatient_start_date"/>
                    <editable-date-picker v-model="launchModal.start_date" @error="(event) => {launchModal.errors.start_date = event}" v-else/>
                </b-col>
            </b-row>
            <b-row class="mt-3">
                <b-col class="text-right" cols="4">                    
                    <label for="endDate">End Date</label>
                </b-col>
                <b-col>
                    <b-form-input disabled="true" v-if="launchModal.period_type == 'I'" size="sm" :value="inpatient_end_date"/>
                    <editable-date-picker v-model="launchModal.end_date" @error="(event) => {launchModal.errors.end_date = event}" v-else/>
                </b-col>                
            </b-row>  
            <b-row>
                <b-col cols="10" class="text-center">                    
                    <b-button pill variant="primary" class="ml-3 mt-3" @click="generateCharts" :disabled="!launchModal.errors.start_date || !launchModal.errors.end_date">
                        Fetch Patient Data
                    </b-button>  
                </b-col>
            </b-row> 
            <b-row v-show="launchModal.loading">
                <b-col cols="12"  class="text-center">
                    <b-button variant="info" disabled size="sm" class="mt-3" style="width:100%">
                        <b-spinner small type="grow" class="mr-2"></b-spinner>
                        {{loadingMessage}}
                    </b-button>
                </b-col>
            </b-row> 
        </b-modal>

        <b-modal id="antimicrobial-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
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
import EditableDatePicker from '~/components/EditableDatePicker.vue';
import CopyToClipboardBtn from '~/components/CopyToClipboardBtn.vue' ;

export default {  
    components: { EditableDatePicker, CopyToClipboardBtn },
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
                },                
                period_type : 'C'  // Custom
            },
            notes: "Generating Antibiotics Summary...",
            inpatient_arr: [],
            outpatient_arr: [],
            //abxSummary: '' ,
            cultureNotes: "",
            cultureFilter: "",  
            cultureFilterOn: [],
            cultureFields: [
                {label: '', key: 'rowSelected'},
                {label: 'Date/Time Collected', key: 'collection_dttm_long', sortable: true},
                {label: 'Specimen ID', key: 'specimen_id', sortable: true},
                {label: 'Specimen', key: 'specimen_test', sortable: true},
                {label: 'Specimen Source', key: 'specimen_source', sortable: true},
                {label: 'Result', key: 'result', sortable: true},                
                {label: 'Status', key: 'status', sortable: true},
                {label: 'Susceptibility', key: 'susceptibility', sortable: true}
            ],
            cultureData: [],
            filteredRows: [],
            displayedRows: [],
            currentPage: 1,
            totalRows: 0 ,
            rowsPerPage: 10,
            toggleAllResults: false,
            showDebug: false,
            resultText: "",
            inpatient_start_date: "" ,
            inpatient_end_date : "",
            susceptability_data: [],
            susceptability_data_row : {},
            copyBtnInfo: "",
            loadingMessage: "",
            suscepComparisonRows: [],
            inpatientSortBy: "",
            inpatientSortDesc: false,
            outpatientSortBy: "",
            outpatientSortDesc: false            
        }
    },
    async fetch() {
        console.log("In fetch method of the anti microbial page") ;

        this.$store.commit('setAppId', this.$services.antimicrobial.APP_ID) ;
        this.$store.commit('setPageTitle', "Antimicrobial Dashboard") ;
        this.$store.commit('setCurrentApp', { help : "antimicrobial-help-modal" }) ;
        this.$services.antimicrobial.dblog("AntiMicrobialHome", "In AntiMicrobial Apps Home Page") ;
        
        this.patient = await this.$services.seal.patient(this.$services.antimicrobial.APP_ID) ;
        var response = await this.$services.seal.inpatientdate(this.$services.antimicrobial.APP_ID) ;
        if (response.inpatient_start_date) {
            this.inpatient_start_date = response.inpatient_start_date ;
            this.launchModal.period_type = 'I' ;
        } else {
            this.launchModal.period_type = 'C' ;
        }

    },
    mounted() {
        console.log("In Mounted methood of antimicrobial page") ;
        this.launchModal.start_date = this.$moment().add(-7, 'days').format("MM/DD/YYYY") ;
        this.launchModal.end_date = this.$moment().format("MM/DD/YYYY") ;        
        console.log(this.launchModal) ;
        this.inpatient_end_date = this.$moment().format("MM/DD/YYYY") ;

        this.$bvModal.show("launch-modal") ;           
    },
    watch : {
        toggleAllResults: function(val) {
            console.log("Toggle all results watched : {}", val) ;
            var _self = this ;
            this.$nextTick(() => {
                console.log("in nexttick of toggleallresults") ;
                _self.displayedRows.forEach(cresult => {
                    cresult.rowSelected = val ;
                }) ;                
                if (val) {
                    _self.$refs.cultureResultsTable.selectAllRows() ;
                } else {
                    _self.$refs.cultureResultsTable.clearSelected() ;
                }
            }) ;            
        },
        displayedRows: function(val) {
            console.log("displayed Rows Changed") ;            
            console.log(val) ;
            var _self = this ;

            var rowCss = "" ;
            var prevSpecId = "" ;
            for (var i=0;i<val.length;i++) {
                var row = val[i] ;
                if (row.specimen_id != prevSpecId) {
                    rowCss = (rowCss == ""?"specimen-css":"") ;
                    prevSpecId = row.specimen_id ;
                }
                row.row_color = rowCss ;
            }
            this.$nextTick(() => {
                var rowIdx = 0 ;            
                val.forEach(cresult => {
                    if (cresult.rowSelected) 
                        _self.$refs.cultureResultsTable.selectRow(rowIdx) ;
                    rowIdx++ ;
                }) ;
            }) ;
        }        
    },    
    computed: { 
        startDateFormatted () {            
            return this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        endDateFormatted() {            
            return this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
        },
        abxSummary() {
            return this.notes ;
        },
        abxInpatientSummary() {
            
            var summary = "Inpatient Antimicrobial History:\n"
                        + "----------------------\n\n" ;
            
            var litems = this.inpatient_arr.slice() ;

            if (this.inpatientSortBy) {
                if (this.inpatientSortBy == 'earliest_date' || this.inpatientSortBy == 'recent_date') {
                    litems.sort((a, b) => {
                        if (this.inpatientSortDesc)
                            return b[this.inpatientSortBy] > a[this.inpatientSortBy] ;
                        else
                            return a[this.inpatientSortBy] > b[this.inpatientSortBy] ;
                    })
                } else {
                    litems.sort((a, b) => {
                        if (this.inpatientSortDesc)
                            return b[this.inpatientSortBy].localeCompare(a[this.inpatientSortBy]) ;
                        else
                            return a[this.inpatientSortBy].localeCompare(b[this.inpatientSortBy]) ;                    
                    })
                }
            }

            litems.forEach(ing => {
                summary += ing.med_name + " " + ing.dates + "\n"
            }) ;

            return summary ;
        },
        abxOutpatientSummary() {
            var summary = "Outpatient Antimicrobial History:\n"
                        + "----------------------\n\n" ;
            
            var litems = this.outpatient_arr.slice() ;

            if (this.outpatientSortBy) {
                if (this.outpatientSortBy == 'earliest_date' || this.outpatientSortBy == 'recent_date') {
                    litems.sort((a, b) => {
                        if (this.outpatientSortDesc)
                            return b[this.outpatientSortBy] > a[this.outpatientSortBy] ;
                        else
                            return a[this.outpatientSortBy] > b[this.outpatientSortBy] ;
                    })
                } else {
                    litems.sort((a, b) => {
                        if (this.outpatientSortDesc)
                            return b[this.outpatientSortBy].localeCompare(a[this.outpatientSortBy]) ;
                        else
                            return a[this.outpatientSortBy].localeCompare(b[this.outpatientSortBy]) ;                    
                    })
                }
            }

            litems.forEach(ing => {
                summary += ing.med_name + " " + ing.dates + " Qty: " + ing.qty + " Refills: " + ing.refills + "\n"
            }) ;
            
            return summary ;

        },        
        cultureSummary() {            
            this.generateCultureNotes() ;
            console.log(this.cultureNotes) ;
            return this.cultureNotes ;
        }
    },
    methods: {    
        log(mesg) {
            //console.log(mesg) ;
            this.resultText += "\n" + this.$moment().format("LTS") + ": " + mesg ;            
        },
        inpatientSortChanged(ctx) {
            console.log("Filter Changed") ;
            console.log(ctx) ; 
            this.inpatientSortBy = ctx.sortBy
            this.inpatientSortDesc = ctx.sortDesc
        },
        outpatientSortChanged(ctx) {
            console.log("Filter Changed") ;
            console.log(ctx) ;            
            this.outpatientSortBy = ctx.sortBy
            this.outpatientSortDesc = ctx.sortDesc
        },
        compareSusceptabilityReports() {
            var susRows = [] ;

            this.cultureData.forEach(cresult => {
                if (!cresult.rowSelected) return ;                
                if (cresult.memberId.length > 0) {                    
                    susRows.push(cresult) ;
                }                
            }) ;

            if (susRows.length <= 0) {
                alert("Please select rows with Susceptability results for comparison") ;
                return ;
            }
            
            // generate unique sus tests
            var susTests = [] ;
            susRows.forEach(row => {
                row.susObj = {} ;
                row.susceptability_data.forEach(sd => {
                    row.susObj[sd.test] = sd.result + (sd.value?" (" + sd.value + ")":"") ;
                    if (susTests.indexOf(sd.test) < 0)
                        susTests.push(sd.test) ;
                })
            }) ;

            var susTableRows = [] ;
            var headerRow = {test: ""} ;
            for (var i=0;i<susRows.length;i++) {
                headerRow["col" + i] = susRows[i].specimen_test + " collected at " + susRows[i].collection_dttm ;
            }
            susTableRows.push(headerRow) ;

            susTests.forEach(st => {
                var row = { test: st } ;
                for (var i=0;i<susRows.length;i++)
                    row["col" + i] = susRows[i].susObj[st] ;
                susTableRows.push(row) ;
            }) ;
            
            this.suscepComparisonRows = susTableRows ;

            this.log("suscep comp rows :" + JSON.stringify(susTableRows)) ;
            
            this.$bvModal.show("susp-compare-modal") ;

        },
        tableHeight() {
            console.log((window.innerHeight * 75/100) + "px") ;
            return (window.innerHeight * 75/100) + "px" ;
        },        
        checkboxClicked(item) {
            console.log("checked clicked {}", item) ;                        
            var fIdx = this.displayedRows.findIndex(row => row.id == item.id) ;
            console.log("fidx :" + fIdx) ;            
            if (item.rowSelected) 
                this.$refs.cultureResultsTable.selectRow(fIdx) ;
            else
                this.$refs.cultureResultsTable.unselectRow(fIdx) ;            
        },
        onRowClicked(item, idx) {
            console.log("In rowClicked event row idx:" + idx + " isselected :" + this.$refs.cultureResultsTable.isRowSelected(idx)) ;            
            // Clicked event triggers first and then the row selection event - so using reverse logic here
            if (this.$refs.cultureResultsTable.isRowSelected(idx))
                item.rowSelected = false ;
            else 
                item.rowSelected = true ;
        },
        cultureRowCSS(item) {  
            var rowCss = "" ;
            if (item.normal && item.normal.toLowerCase() == "abnormal") 
                rowCss = "text-danger" ;
            rowCss = rowCss + " " + item.row_color ;
            return rowCss ;
        },
        showSucepModal(cultureResult) {
            console.log("In show Modal Link {}", cultureResult) ;
            this.susceptability_data = cultureResult.susceptability_data ;
            this.susceptability_data_row = cultureResult ;

            this.$bvModal.show("susp-modal") ;
        },
        onFiltered(filteredItems) {
            console.log("in onFiltered method " + filteredItems.length) ;
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.filteredRows = filteredItems ;
            var _self = this ;
            this.totalRows = filteredItems.length ;
            this.$nextTick(() => {
                var rowIdx = 0 ;            
                filteredItems.forEach(cresult => {
                    if (cresult.rowSelected) 
                        _self.$refs.cultureResultsTable.selectRow(rowIdx) ;
                    rowIdx++ ;
                }) ;  
            }) ;            
            //this.currentPage = 1
        },
        generateCultureNotes() {

            var _self = this ;
            var cultureNotes = "Culture History:\n"
                        + "----------------------" ;
            
            // sort data based on specimen_id
            this.cultureData.sort((a, b) => a.specimen_id.localeCompare(b.specimen_id)) ;
            
            var prevSurgeryKey = ""  ;
            var prevSpecimenId = "" ;

            this.cultureData.forEach(cresult => {
                if (!cresult.rowSelected) return ;                
                try {
                    if (prevSurgeryKey != cresult.surgery_name + cresult.surgery_start_dttm) {
                        prevSurgeryKey = cresult.surgery_name + cresult.surgery_start_dttm ;
                        cultureNotes += "\n\n<<<<<\t" + cresult.surgery_start_dttm.split(" ")[0] + " Surgery/Procedure: " + cresult.surgery_name + 
                                " start date: " + cresult.surgery_start_dttm.split(" ")[0] + " Start time: " + cresult.surgery_start_dttm.split(" ")[1] + " >>>>>";  
                    }
                    if (prevSpecimenId != cresult.specimen_id) {
                        cultureNotes += "\n\nSpecimen: " + cresult.specimen_id + " collected at " + cresult.collection_dttm +  " from " + cresult.specimen_source ;
                        prevSpecimenId = cresult.specimen_id ;
                    }
                    if (cresult.result != null) {
                        cultureNotes += "\n" + cresult.collection_dttm.split(" ")[0] + " " + cresult.specimen_test + " - " + cresult.result ;
                    }   
                    if (cresult.memberId.length > 0) {
                        cultureNotes += "\n" + " ".padEnd(10) + "Susceptability Report\n\n" ;                 
                        cresult.susceptability_data.forEach(tresult => {
                            //cultureNotes += "\t\t\t" + tresult.test + "\t\t\t\t" + tresult.result + "\t\t" + tresult.value + "\n" ;
                            cultureNotes += " ".padEnd(10) + tresult.test.padEnd(50) + tresult.result.padEnd(20) + tresult.value + "\n" ;
                        }) ;
                    }
                } catch (err) {
                    _self.log("Error in culture note constructions..." + err) ;
                }                
            }) ;

            _self.log("Culture Notes constructed") ;
            _self.log(cultureNotes) ;
            _self.cultureNotes = cultureNotes ;

            //this.copyToClipboard('cultureNotes') ;

        },
        async generateCharts() {

            console.log("Generating charts for ") ;
            console.log(this.launchModal) ;
            
            var _self = this ;

            this.launchModal.loading = true ;
                            
            if (this.launchModal.period_type == 'I') {
                this.launchModal.rpt_start_date = this.$moment(this.inpatient_start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
                this.launchModal.rpt_end_date = this.$moment(this.inpatient_end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
            } else {
                this.launchModal.rpt_start_date = this.$moment(this.launchModal.start_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
                this.launchModal.rpt_end_date = this.$moment(this.launchModal.end_date, 'MM/DD/YYYY').format("YYYY-MM-DD") ;
            }

            var rpt_start_date_long = this.$moment(this.launchModal.rpt_start_date, "YYYY-MM-DD").toDate().getTime() ;
            var rpt_end_date_long = this.$moment(this.launchModal.rpt_end_date, "YYYY-MM-DD").toDate().getTime() ;

            this.$set(this.launchModal, 'rpt_start_date_long', rpt_start_date_long) ;
            this.$set(this.launchModal, 'rpt_end_date_long', rpt_end_date_long) ;

            var responses = [] ;
            var response = {} ;

            this.log("Fetching Surgical Data") ;
            this.loadingMessage = "Surgical Data" ;
            var surgicalData = await this.$services.antimicrobial.surgicalData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date ) ;            

            this.log(JSON.stringify(surgicalData)) ;

            this.log("Fetching Culture Data") ;
            this.loadingMessage = "Culture Data" ;
            var cresponse = await this.$services.antimicrobial.cultureData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date ) ;            

            this.log(JSON.stringify(cresponse)) ;  
            
            // reset arrays
            this.inpatient_arr.splice(0, this.inpatient_arr.length) ;
            this.outpatient_arr.splice(0, this.outpatient_arr.length) ;
            this.cultureData.splice(0, this.cultureData.length) ;

            var rowColor = "" ;
            cresponse.forEach( spec => {
                rowColor = (rowColor == ""?"specimen-css":"") ;
                spec.results.forEach(res => {
                    if (res.value == 'See Test Comment' && spec.narrative) 
                        res.value = spec.narrative ;
                    var cresult = {
                        id: res.id,
                        collection_dttm_long: spec.collection_dt,
                        collection_dttm: _self.$moment(spec.collection_dt).format("MM/DD/YYYY HH:mm"),
                        specimen_id: ((res.specimen_id && res.specimen_id != spec.specimen_id) ? spec.specimen_id + '/' + res.specimen_id : spec.specimen_id) ,
                        specimen_test: res.name,
                        result: (res.result ? res.result + ': ' : '') + (res.value?res.value:"") ,
                        normal: res.result,
                        status: res.status,
                        specimen_source: res.specimen_source,                        
                        rowSelected: false,
                        surgery_name: '',
                        surgery_start_dttm: '',
                        surgery_end_dttm: '',
                        susceptibility: ((res.memberId && res.memberId.length > 0)?"View Report":"") ,
                        susceptability_data: [],
                        memberId: (res.memberId ? res.memberId.substr(res.memberId.indexOf("/") + 1) : ""),
                        row_color: rowColor
                    } ;
                    if (!cresult.result) cresult.result = "" ;     
                    var sIdx = surgicalData.findIndex(elem => {
                        return (spec.collection_dt >= elem.dtstart && spec.collection_dt <= elem.dtend) ;
                    }) ;
                    if (sIdx >= 0) {
                        cresult.surgery_name = surgicalData[sIdx].surgery.toLowerCase() ;
                        cresult.surgery_start_dttm = _self.$moment(surgicalData[sIdx].dtstart).format("MM/DD/YYYY HH:mm") ;
                        cresult.surgery_end_dttm = _self.$moment(surgicalData[sIdx].dtend).format("MM/DD/YYYY HH:mm") ;
                    }
                    this.cultureData.push(cresult) ;
                })
            }) ;
            //this.filteredRows = this.cultureData ;    
            this.totalRows = this.cultureData.length ;
            
            this.log("Processing cultureData....") ;
            this.log(JSON.stringify(this.cultureData)) ;  

            var susp = [] ;
            cresponse.forEach(spec => {
               spec.results.forEach(result => {
                    if (result.memberId) {
                        susp.push(result.memberId.substr(result.memberId.indexOf("/") + 1)) ;
                    }
                }) ;
            }) ;
            this.log("Before invoking susceptability call size :" + susp.length) ;
            
            this.loadingMessage = "Susceptability Data" ;
            this.$services.antimicrobial.susceptability(susp).then(sresponses => {
                var susceptability = [] ;                      
                _self.log("After invoking susceptability call size :" + sresponses.length) ;
                sresponses.forEach(sresponse => {
                    try {
                    _self.log("susceptability response");
                    _self.log(JSON.stringify(sresponse.data)) ;
                    var str = "" ;                     
                    if (sresponse.data.susceptability_data) {
                        sresponse.data.susceptability_data.forEach(tresult => {
                            str += tresult.test + "\t\t" + tresult.result + "\t\t" + tresult.value + "\t\t" + tresult.note + "\n" ;
                        }) ;
                        console.log("got sreport for " + sresponse.data.memberId) ;
                        console.log(str) ;
                        susceptability.push({ memberId: sresponse.data.memberId, report: str }) ;
                        
                        // set the sus data to cultureData
                        var sIdx = _self.cultureData.findIndex(elem => elem.memberId == sresponse.data.memberId) ;
                        _self.log("Found the memberId :" + sresponse.data.memberId + " in cultureData Idx :" + sIdx) ;
                        _self.cultureData[sIdx].susceptability_data = sresponse.data.susceptability_data ;

                    }
                    } catch (err) {
                        _self.log("Error in handling susceptability response :" + err) ;
                    }
                }) ;
                _self.log("culturedata including susceptability matrix") ;
                _self.log(JSON.stringify(_self.cultureData)) ;  
            }) ;

            this.loadingMessage = "Medication Data" ;
            response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "", '', this.$services.antimicrobial.APP_ID ) ;            
            responses.push(response) ;

            while (response.nextUrl) {
                response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "", response.nextUrl, this.$services.antimicrobial.APP_ID) ;
                responses.push(response) ;
            }

            console.log("med orders done") ;
            console.log(responses) ;
            
            var medNames = [] ;
            var meds = [] ;  
            responses.forEach((response) => {                
                response.cats.forEach((med) => {
                    try {
                        // Only antibiotics - added antiviral and antifungal - request from Dr Amy Chang
                        if (med.thera_class && 
                                (["antibiotics", "antivirals", "antifungals", "antiparasitics", "antiinfectives", "antiinfectives/miscellaneous"]
                                    .indexOf(med.thera_class.toLowerCase()) >= 0)
                         ) {                            
                            var medIdx = medNames.indexOf(med.name) ;
                            if (medIdx === -1) {
                                medNames.push(med.name) ;
                                meds.push(med) ;
                            } else {
                                meds[medIdx].data = [].concat(meds[medIdx].data, med.data) ;
                                meds[medIdx].routes = this.$services.medreview.unique_merge(meds[medIdx].routes, med.routes) ;
                                meds[medIdx].pcat = this.$services.medreview.unique_merge(meds[medIdx].pcat, med.pcat) ;
                                meds[medIdx].ingredient = this.$services.medreview.unique_merge(meds[medIdx].ingredient, med.ingredient) ;
                                meds[medIdx].med_order_ids = [].concat(meds[medIdx].med_order_ids, med.med_order_ids) ;                                
                            }
                        }
                    } catch (err) {
                        _self.log("Error in merging medstat response for " + JSON.stringify(med)) ;
                        _self.log(err)   ;
                    }
                });              
            }) ;

            /**************  New Code Starts here  **************/
            var encounters = await this.$services.seal.encounters(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, '', this.$services.antimicrobial.APP_ID) ;

            console.log("encounters....") ;
            console.log(encounters) ;

            var wsjson = {} ;
            
            _self.log("ABX Meds data :" + JSON.stringify(meds)) ;
            
            _self.log("Got encounters: " + JSON.stringify(encounters)) ;

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

            this.loadingMessage = "MAR Data" ;
            
            _self.log("before calling MAR data") ;

            // remove inpatient data                
            meds.forEach(function(med) {
                med.data = med.data.filter(function(elem) { return elem.pcat.toLowerCase().indexOf("inpatient") < 0 ; } ) ;
            }) ;

            this.$services.seal.mardata(wsjson, this.$services.antimicrobial.APP_ID).then(responses => {
                console.log("responses length " + responses.length) ;
                _self.log("Got MAR data responses " + responses.length ) ;

                responses.forEach(response => {                    
                    response.data.Orders.forEach(order => {
                        _self.log("Processing MAR Data for order " + order.Name) ;
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

                var ingredients = [] ;
                meds.forEach(med => {
                    try {
                    var ingIdx = ingredients.findIndex(function(ing) { return (ing.ingredient == med.ingredient) } ) ;
                    _self.log("found ingredient " + med.ingredient + " in ingredients idx :" + ingIdx) ;
                    if (ingIdx > -1) {
                        ingredients[ingIdx] = this.$services.medreview.merge_meds(ingredients[ingIdx], med) ;
                    } else {
                        var ingObj = JSON.parse(JSON.stringify(med))  ;
                        ingObj.name = (med.ingredient?med.ingredient:med.name) ;                    
                        ingredients.push(ingObj) ;
                    }    
                    } catch (err) {
                        _self.log("error in ingredient constructions :" + err) ;
                    }            
                }) ;
                
                _self.log("ABX Ingredients: " + JSON.stringify(ingredients)) ;                
                // sort the dates for each ing
                ingredients.forEach(ing => {
                    ing.data.sort(function(a, b) { return a.x - b.x }) ;
                }) ;
    
                // sort by name first
                ingredients.sort((ing_a, ing_b) => {
                    return ing_a.name.localeCompare(ing_b.name) ;
                }) ;
                
                // truncate timestamp to date
                ingredients.forEach(ing => {
                    ing.data.forEach(dt => { dt.x = _self.$moment(dt.x).startOf('day').valueOf() ; dt.x2 = _self.$moment(dt.x2).startOf('day').valueOf() ; }) ;
                }) ;


                // sort the ing based on the last date in the dates list
                ingredients.sort((ing_a, ing_b) => {
                    // if end date is same, use the start date for sorting
                    if (ing_a.data[ing_a.data.length - 1].x2 == ing_b.data[ing_b.data.length - 1].x2)
                        return ing_a.data[ing_a.data.length - 1].x - ing_b.data[ing_b.data.length - 1].x ;
                    else
                        return ing_a.data[ing_a.data.length - 1].x2 - ing_b.data[ing_b.data.length - 1].x2 ;
                }) ;

                _self.log("ABX Ingredients after ordering: " + JSON.stringify(ingredients)) ;

                _self.notes = "Antimicrobial History:\n"
                            + "----------------------\n\n" ;

                this.loadingMessage = "Anitmicrobial Summary" ;

                var futureSectionCreated = false ;
                
                ingredients.forEach(ing => {
                    var dates = "" ;

                    _self.log("Processign ing :" + ing.name) ;                                
                    ing.data.forEach(dt => {
                        if (!dt.validEndDate) dt.validEndDate = "Y" ;
                        dt.x = _self.$moment(dt.x).startOf("day") ;
                        dt.x2 = _self.$moment(dt.x2).startOf("day") ;
                    }) ;

                    var idx = 0 ;            
                    while (true) {
                        var dt = ing.data[idx] ;

                        _self.log("     start :" + dt.x.format("MM/DD/YYYY") + " end :" + dt.x2.format("MM/DD/YYYY") + " valid: " + dt.validEndDate) ;
                        _self.log(dt) ;
                                            
                        if (dt.pcat == "Community") {    // != Inpatient
                            dates += dt.x.format("MM/DD/YY") + "-" + dt.x2.format("MM/DD/YY") + " Qty: " + dt.quantity + " " + dt.form + " Refills: " + dt.numberOfRefills + " (outpatient) , ";
                            idx++ ;
                        } else {
                            dates += dt.x.format("MM/DD/YY") ;
                            while (true) {
                                idx++ ;                            
                                if (idx >= ing.data.length || ing.data[idx].pcat == 'Community' || ing.data[idx].x.diff(dt.x2, 'days') > 1) {
                                    dates += '-' + dt.x2.format("MM/DD/YY") + ", " ;
                                    break ;
                                }
                                dt = ing.data[idx] ;
                            }
                        }                     
                        if (idx >= ing.data.length) break ;
                    }
                    dates = dates.trim() ;
                    if (dates.endsWith(",")) dates = dates.slice(0, -1) ;
                    ing.dates = dates ;

                    if (dates.indexOf("-Present") > 0 && !futureSectionCreated) {
                        if (_self.notes.endsWith("\n\n"))
                            _self.notes += ing.name + " " + ing.dates + "\n";    
                        else
                            _self.notes += "\n" + ing.name + " " + ing.dates + "\n";    
                        futureSectionCreated = true ;
                    } else {
                        _self.notes += ing.name + " " + ing.dates + "\n";
                    }
                }) ;
                
                ingredients.forEach(ing => {                
                    var inpatient_dates = "" ;
                    var recentDate = 0 ;
                    var earliestDate = 0 ;

                    _self.log("Processign ing :" + ing.name) ;                                
                    ing.data.forEach(dt => {
                        if (!dt.validEndDate) dt.validEndDate = "Y" ;
                        dt.x = _self.$moment(dt.x).startOf("day") ;
                        dt.x2 = _self.$moment(dt.x2).startOf("day") ;
                    }) ;

                    var idx = 0 ;
                    while (true) {
                        var dt = ing.data[idx] ;
                        
                        _self.log("     start :" + dt.x.format("MM/DD/YYYY") + " end :" + dt.x2.format("MM/DD/YYYY") + " valid: " + dt.validEndDate) ;
                        _self.log(dt) ;
                        
                        if (dt.pcat == "Community") {
                            this.outpatient_arr.push({med_name: ing.name, dates: dt.x.format("MM/DD/YY") + "-" + dt.x2.format("MM/DD/YY") , 
                                                        qty: dt.quantity + " " + dt.form, refills: dt.numberOfRefills, 
                                                        earliest_date: dt.x.valueOf(), recent_date: dt.x2.valueOf(), thera_class: ing.thera_class }) ;                        
                            idx++ ;
                        } else {
                            if (earliestDate == 0)
                                earliestDate = dt.x.valueOf() ;
                            inpatient_dates += dt.x.format("MM/DD/YY") ;                        
                            while (true) {
                                idx++ ;                            
                                if (idx >= ing.data.length || ing.data[idx].pcat == 'Community' || ing.data[idx].x.diff(dt.x2, 'days') > 1) {
                                    inpatient_dates += '-' + dt.x2.format("MM/DD/YY") + ", " ;
                                    recentDate = dt.x2.valueOf() ;
                                    break ;
                                }
                                dt = ing.data[idx] ;
                            }
                        }                                       
                        if (idx >= ing.data.length) break ;
                    }
                    if (inpatient_dates.trim().length > 0) {
                        inpatient_dates = inpatient_dates.trim() ;
                        if (inpatient_dates.endsWith(",")) inpatient_dates = inpatient_dates.slice(0, -1) ;
                        _self.inpatient_arr.push({med_name: ing.name, dates: inpatient_dates, earliest_date: earliestDate, recent_date: recentDate, thera_class: ing.thera_class}) ;
                    }
                }) ;

                this.launchModal.loading = false ;
                this.$bvModal.hide("launch-modal") ;


                _self.log("All done") ;

            }) ;            

            /**************  New Code Ends here  **************/


        }
    }
}

/**
 * Set the global timezone to PST
 */
Highcharts.setOptions({
    time: {
        timezoneOffset: new Date().getTimezoneOffset(),
        useUTC: false
    }
});

</script>

<style scoped>
    .scroll-table {
        height: 80vh;
        overflow-y:scroll;        
    }
</style>
<style>
    .specimen-css {
        background-color: #E0E0E0;
    }
</style>