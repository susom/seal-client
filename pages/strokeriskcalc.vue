<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="chads2vasc_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk is a risk prediction calculator app developed by SEAL.
                <p>
                <p>
                    This app uses data from the patient medical record at Stanford Health Care to calculate the
                    estimated annual risk of stroke and thromboembolism for patients with non-valvular atrial fibrillation.
                    <br/>Suggested relevant items in the medical history that map to a CHA₂DS₂-VASc risk category are highlighted in blue.
                </p>
            </b-col>
        </b-row>
        <b-row class="smallfont">
            <b-col sm="11" md="11" lg="6">
                <b-card
                    class="shadow-lg rounded-lg ml-3 mt-2"                    
                    title="CHA₂DS₂-VASc Score Calculator"                    
                >                    
                    <b-card-text>
                        <calc-row :rows="rows" v-model="totalPoints" ref="calcRows"/>

                        <div v-if="totalPoints == -1">
                            <h2>RESULT:</h2>
                            Please select an option for each category. The calculator will automatically calculate the risk score once you have selected an option for every category.
                        </div>
                        <div v-if="totalPoints > -1">
                            <h2>RESULT:</h2>
                            <calc-result-display :rows="resultRows" />
                            <p style="padding-top:10px;">
                                The decision to anticoagulate should be made based on the individual clinical assessment of risk of stroke and thromboembolism versus risk of bleed.
                                A score of 0 (zero) is low risk and may not require anticoagulation. A score of 1 is "low-moderate" risk and an antiplatelet or anticoagulant should be considered.
                                A score of 2 or greater is "high" risk of stroke or thromboembolism and anticoagulation should be strongly considered.<sup>2</sup>
                            </p>
                            <p>
                                References:
                                <ol>
                                    <li>
                                        Leif Friberg, Mårten Rosenqvist, Gregory Y.H. Lip, Evaluation of risk stratification schemes for ischaemic stroke and bleeding in 182 678 patients with atrial fibrillation: the Swedish Atrial Fibrillation cohort study, European Heart Journal, Volume 33, Issue 12, June 2012, Pages 1500–1510
                                    </li>
                                    <li>
                                        January CT, Wann LS, Alpert JS, Calkins H, Cigarroa JE, Cleveland JC Jr, Conti JB, Ellinor PT, Ezekowitz MD, Field ME, Murray KT, Sacco RL, Stevenson WG, Tchou PJ, Tracy CM, Yancy CW; American College of Cardiology/American Heart Association Task Force on Practice Guidelines. 2014 AHA/ACC/HRS guideline for the management of patients with atrial fibrillation: a report of the American College of Cardiology/American Heart Association Task Force on Practice Guidelines and the Heart Rhythm Society. J Am Coll Cardiol. 2014 Dec 2;64(21):e1-76. doi: 10.1016/j.jacc.2014.03.022. Epub 2014
                                    </li>
                                </ol>
                            </p>
                        </div>
                        <div id="copyBtnDiv"  v-if="totalPoints > -1" class="mt-2 mb-3">
                            <copy-to-clipboard-btn label="Copy Result" :content="result"/>
                        </div>
                    </b-card-text>
                </b-card>
            </b-col>
            <b-col sm="11" md="11" lg="5">                
                <b-card
                    class="shadow-lg rounded-lg ml-3 mt-2"
                    title="Past Medical History" 
                    id="mytab"                                        
                >                    
                    <b-form-row>
                        <b-col cols="12" class="pr-4">
                            <b-form-input
                                id="filter-input"
                                v-model="search"
                                type="search"    
                                placeholder="Search Condition"
                                size="sm"
                                class="rounded-lg mb-2 ml-2"
                            ></b-form-input>
                        </b-col>
                    </b-form-row>                        
                    
                    <b-tabs card content-class="ml-2 mr-2 mb-3" fill nav-wrapper-class="bg-white" active-nav-item-class="bg-primary" >
                        <b-tab no-body title="Epic Data">
                            <b-card-text>
                                <b-table outlined hover
                                    :items="medHistList" 
                                    :fields="medHistHeaders" 
                                    :filter="search"
                                    class="mt-3 border-primary"
                                    sort-icon-left                        
                                    small show-empty :busy="loadingConditions">
                                    <template #table-busy>
                                        <div class="text-center text-info my-2">
                                        <b-spinner class="align-middle"></b-spinner>
                                        <strong>Loading...</strong>
                                        </div>
                                    </template>                            
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">No History available</h5>
                                    </template>
                                    <template #cell(condition)="data">                                
                                        <span :class="data.item.risk_category?'used_in_calc':''">{{data.item.condition}}</span>
                                    </template>
                                    <template #cell(asserted_date_long)="data">
                                        {{data.item.asserted_date_str}}
                                    </template>
                                    <template #cell(risk_category)="data">
                                        {{data.item.risk_category}}
                                        <div style="color:red;font-size:10px;width:120%" v-if="data.item.seal_condition_id > -1">
                                            Last Updated by {{data.item.updated_by_name}} on {{data.item.updated_dttm_str}}
                                        </div>                                 
                                    </template>                                    
                                    <template #cell(status_desc)="data">
                                        <div class="text-center" style="width:100%" v-if="data.item.risk_category">
                                            <b-form-checkbox @change="epicConditionChanged(data.item)" v-model="data.item.status_code" 
                                                name="check-button" switch value="A" unchecked-value="I" button-variant="bg-secondary">
                                            </b-form-checkbox>
                                        </div>                                 
                                    </template>
                                </b-table>
                                <div class="pt-2">
                                    Items highlighted above in <span style="color:blue">blue</span> are suggested CHA₂DS₂-VASc risk score diagnoses 
                                    with corresponding categories. These should be reviewed and verified by the clinical team.
                                </div>
                            </b-card-text>
                        </b-tab>
                        <b-tab no-body title="User Added Data in SEAL">
                            <b-card-text>
                                <b-table outlined hover
                                    :items="patient.seal_conditions.user_conditions" 
                                    :fields="userCondHeaders" 
                                    :filter="search"
                                    class="mt-3 border-primary"    
                                    sort-icon-left                        
                                    small show-empty :busy="loadingConditions">
                                    <template #table-busy>
                                        <div class="text-center text-info my-2">
                                        <b-spinner class="align-middle"></b-spinner>
                                        <strong>Loading...</strong>
                                        </div>
                                    </template>                            
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">No user added data available.</h5>
                                    </template>
                                    <template #head(seal_condition_id)="data">                                
                                        <b-icon icon="plus" class="rounded-circle bg-secondary ml-1" 
                                            font-scale="1.5" @click="addSealCondition()">{{data.label}}</b-icon>
                                    </template>                                    
                                    <template #cell(seal_condition_id)="data">                                
                                        <b-button @click="editSealCondition(data.item)" size="sm" variant="light">
                                            <b-icon icon="pencil"></b-icon>
                                        </b-button>                                
                                    </template>
                                    <template #cell(conditions)="data">
                                        <span :class="data.item.risk_category?'used_in_calc':''" v-html="(data.item.conditions.replace(/(\r\n|\n|\r)/gm,'<br>'))"></span>
                                    </template>                            
                                    <template #cell(status_desc)="data">          
                                        <div class="text-center" style="width:100%" v-if="data.item.risk_category">
                                            <b-form-checkbox @change="epicConditionChanged(data.item)" v-model="data.item.status_code" 
                                                name="check-button" switch value="A" unchecked-value="I" button-variant="bg-secondary">
                                            </b-form-checkbox>
                                        </div>                                                                                                                                               
                                        <!--{{(data.item.status_code=="A"?"Active":"Inactive")}}-->
                                    </template>
                                </b-table>

                                <div class="pt-2">
                                    Items highlighted above in <span style="color:blue">blue</span> are suggested CHA₂DS₂-VASc risk score diagnoses 
                                    with corresponding categories. These should be reviewed, verified, and added to the Epic problem list by the clinical team.
                                </div>
                            </b-card-text>    
                        </b-tab>
                    </b-tabs>
                </b-card>

                <b-modal id="condition-modal" button-size="sm" hide-footer title="User Added Data in SEAL">
                    <b-form>
                        <b-form-group id="riskCategory">
                            <b-form-select
                                id="riskCategory"                                                                
                                v-model="editCondition.risk_category"
                                :options="riskCategoryList"                                
                                size="sm"
                                :state="errors.risk_category"
                                aria-describedby="input-live-feedback"
                                autofocus
                            ></b-form-select>
                            <b-form-invalid-feedback :state="errors.risk_category" id="input-live-feedback">Risk Category is required.</b-form-invalid-feedback>
                        </b-form-group>
                        <b-form-datepicker
                            id="conditionDate"
                            v-model="editCondition.condition_date"
                            value-as-date
                            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                            locale="en"
                            size="sm"
                            class="mt-3 mb-3"
                        ></b-form-datepicker>                                          
                        <b-form-group id="conditions">
                            <b-form-textarea
                                id="conditions"
                                v-model="editCondition.conditions"
                                rows="3"
                                placeholder="Conditions"
                                :state="errors.conditions"
                                required
                                size="sm"
                            ></b-form-textarea>
                            <b-form-invalid-feedback :state="errors.conditions">Conditions is required.</b-form-invalid-feedback>
                        </b-form-group>
                        <b-form-group id="conditionStatus">
                            <b-form-radio-group
                                v-model="editCondition.status_code"
                                :options="[{value: 'A', text: 'Active'}, {value:'I', text: 'Inactive'}]"
                                size="sm"
                            ></b-form-radio-group>
                        </b-form-group>
                        <b-row>
                            <b-col cols="12" class="small"  v-if="(editCondition.orig_data.created_by_name && editCondition.orig_data.created_by_name != '')">
                                Created By {{editCondition.orig_data.created_by_name}} at {{editCondition.orig_data.created_dttm_str}}
                            </b-col> 
                        </b-row>
                        <b-row class="mb-3" v-if="(editCondition.orig_data.updated_by_name && editCondition.orig_data.updated_by_name != '')">
                            <b-col cols="12" class="small">
                                Updated By {{editCondition.orig_data.updated_by_name}} at {{editCondition.orig_data.updated_dttm_str}}
                            </b-col> 
                        </b-row>
                        <b-row>
                            <b-col cols="12" class="text-info font-weight-lighter">
                                Reminder: Data entered here is NOT saved in Epic. Please update the patient’s Problem List in Epic for permanent medical record documentation.
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col cols="12" class="text-right">
                                <b-button variant="primary" rounded size="sm" @click="$bvModal.hide('condition-modal')">Close</b-button>
                                <b-button variant="primary"  rounded size="sm" @click="saveSealCondition()">Save</b-button>                                
                                <b-button variant="primary" rounded size="sm" @click="deleteSealCondition()" 
                                    v-if="(editCondition.orig_data.seal_condition_id > -1)">Delete</b-button>
                            </b-col>
                        </b-row>
                    </b-form>
                </b-modal>                    
            </b-col>
        </b-row>        
        <b-modal id="chads2vasc-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
            body-bg-variant="dark">
            <ul class="text-white">
                <li>NOTE: The data will be saved into this score calculator only. The data will NOT be saved into the patient EHR.</li>                                                    
                <li>Items highlighted in blue in selected items to include in score calculator.</li>
                <li>Pre-selected selected items are suggestions based on data in the patient’s medical history.</li>
                <li>You may use the “Search” bar to search for relevant patient medical history. </li>
                <li>If other relevant patient medical history is not recorded here, please utilize  the SEAL history and consider adding it to the Problem List in Epic.</li>
                <li>You may also use the “plus icon” button to add new items to the app’s Medical History for the purposes of the risk score calculator. </li>                
                <li> 
                    How the Calculator and Past Medical History reads and writes data in the app:
                    <ol class="text-white">
                        <li>The calculator data is automatically synced with any info and changes made in “Past Medical History”. </li>
                        <li>You may modify the conditions “Past Medical History” by toggling the status of Active/Inactive.</li>
                        <li>You may add additional conditions in the tab “User Added Data in SEAL”.</li>
                        <li>You may override automatically synced data in the calculator by simply pressing any button. Changes in the calculator will not affect the Past Medical History.</li>
                        <li>Any new changes made in the “Past Medical History” will automatically update the calculator.</li>
                    </ol>
                </li>
            </ul>
        </b-modal>
    </b-container>
    <!-- eslint-enable -->
