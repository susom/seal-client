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
                <p>
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
                                <h5>Summary:</h5>
                                <b-form-textarea max-rows="20" plaintext size="sm" v-model="notes" id="result" class="mt-3"/>
                                <b-btn @click="copyToClipboard('notes')" variant="primary" size="sm" class="mb-2">Copy Notes to Clipboard</b-btn>
                                <span class="pl-3" style="font-size:small">{{copyBtnInfo}}</span>                                
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

                                <b-btn variant="primary" size="sm" class="float-right ml-2" @click="selectAll">Select Results in All Pages</b-btn>
                                <b-btn variant="primary" size="sm" class="float-right ml-2" @click="clearAll">Clear Selection in All Pages</b-btn>

                                <b-table striped :items="cultureData" :fields="cultureFields" 
                                    small hover
                                    :per-page="rowsPerPage"
                                    ref="cultureResultsTable"
                                    v-model="displayedRows"
                                    selectable
                                    select-mode="multi"                                    
                                    @row-clicked="onRowClicked"
                                    :filter="cultureFilter"
                                    :filter-included-fields="cultureFilterOn"
                                    @filtered="onFiltered"                            
                                    :total-rows="totalRows"
                                    :current-page="currentPage"
                                    :tbody-tr-class="cultureRowCSS"                            
                                    >
                                    
                                    <template #head(rowSelected)="data">
                                        <b-checkbox v-model="toggleAllResults"/>
                                    </template>

                                    <template #cell(rowSelected)="row">                                
                                        <b-form-checkbox v-model="row.item.rowSelected" size="sm" @change="checkboxClicked(row.item)"/>
                                    </template>

                                    <template #cell(specimen_test)="row">
                                        {{row.value}}
                                        <div v-if="row.item.surgery_name">
                                            Surgery: {{row.item.surgery_name}} on {{row.item.surgery_start_dttm}}
                                        </div>
                                    </template>
                                    
                                    <template #cell(susceptibility)="row">                                
                                        <b-link @click="showSucepModal(row.item)" v-if="row.value == 'Yes'" style="color:blue">View</b-link>
                                        <span v-else>{{row.value}}</span>
                                    </template>

                                </b-table>
                                <!-- hide-ellipsis -->
                                <b-pagination                                 
                                    :total-rows="totalRows" 
                                    :per-page="rowsPerPage" 
                                    align="right"                                    
                                    v-model="currentPage"  />

                                <b-btn @click="generateCultureNotes" variant="primary" size="sm" class="mb-2">Generate Notes</b-btn>                        
                                <b-btn @click="copyToClipboard('cultureNotes')" variant="primary" size="sm" class="mb-2">Copy Notes to Clipboard</b-btn>
                                <span class="pl-3" style="font-size:small">{{copyBtnInfo}}</span>
                                
                                <b-form-textarea max-rows="20" plaintext size="sm" v-model="cultureNotes" class="box"/>                                                              
                            </b-card-text>
                        </b-card>
                    </b-tab>                    
                </b-tabs>                
            </b-col>
        </b-row>

        <!--
        <b-row class="mt-1 ml-2">
            <b-col cols="11">
                <b-card>
                    <b-card-title>Summary Notes</b-card-title>
                    <b-card-text>
                        <b-form-textarea max-rows="20" plaintext size="sm" v-model="notes" id="result"/>                                          
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="mt-4 ml-2">
            <b-col cols="11">
                <b-card>
                    <b-card-title>Culture Notes</b-card-title>
                    <b-card-text>                        
                        <b-form-input
                            id="filter-input"
                            v-model="cultureFilter"
                            type="search"    
                            placeholder="Type to Search"
                            size="sm"
                            debounce="300"
                            class="mb-2"
                            style="width:30%;display:inline"
                        ></b-form-input>
                        
                        <b-form-select
                            :options="[{text:'All Fields', value: ''}, {text: 'Date', value: 'collection_dttm'}, {text:'Specimen ID', value: 'specimen_id'}, {text: 'Specimen', value:'specimen_test'}, {text: 'Specimen Source', value:'specimen_source'}, {text:'Result', value: 'result'}, {text: 'Susceptibility', value: 'susceptibility' }]"
                            v-model="cultureFilterOn"
                            size="sm"
                            style="width:30%;display:inline"
                            class="ml-3"
                        />
                        
                        <b-table striped :items="cultureData" :fields="cultureFields" 
                            small hover
                            per-page="10"
                            ref="cultureResultsTable"
                            :filter="cultureFilter"
                            :filter-included-fields="cultureFilterOn"
                            @filtered="onFiltered"                            
                            :total-rows="totalRows"
                            :current-page="currentPage"
                            :tbody-tr-class="cultureRowCSS"                            
                            select-mode="multi">
                            
                            <template #head(rowSelected)="data">
                                <b-checkbox v-model="toggleAllResults"/>
                            </template>

                            <template #cell(rowSelected)="row">                                
                                <b-form-checkbox v-model="row.item.rowSelected" size="sm" @change="checkboxClicked(row.item)"/>
                            </template>

                            <template #cell(specimen_test)="row">
                                {{row.value}}
                                <div v-if="row.item.surgery_name">
                                    Surgery: {{row.item.surgery_name}} on {{row.item.surgery_start_dttm}}
                                </div>
                            </template>
                            
                            <template #cell(susceptibility)="row">                                
                                <b-link @click="showSucepModal(row.item)" v-if="row.value == 'Yes'" style="color:blue">View</b-link>
                                <span v-else>{{row.value}}</span>
                            </template>

                        </b-table>
                        <b-pagination                                 
                            :total-rows="totalRows" 
                            per-page="10" 
                            align="right"
                            hide-ellipsis
                            v-model="currentPage"  />

                        <b-btn @click="generateCultureNotes" variant="primary" size="sm" class="mb-2">Generate Notes</b-btn>
                        <b-form-textarea max-rows="20" plaintext size="sm" v-model="cultureNotes"/>                                                      
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>        
        -->
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