</template>

<script>
import CalcRow from '~/components/CalcRow.vue'

/* eslint-disable */

var chfRegEx = new RegExp('^(I50\.)', 'i');
var chfList = ["I50"] ;
var hypRegEx = new RegExp('^(I10\.|I11\.|I12\.|I13\.|I15\.)', 'i');
var hypList = ["I10", "I11", "I12", "I13", "I15"] ;
var diabRegEx = new RegExp('^(E10\.|E11\.|E13\.)', 'i');
var diabList = ["E10", "E11", "E13"] ;
var strokeRegEx = new RegExp('^(I60\.|I61\.|I62\.|I63\.|I65\.|I66\.)', 'i');
var strokeList = ['I60', 'I61', 'I62', 'I63', 'I65', 'I66', 'I67.841', 'I67.848', 'I67.89', 'G45.0', 'G45.1', 'G45.2', 'G45.8', 'G45.9', 'G46.0', 'G46.1', 'G46.2', 'Z86.73'] ;
var vascRegEx = new RegExp('^(I20\.|I21\.|I22\.|I24\.|I25\.|I70\.|I71\.|I72\.|I73\.|I75\.01|I75\.02)', 'i');
var vascList = ["I20", "I21", "I22", "I24", "I25", "I70", "I71", "I72", "I73", "I74.2", "E10.51", "E10.52", "E11.51", "E11.52", "E13.51", "E13.52"] ;