export default {  
    components: { EditableDatePicker },
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
            cultureNotes: "",
            cultureFilter: "",  
            cultureFilterOn: "",
            cultureFields: [
                {label: '', key: 'rowSelected'},
                {label: 'Date/Time Collected', key: 'collection_dttm'},
                {label: 'Specimen ID', key: 'specimen_id'},
                {label: 'Specimen', key: 'specimen_test'},
                {label: 'Specimen Source', key: 'specimen_source'},
                {label: 'Result', key: 'result'},                
                {label: 'Status', key: 'status'},
                {label: 'Susceptibility', key: 'susceptibility'}
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
            copyBtnInfo: ""
        }
    },
    async fetch() {
        console.log("In fetch method of the anti microbial page") ;

        this.$store.commit('setAppId', this.$services.antimicrobial.APP_ID) ;
        this.$store.commit('setPageTitle', "Antimicrobial Dashboard") ;
        this.$store.commit('setCurrentApp', { help : "antimicrobial-help-modal" }) ;
        this.$services.antimicrobial.dblog("AntiMicrobialHome", "In AntiMicrobial Apps Home Page") ;
        
        var _self = this ;

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
    },
    methods: {    
        log(mesg) {
            this.resultText += "\n" + this.$moment().format("LTS") + ": " + mesg ;
        },
        selectAll() {
            if (this.filteredRows.length > 0)
                this.filteredRows.forEach(cresult => { cresult.rowSelected = true } ) ;
            else
                this.cultureData.forEach(cresult => { cresult.rowSelected = true } ) ;
            this.$refs.cultureResultsTable.selectAllRows() ;
        },
        clearAll() {
            this.cultureData.forEach(cresult => { cresult.rowSelected = false } ) ;
            this.$refs.cultureResultsTable.clearSelected() ;
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
        copyToClipboard(copyFrom) {
            var result = "" ;
            var _self = this ;
            if (copyFrom == 'cultureNotes') {
                result = this.cultureNotes ;                
            } else {
                result = this.notes ;
            }

            if (window.clipboardData) {
                window.clipboardData.setData('Text', result);
                this.copyBtnInfo = "Result copied to clipboard." ;
                window.setTimeout(function() { _self.copyBtnInfo = "" ; }, 2000) ;
            } else {
                this.copyBtnInfo = "windows.clipboarddata doesn't exist" ;
                window.setTimeout(function() { _self.copyBtnInfo = "" ; }, 2000) ;
            }            
        },
        cultureRowCSS(item) {  
            if (item.normal && item.normal.toLowerCase() == "abnormal") return "text-danger" ;
        },
        showSucepModal(cultureResult) {
            console.log("In show Modal Link {}", cultureResult) ;
            this.susceptability_data = cultureResult.susceptability_data ;
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

            var surgicalData = await this.$services.antimicrobial.surgicalData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date ) ;            
            //var surgicalData = 
            //    [{"surgery":"WRIST INCISION AND DRAINAGE","dtstart":1638932400000,"dtend":1638939720000},{"surgery":"CERVICAL POSTERIOR INCISION AND DRAINAGE OR DEBRIDEMENT","dtstart":1638716580000,"dtend":1638757800000},{"surgery":"CORPECTOMY; 1 LEVEL; SECONDARY PROCEDURE","dtstart":1638716580000,"dtend":1638757800000},{"surgery":"CERVICAL POSTERIOR DISCECTOMY AND FUSION WITH INSTRUMENTATION; 3+ LEVELS","dtstart":1638716580000,"dtend":1638757800000},{"surgery":"MANAGEMENT COMPLEX; SECONDARY MODIFIER","dtstart":1638716580000,"dtend":1638757800000},{"surgery":"MAGNETIC RESONANCE IMAGING; OUTSIDE THE OPERATING ROOM","dtstart":1638679500000,"dtend":1638682500000}] ;

            this.log(JSON.stringify(surgicalData)) ;

            this.log("Fetching Culture Data") ;
            var cresponse = await this.$services.antimicrobial.cultureData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date ) ;            
            //var cresponse =             
            //[{"specimen_id":"21S-337UR0014","collection_dt":1638523140000,"results":[{"id":"Observation/eRvAG7.Obk-7nc5n6ovxiC9FfhYWcdZwSET1re0EH793ZiUQLRVWxvEMyC7111nV68XleqEyP7wQHyWz8eyfpkw3","display":"Component (1): CULTURE, URINE","name":"Culture, Urine","value":"See Test Comment","result":null,"time":"12/05/2021 08:19","status":"Final","specimen_fhir_id":"eBBHxWAEG-yv83TpSe8qVbx5ghpeihPpVvmeMzjMvGdk3","specimen_id":"21S-337UR0014","specimen_source":"Clean Catch Urine"}]},{"specimen_id":"21S-337MI0397","collection_dt":1638580500000,"results":[{"id":"Observation/exIY4ESuTbkM9qdrwZ59f8uTMCBG2LyDbYAj6kh6U7wEkD5I7NjuP8fi5Yahall4QNB2ciZL178J8-oHBkJrvyg3","display":"Component (1): CULTURE, BLOOD (AER/ANA)","name":"Culture, Blood (Aer/Ana)","value":"No growth at 5 days.","result":null,"time":"12/08/2021 20:01","status":"Final","specimen_fhir_id":"eDFSd.xACrAx.H0br1cHTwJ--pGnsDlhGUK95KSY7hlY3","specimen_id":"21S-337MI0397","specimen_source":"Hand, Left"}]},{"specimen_id":"21S-337MI0398","collection_dt":1638581520000,"results":[{"id":"Observation/e3npSU4wzC8YFPG6KI6..3c6I7iqIqMP1qzJYzYuIz4j887RgSJanWo5pXBx5XqWipBZWZ9A4J-b6qGGRR.Mr6A3","display":"Component (1): CULTURE, BLOOD (AER/AER)","name":"Culture, Blood (Aer/Aer)","value":"No growth at 5 days.","result":null,"time":"12/08/2021 20:01","status":"Final","specimen_fhir_id":"e4pQlkxTJJ2-HNgDdcGry8VrSOOgOuINS-u6LK-2MamY3","specimen_id":"21S-337MI0398","specimen_source":"Hand, Left"}]},{"specimen_id":"21S-339MI0093","collection_dt":1638728880000,"results":[{"id":"Observation/eTxT06ZR1.u5SHxzodZjs6K87be50VpIfI.5fv88WRpJ1mX1wQtCu3wuIDLOGFQYwdgmagW1KfZmKx.tj5gfyFw3","display":"Component (1): CULTURE, ORTHO ANAEROBIC","name":"Culture, Ortho Anaerobic","value":"No growth at 14 days.","result":null,"time":"12/19/2021 15:01","status":"Final","specimen_fhir_id":"ea7wJGRtPc2pyL2LiKNUIIbGfM1oetCGvcBJdLRQhgPQ3","specimen_id":"1","specimen_source":"Joint, Hip, Right"},{"id":"Observation/ene3Ng8Gs16S7Z9.p363sdvzGVhveZS.c1Lw7Dy9SG5lHhNvTqpMss.WXxbc-icM17jcVwywr.AJ07RInfkKOTw3","display":"Component (1): CULTURE, ORTHO AEROBIC","name":"Culture, Ortho Aerobic","value":"No growth at 5 days.","result":null,"time":"12/10/2021 14:01","status":"Final","specimen_fhir_id":"ea7wJGRtPc2pyL2LiKNUIIbGfM1oetCGvcBJdLRQhgPQ3","specimen_id":"1","specimen_source":"Joint, Hip, Right"}]},{"specimen_id":"21S-339MI0097","collection_dt":1638728940000,"results":[{"id":"Observation/eDJeOlfcfvVsLrpOrD3EUp.3etyg9BH4LpmddvxAR8XlP05QrLeYSHKPPoTl80jF8.NucKOeDf7QfbsbM3vsG-A3","display":"Component (1): CULTURE, ORTHO ANAEROBIC","name":"Culture, Ortho Anaerobic","value":"No growth at 14 days.","result":null,"time":"12/19/2021 15:01","status":"Final","specimen_fhir_id":"estfYmY3JkJ-Ncx7Ta0m3h4mvhXXeM8wyMGIDpYpvFVc3","specimen_id":"2","specimen_source":"Joint, Hip, Right"},{"id":"Observation/el5sMKVhCLy83EjK4HSA52DP.d79fJOsul9n6eQqoQGKy7SdMIHs5e9514ibR8xle7rS9e.n993venV9tvcAuYA3","display":"Component (1): CULTURE, ORTHO AERO WITH STAIN","name":"Culture, Ortho Aero With Stain","value":"No growth at 5 days.","result":null,"time":"12/10/2021 14:01","status":"Final","specimen_fhir_id":"estfYmY3JkJ-Ncx7Ta0m3h4mvhXXeM8wyMGIDpYpvFVc3","specimen_id":"2","specimen_source":"Joint, Hip, Right"},{"id":"Observation/el5sMKVhCLy83EjK4HSA52DP.d79fJOsul9n6eQqoQGJz5KYYOfHm93AZPzXcehF5YpL8Ygtx7mD9yOPz5wkJ1g3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Moderate number Polymorphonuclear cells","result":null,"time":"12/10/2021 14:01","status":"Final","specimen_fhir_id":"estfYmY3JkJ-Ncx7Ta0m3h4mvhXXeM8wyMGIDpYpvFVc3","specimen_id":"2","specimen_source":"Joint, Hip, Right"},{"id":"Observation/el5sMKVhCLy83EjK4HSA52JuGgpF.xB7i7083dsEyRH5cOn29tFI8o7KwwlFrkIAl2GyUjlnl0j2BQiYMtC5IyA3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"No organisms seen.","result":null,"time":"12/10/2021 14:01","status":"Final","specimen_fhir_id":"estfYmY3JkJ-Ncx7Ta0m3h4mvhXXeM8wyMGIDpYpvFVc3","specimen_id":"2","specimen_source":"Joint, Hip, Right"}]},{"specimen_id":"21S-339MI0190","collection_dt":1638748680000,"results":[{"id":"Observation/eRsMtebPyRZ4.Sfge8i9HFH4VVFmyn1Y1xEalKyc5.CFQh-zOXvmzRwTknDurrOFKm3m2VdbEug2QXTgD6-YtZw3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/17/2022 14:40","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eRsMtebPyRZ4.Sfge8i9HFH4VVFmyn1Y1xEalKyc5.CFu7jwgQB4CY9XPewzOrhQKEhutHSemv1ExAN77Ra7.lA3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/17/2022 14:40","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eLvXHpTXQEEuyjVzl1qJYMatZbuJZPiNWC87M4HeSIBxf2JntG700Vl-7CQyHnD3rIaOGCeqsBn7gwy4ZJ3wU4A3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/10/2021 15:48","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/e6TuT47EguJsKO3xnc5m03TmpYEKtoxA6lg7YRawZO.31QkZPuI1pi.5IFoMAzyRa8SE7DysoITdykSIGtJv5LA3","display":"Component (1): CULTURE, FUNGAL","name":"Culture, Fungal","value":"No growth 21 days","result":null,"time":"12/26/2021 21:01","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eZZyScolac2OHRC56t2XOS2eYdYxTYhSW4BnpWz-1Jdl0pWMHuH2ssPDTLZUIczZss5db.kcsSaQf4H8oGJ-tMQ3","display":"Component (1): CULTURE, FLUID WITH STAIN","name":"Culture, Fluid With Stain","value":"1+ Staphylococcus aureus","result":"Abnormal","time":"12/10/2021 09:55","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eZZyScolac2OHRC56t2XOS2eYdYxTYhSW4BnpWz-1JdkD1Vezog9PsjPXS.MPqBa1baQ2irdWQIeUEw.rcFqhgQ3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Small number Polymorphonuclear cells","result":null,"time":"12/10/2021 09:55","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eZZyScolac2OHRC56t2XOS5ULOFWCMstPIUmWVhvGhvBJsDSw0h-jcmtbQWlM-R0ZoA4cT.d1W23Rp8.zfWDTXQ3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"Rare number Mononuclear cells seen","result":null,"time":"12/10/2021 09:55","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eZZyScolac2OHRC56t2XOS6us8npLUSFFKrj8tNs0UQk3uAKUUiCQEfKly7qEt0OMXKCPQWbOklxkfZQ38m8Dgg3","display":"Component (3): GRAM STAIN","name":"Gram Stain","value":"No organisms seen.","result":null,"time":"12/10/2021 09:55","status":"Final","specimen_fhir_id":"eZvimJcvV0rtbkx7jIJBY-38Pbo.OqQsruDz09gEQdY43","specimen_id":"7","specimen_source":"Sterile Body Fluid (Other)"}]},{"specimen_id":"21S-339MI0168","collection_dt":1638748800000,"results":[{"id":"Observation/eCI5RZXfFygbB6.cSrD76sWM0Se7o3qY.ZN2FAbbn7TzQnv6lqxYSiNgD5j3quh.FKD6aUUM9inOUB9vWvLvHvg3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/18/2022 08:23","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"},{"id":"Observation/eCI5RZXfFygbB6.cSrD76sWM0Se7o3qY.ZN2FAbbn7TziB5t-Bv.y0Dq7HZC27.1OkoEVJf0vYg7csb8fVRdA9w3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/18/2022 08:23","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"},{"id":"Observation/ey0hyRT0vmhrr3uPgPtUcJF82LBxYMCf04NzvnnjeHAgM-4JJO6U1KU9xYqgd3khXUOFbJG3aA.rK7SA.4MidVw3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/10/2021 15:48","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"},{"id":"Observation/e1vNzB0DFMnwnjL-Qe98KPFiqxO7vhlB2ssPltKA-0lD5JDNqnaTWSwMmCWTJZ1F3Xf1rDukZBGQbBFR8HKnhfw3","display":"Component (1): CULTURE, FUNGAL","name":"Culture, Fungal","value":"No growth 21 days","result":null,"time":"12/26/2021 20:01","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"},{"id":"Observation/exZObjb-rHSSIGHw0XZwoJ1r5yCnIR4dGdfcgsD7-ZsUnDbtSjuv1Abrbk8wyuMNpeDLB1ME13pB5tbjOk8IrtA3","display":"Component (1): CULTURE, TISSUE WITH STAIN","name":"Culture, Tissue With Stain","value":"2+ Staphylococcus aureus","result":"Abnormal","time":"12/08/2021 13:47","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"},{"id":"Observation/exZObjb-rHSSIGHw0XZwoJ1r5yCnIR4dGdfcgsD7-ZsV2FcSvmjNYKNuXRIvQuDmx6J6MoPPmBBrezzeF64NDOw3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Rare number Mononuclear cells seen","result":"Abnormal","time":"12/08/2021 13:47","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"},{"id":"Observation/exZObjb-rHSSIGHw0XZwoJ.dmFX4gEqNUbRiWiUcrLsr3W44auNRgCSaCSrUTEItvksCMKCeD-aJRT1DJ.1eUeQ3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"Rare number Gram Positive Cocci in pairs","result":"Abnormal","time":"12/08/2021 13:47","status":"Final","specimen_fhir_id":"erf11jskeFeoaujEGBqrEn-ltUhibMBOvgMaR2Go-m343","specimen_id":"8","specimen_source":"8, Retropharyngeal abscess #2"}]},{"specimen_id":"21S-339MI0189","collection_dt":1638748800000,"results":[{"id":"Observation/ebeZemBTYMO0wR3lcPFZ9bc6Ynb0KnYwkoscaCRt9aAtuk1EzyQxNBuJSS57pDH7aZEhyDPvk69MDfrgyE0hr4w3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/17/2022 14:40","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/ebeZemBTYMO0wR3lcPFZ9bc6Ynb0KnYwkoscaCRt9aAusTeO3w62tBWMID736bNo8jsAnZEz3x3PpNIjHVDFpJw3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/17/2022 14:40","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eIHckX-ZHx3ARLfXRzXxumZTfejNSNhhWtNCLJwVAme2AXd94SMArZxGrAfHa568bDN7K.GcTVZO5WFWi5OTOnA3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/10/2021 15:48","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eW9lno2Ic5hTKOwUZPa6hWVBCx6iDyvG089mkkQoxHpsZU6lRQK9.oNsFufQUhKFdVeJMhQV2U1knxbK0cVfk9g3","display":"Component (1): CULTURE, FUNGAL","name":"Culture, Fungal","value":"No growth 21 days","result":null,"time":"12/26/2021 21:01","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eCqpVa5XiZsjCg53xrfM.RSMlRcVTwWjrXzywrvAjwd6n4onFhs81AkUn7OafY7pSDdrmJ8T8dG--Yq40-CqjwQ3","display":"Component (1): CULTURE, FLUID WITH STAIN","name":"Culture, Fluid With Stain","value":"Rare number Staphylococcus aureus","result":"Abnormal","time":"12/10/2021 09:50","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eCqpVa5XiZsjCg53xrfM.RSMlRcVTwWjrXzywrvAjwd72u.yF9hJNbxtaI5qaIp5XGeot2fI9NAqY-aDvYt89Jw3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Rare to small number Polymorphonuclear cells","result":null,"time":"12/10/2021 09:50","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"},{"id":"Observation/eCqpVa5XiZsjCg53xrfM.RXBrx7hJ1qNEsIly-c7SyP1yDmtaYbWI3Ts7qNGwkeOeZjtB51B3cB7s7meBnsgaqA3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"No organisms seen.","result":null,"time":"12/10/2021 09:50","status":"Final","specimen_fhir_id":"e26FTXpROKcGWpduRihcXHEsJQcPRvRbXT0iK0Krq0lc3","specimen_id":"9","specimen_source":"Sterile Body Fluid (Other)"}]},{"specimen_id":"21S-339MI0175","collection_dt":1638749460000,"results":[{"id":"Observation/e2qH0raODa0Y3fXz4T-inpQjtsA4TqRyf3EuRoUwRuLdf0st-k.tr6tJ70bM8.0CnKN-Kg5PUJRbchRaAX0Iz6A3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/18/2022 08:22","status":"Final","specimen_fhir_id":"eV2zZ87J51I.CsDm9XpIIHIvZmxslqQPU1wK11uOCGbk3","specimen_id":"10","specimen_source":"Vertebra"},{"id":"Observation/e2qH0raODa0Y3fXz4T-inpQjtsA4TqRyf3EuRoUwRuLe8ZlEU5jeynRTVUMUEP2hIqLfqdpRTxHrMiC1klXLgew3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/18/2022 08:22","status":"Final","specimen_fhir_id":"eV2zZ87J51I.CsDm9XpIIHIvZmxslqQPU1wK11uOCGbk3","specimen_id":"10","specimen_source":"Vertebra"},{"id":"Observation/edN9Lx4oC2461fzABG7-4-5i7nvKCdozD75AsyAUKdWQ4E6SQjXNkO0LbKIS9Wn4r0-oibEz-KyEjR885uwp-Lw3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/10/2021 15:48","status":"Final","specimen_fhir_id":"eV2zZ87J51I.CsDm9XpIIHIvZmxslqQPU1wK11uOCGbk3","specimen_id":"10","specimen_source":"Vertebra"},{"id":"Observation/eJRTSkBPmykJwiUjuu96uNXWGUolVsHtlPtL5kY3zoIL1K6VlEPbPgcSpvjahohk9JE8hUKfAysbgHy8imPlw6Q3","display":"Component (1): CULTURE, TISSUE WITH STAIN","name":"Culture, Tissue With Stain","value":"2+ Staphylococcus aureus","result":"Abnormal","time":"12/08/2021 13:53","status":"Final","specimen_fhir_id":"eV2zZ87J51I.CsDm9XpIIHIvZmxslqQPU1wK11uOCGbk3","specimen_id":"10","specimen_source":"Vertebra"},{"id":"Observation/eJRTSkBPmykJwiUjuu96uNXWGUolVsHtlPtL5kY3zoIKeZI.9o7KK6D2nmXtHNeGPYs5CxnJXKBsDjll8QzuZZA3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"No polymorphonuclear cells and No organisms seen.","result":null,"time":"12/08/2021 13:53","status":"Final","specimen_fhir_id":"eV2zZ87J51I.CsDm9XpIIHIvZmxslqQPU1wK11uOCGbk3","specimen_id":"10","specimen_source":"Vertebra"},{"id":"Observation/eJRTSkBPmykJwiUjuu96uNY4cPghqAvtxOF01VxA8dKJ1bRqLJbBtKvGkPvqAaKp13","display":"Isolate (1): STAPHYLOCOCCUS AUREUS","name":"STAPHYLOCOCCUS AUREUS","result":null,"time":"12/05/2021 16:11","status":"Final","memberId":"Observation/eJRTSkBPmykJwiUjuu96uNWZEJE7j6BEKhy3BEYhBXNxXIhg8rr.OP.1gQ1Yy5vHun6myFQIQgxzpmeK1cGjlvQ3","memberType":"Method: MIC","specimen_fhir_id":"eV2zZ87J51I.CsDm9XpIIHIvZmxslqQPU1wK11uOCGbk3","specimen_id":"10","specimen_source":"Vertebra"}]},{"specimen_id":"21S-339MI0191","collection_dt":1638751860000,"results":[{"id":"Observation/en8v0wSLgl.5ydTxrclOq7lw7QBchdkaIPdBy1h2ZleAJuLbGhDbnn7P7hxzpCqE1Ii.itq3rkA5gV0g-hRVHLA3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/18/2022 08:25","status":"Amended","specimen_fhir_id":"eXpQMjmOufItSven8HmKWtMe1I7So-PjeARwJBLdyGBM3","specimen_id":"12","specimen_source":"Vertebra"},{"id":"Observation/en8v0wSLgl.5ydTxrclOq7lw7QBchdkaIPdBy1h2ZleC7CgM6nrwFX7qbwyXSOhUjHepOvHLTzg6TzxW7A8lSpA3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/18/2022 08:25","status":"Final","specimen_fhir_id":"eXpQMjmOufItSven8HmKWtMe1I7So-PjeARwJBLdyGBM3","specimen_id":"12","specimen_source":"Vertebra"},{"id":"Observation/eWtOxiaATvHvVnY7SOI64EEnTLfX13j7fi1E1Qn64Iv6SWV8IgxWakiqyIVJNROUKsebvbkhk-bGnMVBfF7318A3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/10/2021 15:48","status":"Final","specimen_fhir_id":"eXpQMjmOufItSven8HmKWtMe1I7So-PjeARwJBLdyGBM3","specimen_id":"12","specimen_source":"Vertebra"},{"id":"Observation/eB335ypgHPvjFdKLk5G5z5G.JXcUFifp9ETzZU3DUTk9x0WVKdUaNYAkqMeRgVtvtXQNkkU7d-1I7kMo4zKVWLg3","display":"Component (1): CULTURE, TISSUE WITH STAIN","name":"Culture, Tissue With Stain","value":"2+ Staphylococcus aureus","result":"Abnormal","time":"12/08/2021 13:33","status":"Final","specimen_fhir_id":"eXpQMjmOufItSven8HmKWtMe1I7So-PjeARwJBLdyGBM3","specimen_id":"12","specimen_source":"Vertebra"},{"id":"Observation/eB335ypgHPvjFdKLk5G5z5G.JXcUFifp9ETzZU3DUTk.0UyWl7bpTTHYBajdPw-e6VnefyQsLH1TllYjdrIf9kA3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"No polymorphonuclear cells and No organisms seen.","result":null,"time":"12/08/2021 13:33","status":"Final","specimen_fhir_id":"eXpQMjmOufItSven8HmKWtMe1I7So-PjeARwJBLdyGBM3","specimen_id":"12","specimen_source":"Vertebra"}]},{"specimen_id":"21S-340MI0099","collection_dt":1638811020000,"results":[{"id":"Observation/eDoJKGweGNDCgdF6JQz9a3qs-TwLKLZYUwKhId3Z.zD7Bi.YMQJl9yQHZ-bg0DnImSylkutnDtpzIA3HKLb.Q2g3","display":"Component (1): CULTURE, BLOOD (AER/ANA)","name":"Culture, Blood (Aer/Ana)","value":"No growth at 5 days.","result":null,"time":"12/11/2021 11:01","status":"Final","specimen_fhir_id":"ergE1MvGMiW054.9tpvzwmsI8bS9lXvlD40t4N9Tr7-Y3","specimen_id":"21S-340MI0099","specimen_source":"Peripheral, left antecubital"}]},{"specimen_id":"21S-340MI0100","collection_dt":1638812220000,"results":[{"id":"Observation/eT0h.K68lWJucC5rmKeZg20pFjJVSLJtL81wKzlm-AL7yaS2LpaZiLezb4EhJxkAcuS.8GMmPss5Dp70nNbQ38A3","display":"Component (1): CULTURE, BLOOD (AER/AER)","name":"Culture, Blood (Aer/Aer)","value":"No growth at 5 days.","result":null,"time":"12/11/2021 11:01","status":"Final","specimen_fhir_id":"e8l9SDArzPP4Hj2bigw25ltuXQ8LVvZaO4eXxwJBsRck3","specimen_id":"21S-340MI0100","specimen_source":"Peripheral, left antecubital"}]},{"specimen_id":"21S-340MI0520","collection_dt":1638850620000,"results":[{"id":"Observation/eL8Zz8t3XQTQm60q943CrZXo1jAhcpfzMM1bL5F.FZxokSP0VYJSd.X4xxCqU6D.bTwkzn56F5ntM8rQVbnEX5g3","display":"Component (1): CULTURE, ORTHO AERO WITH STAIN","name":"Culture, Ortho Aero With Stain","value":"No growth at 5 days.","result":null,"time":"12/11/2021 23:01","status":"Final","specimen_fhir_id":"eeIvQ5H9bwIpbdzU2DYs93GhcbdyY6tP7RtneMF4CyNE3","specimen_id":"21S-340MI0520","specimen_source":"Joint, Wrist, Right"},{"id":"Observation/eL8Zz8t3XQTQm60q943CrZXo1jAhcpfzMM1bL5F.FZxrNIdbZDUTAMIvLI8IgaexktTfNhXJMxxWrBBBI1cAezQ3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"No polymorphonuclear cells and No organisms seen.","result":null,"time":"12/11/2021 23:01","status":"Final","specimen_fhir_id":"eeIvQ5H9bwIpbdzU2DYs93GhcbdyY6tP7RtneMF4CyNE3","specimen_id":"21S-340MI0520","specimen_source":"Joint, Wrist, Right"}]},{"specimen_id":"21S-341MI0521","collection_dt":1638938760000,"results":[{"id":"Observation/eiWYsfICqwPNZfsnnG87wk6B.iW.ktHLyyosdYdgCxbNYqoUPXCTcJZspSMDuuY7kN1LDyyYt-rzNssc6EyN14A3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/19/2022 17:33","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/eiWYsfICqwPNZfsnnG87wk6B.iW.ktHLyyosdYdgCxbMbCL7v2drjyRZ.u5I-HVJEOH2T45fgl-vJwcNQyKflKQ3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/19/2022 17:33","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/eLhrE6Eda5rkIkGzV5k.yI7bCSWZCsXedJNRDF8MA4DOTfwsW5jYhQgWkN7hMk2rlRxK0YoaMQ1TnP4XX.kEsxw3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/13/2021 16:13","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/e2qJ3NjS8m3BqcsJPH9vH0By3hYkWRPd-e4MU9ualgjVf51rAXwqBBR1iquTP479I1mbm8GkGJMEsEf91bbwTWg3","display":"Component (1): CULTURE, FUNGAL","name":"Culture, Fungal","value":"No growth 21 days","result":null,"time":"12/28/2021 13:30","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/ecJdIKrz40N2EbhNC4FWNjymboBgORmwh9b5mKtqeT22C.R9fqi8bv1TRV-T2lVViAcWtPZMRaKhabkix3xvWDA3","display":"Component (1): CULTURE, TISSUE WITH STAIN","name":"Culture, Tissue With Stain","value":"Rare number Staphylococcus aureus","result":"Abnormal","time":"12/12/2021 12:56","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/ecJdIKrz40N2EbhNC4FWNjymboBgORmwh9b5mKtqeT20CFYCQzSNY64vkU8qAZXhj8zT6SfYYrdnOibFD7gFgFg3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Rare number Polymorphonuclear cells","result":null,"time":"12/12/2021 12:56","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/ecJdIKrz40N2EbhNC4FWNj5nx42VfIEuNINDbb5iKxcYPJMnZOyWiEF2k4jODE48F2kn044z4fvnkR7H61aBltQ3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"Small number Mononuclear cells seen","result":null,"time":"12/12/2021 12:56","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"},{"id":"Observation/ecJdIKrz40N2EbhNC4FWNj.JmXsBqvTpfnUpdq1RtVe5AEQRhJKxTXJPERkaBjgwLdSVGxBjdFSYFgUnI7rfVzQ3","display":"Component (3): GRAM STAIN","name":"Gram Stain","value":"No organisms seen.","result":null,"time":"12/12/2021 12:56","status":"Final","specimen_fhir_id":"eY-otY86A6yOVqRZES0.u6l-2gKT8i0HZ2W7g8H3K.bU3","specimen_id":"1","specimen_source":"Hand, Right"}]},{"specimen_id":"21S-341MI0522","collection_dt":1638938760000,"results":[{"id":"Observation/ejdi7FOso-xPRUPu44VsKx1I2us.naEjT8nNteXmwXSMet4SxWJjQflBKKmcl2YI.GOk5fZRsvP7ur65zNRXX5g3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/19/2022 17:33","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/ejdi7FOso-xPRUPu44VsKx1I2us.naEjT8nNteXmwXSMMsTJvgWxMGXxqr79uiCGk1H6LtLFiCMd32iyvk.KezQ3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/19/2022 17:33","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/elS4Sz5HQ.cC58tNz1xlJjAdXm.0X98PXNRgUAFenpKeSX4VuyMJqVxdNh8MkY6RtR9M4ibqtkIHCCWSKAkDJOw3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/13/2021 16:14","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/ebEZQnroO8zCnqwN2XNgIynNYlzvu3nu-D5hItvA85BYMHXHXsL4O9TVih-CCpnetGiMHG42RCjUGNxVjcw235Q3","display":"Component (1): CULTURE, FUNGAL","name":"Culture, Fungal","value":"No growth 21 days","result":null,"time":"12/28/2021 13:30","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/eoNERYnSbsQ-M23mUxu80gmczaZEyrM8rMTBtnasLKET48Dj.mhHB5HBEat1zUH7XKh1IXMmfspcs9BmKoO0ARg3","display":"Component (1): CULTURE, TISSUE WITH STAIN","name":"Culture, Tissue With Stain","value":"Rare number Staphylococcus aureus","result":"Abnormal","time":"12/13/2021 13:10","status":"Amended","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/eoNERYnSbsQ-M23mUxu80gmczaZEyrM8rMTBtnasLKETvz1ptMTYN8UV5CfZ6cPA9zx3wuE9z7FTgtX7.XDGRjg3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Rare to small number Polymorphonuclear cells","result":null,"time":"12/13/2021 13:10","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/eoNERYnSbsQ-M23mUxu80gvuvVJd30pS58sTqjCUCj-aI78Ue6mZL3v4jrZqkmy.tR8qxNdBFTmyriBSntf0mQg3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"Small number Mononuclear cells seen","result":null,"time":"12/13/2021 13:10","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"},{"id":"Observation/eoNERYnSbsQ-M23mUxu80go6gxdvZjhbDu4qSM2YfmOOgrg.OJ0CE7qY2yEUIfKzrG6BGISQvNDvg2WIen94mjA3","display":"Component (3): GRAM STAIN","name":"Gram Stain","value":"No organisms seen.","result":null,"time":"12/13/2021 13:10","status":"Final","specimen_fhir_id":"egVYwk8sTcPAon-TQreTUd1kKaKVkWdkkcKpQYWo6JQo3","specimen_id":"2","specimen_source":"Hand, Right"}]},{"specimen_id":"21S-341MI0523","collection_dt":1638938820000,"results":[{"id":"Observation/erm0MCA4VFRcwHPYKivYNetx5Pfwawdk71IGVKFvWZQEH5DDzLBkKE6c9-JV7BOs-ebBGkSMCRvESLkeWOpmOpQ3","display":"Component (1): CULTURE, AFB","name":"Culture, AFB","value":"No growth at 42 days (of AFB)","result":null,"time":"01/19/2022 17:33","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/erm0MCA4VFRcwHPYKivYNetx5Pfwawdk71IGVKFvWZQHQzcnxRKNunSsH85KGY3mtlKE4gV-anjCNRs6La5ZJWw3","display":"Component (1): AFB SMEAR","name":"AFB Smear","value":"Fluorescent smear negative for AFB.","result":null,"time":"01/19/2022 17:33","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/e.2Y3L9fun.E16RTFugwDw-q2tYtuvbPPDqjDZrXjYZZ..SR9KQePLnF3ZoaOOUcgFVr8conp5AohUTMlfCKpVg3","display":"Component (1): CULTURE, ANAEROBIC","name":"Culture, Anaerobic","value":"No anaerobes isolated","result":null,"time":"12/13/2021 16:14","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/epQ7zXylU-oZ.uydR8.eaICQwE7uBywzp6o4MzYgJE3CfGElp15mw4yIb0fn4moolKXuqwFNzoeFHVWUnUiMqmQ3","display":"Component (1): CULTURE, FUNGAL","name":"Culture, Fungal","value":"No growth 21 days","result":null,"time":"12/28/2021 13:29","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/ewf.H22oBk6EcH2zZKgugo2aKDGtMfgpKdv79t9jrclUPsS7Gbfrhol.cIceCbfEG3CLrftgPgJ1t0WAAhI0UaQ3","display":"Component (1): CULTURE, FLUID WITH STAIN","name":"Culture, Fluid With Stain","value":"Rare number Staphylococcus aureus","result":"Abnormal","time":"12/12/2021 12:54","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/ewf.H22oBk6EcH2zZKgugo2aKDGtMfgpKdv79t9jrclVkN9hGnOGU-stmrZwgNzTASZQgo1RsI-2YilPHY9AjMg3","display":"Component (1): GRAM STAIN","name":"Gram Stain","value":"Rare number Polymorphonuclear cells","result":null,"time":"12/12/2021 12:54","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/ewf.H22oBk6EcH2zZKgugo7lNbYVQTuJ2eialvSp9KnWXnvIipWbrVuLAhvpMBrMmzV0cyVf6Uwp6.TbLu2W-lw3","display":"Component (2): GRAM STAIN","name":"Gram Stain","value":"No organisms seen.","result":null,"time":"12/12/2021 12:54","status":"Final","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"},{"id":"Observation/ewf.H22oBk6EcH2zZKgugoxUt26K3cVjaA5nuGBNe.B0E3aOXkUCqQ7txx6gywWjM3","display":"Isolate (1): STAPHYLOCOCCUS AUREUS","name":"STAPHYLOCOCCUS AUREUS","result":null,"time":"12/07/2021 20:47","status":"Final","memberId":"Observation/ewf.H22oBk6EcH2zZKgugozqlnn91a.3MhciHaus05UEW9lb3MyV.0tmn9BBMUBdW6WzorKx0U2KbyUl.LSfMZw3","memberType":"Method: MIC","specimen_fhir_id":"exBbSLQPfdHGvwuSTyQk.kKzPzCxTsq.uaotWoHaVNcc3","specimen_id":"3","specimen_source":"Hand, Right"}]},{"specimen_id":"21S-342MI0506","collection_dt":1639012800000,"results":[{"id":"Observation/e3OdjeJx6NimqWk7VKWjke4JU03SoRYK305RKCi6jXK6bSuKxU9myNJrvLnEo9JY9H1VVQ.t8HB6q9Uqhm0uoXA3","display":"Component (1): CULTURE, BLOOD (AER/ANA)","name":"Culture, Blood (Aer/Ana)","value":"No growth at 5 days.","result":null,"time":"12/13/2021 20:01","status":"Final","specimen_fhir_id":"eHN5W8Uo1FhfmRljQ9NitN5RVKnoeiOjXCRg5IAzHfYo3","specimen_id":"21S-342MI0506","specimen_source":"Peripheral, left antecubital"}]},{"specimen_id":"21S-342MI0507","collection_dt":1639012800000,"results":[{"id":"Observation/eWc9fEQ0GRxOiF0K2HdTICK9vObpAWhVUm5B4Cef5pG461oqSNoSJ6kKaXM-x4EA1zqRhu1gCDHVtg7kmtp3pzg3","display":"Component (1): CULTURE, BLOOD (AER/AER)","name":"Culture, Blood (Aer/Aer)","value":"No growth at 5 days.","result":null,"time":"12/13/2021 20:01","status":"Final","specimen_fhir_id":"ePuM6B66w3VFb51BmFJxaeV7aw0i99Rj7iat-l-YkVBE3","specimen_id":"21S-342MI0507","specimen_source":"Hand, Left"}]}] ;

            this.log(JSON.stringify(cresponse)) ;  

            cresponse.forEach( spec => {
                spec.results.forEach(res => {
                    var cresult = {
                        id: res.id,
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
                        susceptibility: ((res.memberId && res.memberId.length > 0)?"Yes":"") ,
                        susceptability_data: [],
                        memberId: (res.memberId ? res.memberId.substr(res.memberId.indexOf("/") + 1) : "")
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

            response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", '', this.$services.antimicrobial.APP_ID ) ;            
            responses.push(response) ;

            while (response.nextUrl) {
                response = await this.$services.seal.medicationData(this.launchModal.rpt_start_date, this.launchModal.rpt_end_date, "ALL", response.nextUrl, this.$services.antimicrobial.APP_ID) ;
                responses.push(response) ;
            }

            console.log("med orders done") ;
            console.log(responses) ;
            this.log("Got med order responses") ;
            
            var medNames = [] ;
            var meds = [] ;  
            responses.forEach((response) => {                
                response.cats.forEach((med) => {
                    try {
                        // Only antibiotics
                        if (med.thera_class && med.thera_class.toLowerCase() == 'antibiotics') {
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
                        }
                    } catch (err) {
                        _self.log("Error in merging medstat response for " + JSON.stringify(med)) ;
                        _self.log(err)   ;
                    }
                });              
            }) ;

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
    
            _self.notes = "Antimicrobial History:\n"
                        + "----------------------\n\n" ;

            ingredients.forEach(ing => {
                var dates = "" ;
                var enddt ;
                console.log("Processign ing :" + ing.name) ;

                ing.data.sort(function(a, b) { return a.x - b.x }) ;
                
                for (var i=0; i<ing.data.length; i++) {
                    var dt = ing.data[i] ;

                    dt.x = _self.$moment(dt.x).startOf("day") ;
                    dt.x2 = _self.$moment(dt.x2).startOf("day") ;
                    console.log("     start :" + dt.x.format("MM/DD/YYYY") + " end :" + dt.x2.format("MM/DD/YYYY")) ;
                    if (dates == "") {
                        dates += dt.x.format("MM/DD/YY") ;                        
                        enddt = dt.x2 ;
                        if (enddt.isAfter(_self.$moment())) {
                            dates += "-Present";
                            enddt = null ;
                            break ;                            
                        }
                    } else {
                        if (dt.x.diff(enddt, 'days') > 1) {
                            if (enddt.isAfter(_self.$moment())) {
                                dates += "-Present";
                                enddt = null ;
                                break ;
                            }
                            dates += "-" + enddt.format("MM/DD/YY") + ", ";
                            dates += dt.x.format("MM/DD/YY") ;
                            enddt = dt.x2 ;
                        } else {
                            enddt = (dt.x2.valueOf() > enddt.valueOf() ? dt.x2 : enddt) ;
                        }
                    }
                }
                if (enddt)
                    dates += "-" + enddt.format("MM/DD/YY") + " ";

                ing.dates = dates ;
                _self.notes += ing.name + " " + ing.dates + "\n";
            }) ;

            console.log("Antibiotics Orders") ;
            console.log(ingredients) ;

            this.launchModal.loading = false ;
            this.$bvModal.hide("launch-modal") ;
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