export default {
  components: { CalcRow },
    data () {
        return {            
            loadingConditions: true,
            errors: {
                risk_category : null,
                conditions: null               
            },
            editCondition: {
                orig_data: {}
            },
            totalPoints: -1,
            riskCategory: "",
            strokeRisk: "",
            tiaRisk: "",
            rows : [
                { text: "Age", value: -1, buttons : [ { text: "< 65", points: 0}, {text: "65-74", points: 1}, { text: ">= 75", points: 2} ] },
                { text: "Sex", value: -1, buttons : [ { text: "Female", points: 1}, {text: "Male", points: 0} ] },
                { text: "CHF History", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
                { text: "Hypertension History", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
                { text: "Stroke/TIA/thromboembolism history", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 2} ] },
                { text: "Vascular disease history (prior MI, peripheral artery disease, or aortic plaque)", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
                { text: "Diabetes History", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] }
            ],
            medHistHeaders: [
                { label: "Condition", key: "condition" , sortable: true },
                { label: "Date Added", key: "asserted_date_long", sortable: true },
                { label: "Risk Category", key: "risk_category", sortable: true },
                { label: "Status", key: "status_desc", sortable: true }
            ],
            medHistList: [],
            search: "",
            userCondHeaders: [
                { label: "#", key: "seal_condition_id", sortable: false },
                { label: "Conditions", key: "conditions" , sortable: true },
                { label: "Author", key: "updated_by_name" , sortable: true },
                { label: "Date Added", key: "condition_date_str", sortable: true },
                { label: "Risk Category", key: "risk_category", sortable: true },
                { label: "Status", key: "status_desc", sortable: true }                
            ],
            userCondSearch: "",            
            patient: {
                seal_conditions: {
                    user_conditions: [],
                    epic_conditions: []
                }
            },
            resultRows: [
                {text: "Total Score", value: ""},
                {text: "Annual Risk of Ischemic Stroke<sup>1</sup>", value: ""},
                {text: "Annual Risk of Stroke or Systemic Thromboembolism<sup>1</sup>", value: ""},
                {text: "Risk Category", value: ""}
            ]            
        }
    },
    async fetch() {
        console.log("In fetch method of the stroke calc page env " + process.env.BASE_URL) ;

        var _self = this ;

        this.$store.commit('setAppId', this.$services.srcalc.APP_ID) ;
        this.$store.commit('setPageTitle', "CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk") ;
        this.$store.commit('setCurrentApp', { help : "chads2vasc-help-modal" }) ;
        this.$services.srcalc.dblog("StrokeCalcHome", "In Stroke Calc Home Page") ;

        this.patient = await this.$services.seal.patient(this.$services.srcalc.APP_ID) ;

        console.log(this.patient) ;
        if (this.patient.gender.toLowerCase() == "male")
            _self.rows[1].value = 0 ;
        if (this.patient.gender.toLowerCase() == "female")
            _self.rows[1].value = 1 ;

        var age = this.getAge(this.patient.birthDate) ;
        if (age > 74) {
            _self.rows[0].value = 2 ;
        } else if (age > 64) {
            _self.rows[0].value = 1 ;
        } else {
            _self.rows[0].value = 0 ;
        }
        

        var conditions = await this.$services.srcalc.conditions() ;
        
        this.medHistList = conditions.map(condition => {
            var medHist = {} ;
            medHist.condition = condition.condition ;
            medHist.asserted_date_str = condition.asserted_date ;
            medHist.asserted_date_long = condition.asserted_date_long ;
            medHist.condition_source = "EPIC" ;

            var found = false ;
            for (var i=0;i<this.patient.seal_conditions.epic_conditions.length;i++) {
                var scond = this.patient.seal_conditions.epic_conditions[i] ;
                if (scond.conditions == condition.condition) {
                    medHist.seal_condition_id = scond.seal_condition_id ;
                    medHist.status_code = scond.status_code ;
                    medHist.notes = scond.notes ;
                    medHist.risk_category = scond.risk_category ;
                    medHist.created_by_name = scond.created_by_name ;
                    medHist.updated_by_name = scond.updated_by_name ;
                    medHist.updated_dttm_str = scond.updated_dttm_str ;
                    medHist.created_dttm_str = scond.created_dttm_str ;                    
                    found = true ;
                    break ;
                }
            }
            if (!found) {
                medHist.seal_condition_id = -1 ;
                medHist.status_code = "A" ;
            }        

            if (medHist.status_code == "A") { 
                if (hypRegEx.test(condition.icd10) || (hypList.indexOf(condition.icd10) > -1)) {
                    medHist.risk_category = "Hypertension History" ;
                    _self.$refs.calcRows.selectButton("Hypertension History", "Yes") ;
                } else if (chfRegEx.test(condition.icd10) || (chfList.indexOf(condition.icd10) > -1)) {
                    medHist.risk_category = "CHF History" ;    
                    _self.$refs.calcRows.selectButton("CHF History", "Yes") ;
                } else if (diabRegEx.test(condition.icd10) || (diabList.indexOf(condition.icd10) > -1)) {
                    medHist.risk_category = "Diabetes History" ;    
                    _self.$refs.calcRows.selectButton("Diabetes History", "Yes") ;
                } else if (strokeRegEx.test(condition.icd10) || (strokeList.indexOf(condition.icd10) > -1)) {
                    medHist.risk_category = "Stroke / TIA / thromboembolism History" ;    
                    _self.$refs.calcRows.selectButton("Stroke/TIA/thromboembolism history", "Yes") ;
                } else if (vascRegEx.test(condition.icd10) || ( vascList.indexOf(condition.icd10) > -1)) {
                    medHist.risk_category = "Vascular disease history (prior MI, peripheral artery disease, or aortic plaque)" ;    
                    _self.$refs.calcRows.selectButton("Vascular disease history (prior MI, peripheral artery disease, or aortic plaque)", "Yes") ;
                }
            }
            return medHist ;
        }) ;
        
        for (var i=0;i<this.patient.seal_conditions.user_conditions.length;i++) {
            if (this.patient.seal_conditions.user_conditions[i].status_code == "A")
                this.$refs.calcRows.selectButton(this.patient.seal_conditions.user_conditions[i].risk_category, "Yes") ;            
        }                        

        this.loadingConditions = false ;

        // Trigger the points calculation 
        this.$refs.calcRows.onChoiceChange() ;

        console.log("Total Points :" + this.totalPoints) ;
    },    
    mounted () {
        console.log("In mounted method of the stroke calc page") ;
    },
    watch : {
        totalPoints : function(newPoints) {
            var score = {
                "0" : { "stroke_risk" : "0.2%","tia_risk" : "0.3%" },
                "1" : { "stroke_risk" : "0.6%","tia_risk" : "0.9%" },
                "2" : { "stroke_risk" : "2.2%","tia_risk" : "2.9%" },
                "3" : { "stroke_risk" : "3.2%","tia_risk" : "4.6%" },
                "4" : { "stroke_risk" : "4.8%","tia_risk" : "6.7%" },
                "5" : { "stroke_risk" : "7.2%","tia_risk" : "10%" },
                "6" : { "stroke_risk" : "9.7%","tia_risk" : "13.6%" },
                "7" : { "stroke_risk" : "11.2%","tia_risk" : "15.7%" },
                "8" : { "stroke_risk" : "10.8%","tia_risk" : "15.2%" },
                "9" : { "stroke_risk" : "12.2%","tia_risk" : "17.4%" }
            } ; 
            
            this.strokeRisk = score[newPoints + ""].stroke_risk ;
            this.tiaRisk = score[newPoints + ""].tia_risk ;

            if (newPoints == 0)
                this.riskCategory = "Low" ;
            else if (newPoints == 1)
                this.riskCategory = "Medium" ;
            else
                this.riskCategory = "High" ;
            
            this.resultRows[0].value = newPoints + " " + (newPoints>1?"points":"point") ;
            this.resultRows[1].value = this.strokeRisk ;
            this.resultRows[2].value = this.tiaRisk ;
            this.resultRows[3].value = this.riskCategory ;
        }
    },
    computed : {
        riskCategoryList () {
            var list = [] ;
            this.rows.forEach( row => {
                if (row.text != "Age" && row.text != "Sex")
                    list.push(row.text) ;                
            }) ;
            return list ;
        },
        result () {
            var result = "CHA2DS2-VASc score for " + this.patient.fullName + " (MRN: " + this.patient.mrn + ") \n\n";
            result += "Date: " + this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") + "\n" ; 
            this.rows.forEach(row => {
                result = result + row.text + ": " + row.value + "\n" ;
            }) ;
            result += 'Result:' + '\n' ;
            result += "Total Score: " + this.totalPoints + "\n" ;
            //result += "Annual Risk of Ischemic Stroke: " + this.strokeRisk + "\n" ;
            //result += "Annual Risk of Stroke or Systemic Thromboembolism1: " + this.tiaRisk + "\n" ;
            //result += "Risk Category: " + this.riskCategory + "\n" ;
            return result ;
        }
    },
    methods : {
        epicConditionChanged(cond) {
            this.$services.srcalc.save(cond)
                .then(response => {
                    console.log("response from save epic conditions") ;
                    console.log(response) ;
                    cond.seal_condition_id = response.seal_condition_id ;
                    cond.updated_by_name = this.$store.state.user.full_name ;
                    cond.updated_dttm_str = this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") ;

                    if (cond.status_code == 'A')
                        this.$refs.calcRows.selectButton(cond.risk_category, "Yes") ;
                    else {
                        this.resetRiskCategory(cond.risk_category) ;                            
                    }
                }) ;
        },
        addSealCondition() {
            this.editCondition = {} ;
            this.editCondition.orig_data = {seal_condition_id: -1} ;

            this.editCondition.conditions = "" ;
            this.editCondition.condition_date = new Date() ;            
            this.editCondition.risk_category = "" ;            
            this.editCondition.condition_source = "USER" ;            
            this.editCondition.notes = "" ;
            this.editCondition.status_code = "A" ;
            this.editCondition.seal_condition_id = -1 ;
            
            this.$bvModal.show("condition-modal") ;
        },
        editSealCondition(cond) {
            console.log("In edit seal condition id: " + cond.seal_condition_id) ;
            this.editCondition = {} ;
            this.editCondition.conditions = cond.conditions ;
            this.editCondition.risk_category = cond.risk_category ;
            this.editCondition.status_code = cond.status_code ;
            this.editCondition.condition_source = "USER" ;
            this.editCondition.condition_date = this.$moment(cond.condition_date_str, "MM/DD/YYYY").toDate() ;
            this.editCondition.seal_condition_id = cond.seal_condition_id ;
            this.editCondition.orig_data = cond ;
            this.$bvModal.show("condition-modal") ;
        },
        saveSealCondition() {
            this.errors = {
                conditions: true,
                risk_category: true
            } ;
            if (this.editCondition.conditions.trim().length <= 0)
                this.errors.conditions = false ;
            if (this.editCondition.risk_category.trim().length <= 0)
                this.errors.risk_category = false ;
            
            console.log("in save seal method errors array") ;
            console.log(this.errors) ;
            
            var keys = Object.keys(this.errors) ;
            for (var i=0;i<keys.length;i++) {
                if (!this.errors[keys[i]]) 
                    return ;                
            }
            
            this.editCondition.condition_date_str =  this.$moment(this.editCondition.condition_date).format("MM/DD/YYYY")  ;
            
            var newCondition = (this.editCondition.orig_data.seal_condition_id && this.editCondition.orig_data.seal_condition_id == -1) ;
            
            console.log(this.editCondition) ;

            this.$services.srcalc.save(this.editCondition)
                .then(response => {
                    console.log("response from ajax save edit condition") ;
                    console.log(response) ;
                    this.editCondition.orig_data.seal_condition_id = response.seal_condition_id ;
                    this.editCondition.orig_data.conditions = this.editCondition.conditions ;
                    this.editCondition.orig_data.status_code = this.editCondition.status_code ;
                    this.editCondition.orig_data.risk_category = this.editCondition.risk_category ;
                    this.editCondition.orig_data.condition_date_str = this.$moment(this.editCondition.condition_date).format("MM/DD/YYYY") ;
                    this.editCondition.orig_data.updated_by_name = this.$store.state.user.full_name ;
                    this.editCondition.orig_data.updated_dttm_str = this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") ;

                    if (newCondition) {
                        this.editCondition.orig_data.created_by_name = this.$store.state.user.full_name ;
                        this.editCondition.orig_data.created_dttm_str = this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") ;
                        this.patient.seal_conditions.user_conditions.push(this.editCondition.orig_data) ;
                    }
                    if (this.editCondition.status_code == 'A')
                        this.$refs.calcRows.selectButton(this.editCondition.risk_category, "Yes") ;
                    else {
                        this.resetRiskCategory(this.editCondition.risk_category) ;                            
                    }

                    this.$bvModal.hide("condition-modal") ;

                }) ;
        },
        findIndex(sealConditionId) {
            for (var i=0; i< this.medHistList.length;i++) {
                if (this.medHistList[i].seal_condition_id == sealConditionId) {
                    return i ;
                }
            }
        },
        // call this method after update/remove on the medhistlist array
        resetRiskCategory(riskCategoryToRemove) {
            if (riskCategoryToRemove == "") return ;
            // reset the risk category only if other conditions don;t have the same risk category
            var rcFound = false ;
            for (var i=0; i< this.medHistList.length;i++) {
                if (this.medHistList[i].risk_category == riskCategoryToRemove && this.medHistList[i].status_code == 'A') {
                    rcFound = true ;
                    break ;
                }
            }
            if (!rcFound) {
                for (var i=0; i< this.patient.seal_conditions.user_conditions.length;i++) {
                    var cond = this.patient.seal_conditions.user_conditions[i] ;
                    if (cond.risk_category == riskCategoryToRemove && cond.status_code == 'A') {
                        rcFound = true ;
                        break ;
                    }
                }                
            }
            if (!rcFound) {
                this.$refs.calcRows.resetRiskCategory(riskCategoryToRemove) ;
            }
        },
        deleteSealCondition() {

            console.log("launching delete condition") ;
            this.$bvModal.msgBoxConfirm('Are you sure to delete this condition?', {
                title: 'Confirm Delete',
                size: 'sm',
                buttonSize: 'sm',
                okVariant: 'danger',
                okTitle: 'YES',
                cancelTitle: 'NO',
                footerClass: 'p-2',
                hideHeaderClose: false,
                centered: true
            })
            .then(value => {
                console.log("confirm dialong tetyurn value :" + value) ;
                if (!value) return ;

                var sealConditionId = this.editCondition.seal_condition_id ;
                console.log("In delete seal condition id: " + sealConditionId + " source :" + this.editCondition.condition_source) ;            
                
                this.editCondition.action = "delete" ;
                
                console.log(this.editCondition) ;            
                
                this.$services.srcalc.save(this.editCondition)
                    .then(response => {
                        console.log("deleted") ;
                        
                        for (var i=0;i<this.patient.seal_conditions.user_conditions.length;i++) {
                            if (this.patient.seal_conditions.user_conditions[i].seal_condition_id == sealConditionId) {
                                this.patient.seal_conditions.user_conditions.splice(i, 1) ;
                                this.resetRiskCategory(this.editCondition.risk_category) ;                            
                                this.$bvModal.hide("condition-modal") ;
                                break ;
                            }
                        }
                    }) ;

            }) ;
            
            console.log("after the dialog box value") ;
        },
        getAge(dateString) {
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;        
        }
    },
    head() {
        return {
            title: "CHA2DS2-VSac Score Calculator"
        };
    }
}

/* eslint-enable */
</script>

<style scoped>
    /* font-style: italic; 
    font-weight: bold; */
    .used_in_calc {        
        color:blue ;
    }
    .v-input {
        font-size: small;
    }
    .v-input .v-label {
        font-size: small;
    }
    .no-uppercase {
        text-transform: none;
    }
    .seal_cond {
        /*color: blue;*/
        font-style: italic;
    }
</style>

<style>
    #mytab .table td, #mytab .table th
    {
        border-top-color: #aac2f0;
    }
    #mytab .table thead th {
        border-bottom-color: #aac2f0;
    }
    #mytab .card-header {
        padding-top: 0.1em ;
        padding-bottom: 0.1em;
        padding-right: 1em;
        padding-left: 1em;
    }
</style>