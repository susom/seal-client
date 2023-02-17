<template>
    <b-container fluid class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="wells_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col  sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    Wells' Criteria for Pulmonary Embolism is a calculator app developed by SEAL. 
                <p>                
                <p>
                    The app uses data from the patient medical record at Stanford Health Care to estimate the pretest probability of pulmonary embolism 
                    using the Wells' criteria. <br/>On one side, the calculator and the score categories are displayed. On the other side, the past medical and 
                    surgical histories documented within Epic are displayed.                         
                    <br/>Suggested relevant items in the medical and surgical history that map to a Wells' score category are highlighted in blue.
                </p>
            </b-col>
        </b-row>        
        <b-row  class="smallfont">
            <b-col sm="11" md="11" lg="6" xl="6">
                <b-card
                    class="shadow-lg rounded-lg  ml-3 mt-2"                    
                    title="Wells' Criteria for PE Calculator"
                >                    
                    <b-card-text>
                        <calc-row :rows="rows" v-model="totalPoints" ref="calcRows"/>

                        <div id="noPointsDiv"  v-if="totalPoints == -1">
                            <h2>RESULT:</h2>
                            Please select an option for each category. The calculator will automatically calculate the risk score once you have selected an option for every category.
                        </div>
                        <div id="pointsDiv"  v-if="totalPoints > -1">                                                                                    
                            <h2>RESULT:</h2>

                            <calc-result-display :rows="resultRows" />

                            <p style="padding-top:10px">
                                {{riskCategory}} pre-test probability for PE ({{wellsRisk}} chance of PE among patients in this risk group from a cohort of 930 patients presenting to four Emergency Departments in tertiary care hospitals1)
                            </p>
                            <p style="padding-top:10px">
                                References:
                                <ol>
                                    <li>
                                        Wells PS, et al. Ann Intern Med. 2001 Jul 17;135(2):98-107.
                                    </li>
                                    <li>
                                        Van Belle A et al. JAMA 2006; 295:172
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
            <b-col sm="11" md="11" lg="5" xl="5">
                <b-card
                    class="shadow ml-3 mt-2"
                    no-body
                    id="mytab"              
                >
                    <b-tabs card content-class="ml-3 mr-3 mb-3"  fill nav-wrapper-class="bg-white" active-nav-item-class="bg-primary">
                        <b-tab no-body title="Medical History">
                            <b-card-text>
                                <b-table outlined hover
                                    :items="medHistList" 
                                    :fields="medHistHeaders" 
                                    :filter="search"
                                    sort-icon-left
                                    class="mt-4 border-primary"                            
                                    small style="font-size:14px" show-empty :busy="loadingConditions">
                                    <template #table-busy>
                                        <div class="text-center text-info my-2">
                                        <b-spinner class="align-middle"></b-spinner>
                                        <strong>Loading...</strong>
                                        </div>
                                    </template>                            
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">No History available</h5>
                                    </template> 
                                    <template #cell(asserted_date_long)="data">
                                        {{data.item.asserted_date_str}}
                                    </template>
                                </b-table>  
                                <div class="pt-2">
                                    Items highlighted above in <span style="color:blue">blue</span> are suggested Wells' Criteria score diagnoses with corresponding categories. These should be reviewed and verified by the clinical team.
                                </div>
                            </b-card-text>
                        </b-tab>
                        <b-tab no-body title="Surgical History">
                            <b-card-text>
                                <b-table outlined hover
                                    :items="surgicalHistoryList" 
                                    :fields="surgicalHistoryHeaders"                                     
                                    class="mt-4 border-secondary"               
                                    sort-icon-left             
                                    small style="font-size:14px" show-empty :busy="loadingSurgicalHistory">
                                    <template #table-busy>
                                        <div class="text-center text-info my-2">
                                        <b-spinner class="align-middle"></b-spinner>
                                        <strong>Loading...</strong>
                                        </div>
                                    </template>                            
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">
                                            No surgical data available for last 4 weeks
                                        </h5>
                                    </template>
                                </b-table>  
                            </b-card-text>
                        </b-tab>
                        <b-tab no-body title="Heart Rate">
                            <b-card-text>
                                <b-table outlined hover
                                    :items="heartRateList" 
                                    :fields="heartRateHeaders"                                     
                                    class="mt-4 border-secondary"               
                                    sort-icon-left             
                                    small style="font-size:14px" show-empty :busy="loadingHeartRate">
                                    <template #table-busy>
                                        <div class="text-center text-info my-2">
                                        <b-spinner class="align-middle"></b-spinner>
                                        <strong>Loading...</strong>
                                        </div>
                                    </template>                            
                                    <template #empty>
                                        <h5 style="text-align:center;height:80px;" class="mt-5">
                                            No heart rate readings in last 24 hours
                                        </h5>
                                    </template> 
                                    <template #cell(rate)="data">
                                        {{data.item.rate}} / min
                                    </template>                                    
                                </b-table>  
                            </b-card-text>
                            <b-card-footer class="text-right mr-3">
                                Mean Heart Rate : {{meanRate}} /min
                            </b-card-footer>
                        </b-tab>
                    </b-tabs>
                </b-card>
            </b-col>
        </b-row>
        <b-modal id="wells-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
            body-bg-variant="dark">
            <ul class="text-white">
                <li>Items highlighted in blue in selected items to include in score calculator.</li>
                <li>Pre-selected selected items are suggestions based on data in the patient’s medical history.</li>
                <li>You may use the “Search” bar to search for relevant patient medical history. </li>
                <li>For more info about the Wells' PE Score, visit  website.</li>
            </ul>
        </b-modal>        
    </b-container>
</template>

<script>
import CalcResultDisplay from '~/components/CalcResultDisplay.vue';
import CalcRow from '~/components/CalcRow.vue';

var dvtList = ["I26", "I81", "I82 ", "Z86.718", "Z86.711"]
var dvtRegEx = new RegExp('^(I26\.|I81\.|I82\.|Z86\.718|Z86\.711)', 'i');

export default {
  components: { CalcRow, CalcResultDisplay },
    data () {
        return {
            loadingConditions: true,
            loadingSurgicalHistory: true,
            loadingHeartRate: true,
            totalPoints: -1,
            wellsRisk: "",
            riskCategory: "",
            rows : [
                { text: "Clinical signs and symptoms of DVT", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 3} ] },
                { text: "PE is #1 diagnosis OR equally likely", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 3} ] },
                { text: "Heart rate > 100", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1.5} ] },
                { text: "Immobilization at least 3 days OR surgery in the previous 4 weeks", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1.5} ] },
                { text: "Previous, objectively diagnosed PE or DVT", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1.5} ] },
                { text: "Hemoptysis", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
                { text: "Malignancy w/ treatment within 6 months or palliative", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] }
            ],
            medHistHeaders: [
                { label: "Condition", key: "condition", sortable: true },
                { label: "Date", key: "asserted_date_long", sortable: true },
                { label: "Wells' Criteria Risk Category", key: "risk_category", sortable:true }
            ],
            chosenTab: 0,
            medHistList: [],
            heartRateList: [],
            heartRateHeaders: [
                { label: "Date", key: "date_str", sortable: true },
                { label: "Heart Rate", key: "rate", sortable: true }
            ],
            surgicalHistoryList: [],
            surgicalHistoryHeaders: [
                { label: "Date", key: "Date", sortable: true },
                { label: "Surgery", key: "CodeName", sortable: true },
                { label: "Comments", key: "Comment", sortable: true } 
            ],            
            meanRate: 0,
            search: "",            
            patient: {},
            resultRows : [
                { text: "Total Score", value: "" },
                { text: "Risk Level", value: "" },
                { text: "Calculated risk of PE", value: "" }
            ]            
        }
    },
    async fetch() {
        console.log("In fetch method of the wells criteria page") ;
        
        this.$store.commit('setAppId', this.$services.wellscalc.APP_ID) ;
        this.$services.wellscalc.dblog("WellsCalcHome", "In Wells Criteria for PE Home Page") ;
        this.$store.commit('setPageTitle', "Wells' Criteria for Pulmonary Embolism") ;
        this.$store.commit('setCurrentApp', { help : "wells-help-modal" }) ;

        //var response = await this.$axios.get("/fhir-app/wellscalc/api/v1/conditions?pid=" + this.$store.state.patientId + "&aid=" + APP_ID) ;
        //console.log(response) ;        
        var conditions = await this.$services.wellscalc.conditions() ;
        
        this.medHistList = conditions.map(condition => {
            var medHist = {} ;
            medHist.condition = condition.condition ;
            medHist.asserted_date_str = condition.asserted_date ;
            medHist.asserted_date_long = condition.asserted_date_long ;
            var grpName = "" ;

            if (dvtRegEx.test(condition.icd10) || (dvtList.indexOf(condition.icd10) > -1))
                medHist.risk_category = "Diagosed PE or DVT" ;    

            return medHist ;
        }) ;

        console.log(this.medHistList) ;
        this.loadingConditions = false ;

        this.heartRateList = this.$services.wellscalc.heartRate() ;
        console.log("heart rate list done") ;
        console.log(this.heartRateList) ;
        this.loadingHeartRate = false ;

        var totalRate = 0 ;
        if (this.heartRateList.length > 0) {
            this.heartRateList.forEach(element => {
                totalRate += element.rate ;
            });
            this.meanRate = totalRate / this.heartRateList.length ;
        } else {
            this.meanRate = 0 ;
        }
        if (this.meanRate > 100) {
            this.rows[2].value = 1.5 ;
        }
        
        console.log("wellscalc: invoking patient call ") ;
        this.patient = await this.$services.wellscalc.patient() ;

        console.log("wellscalc: invoking surgical history call FOR " + this.patient.epicPatientId) ;
        this.surgicalHistoryList = await this.$services.wellscalc.surgicalHistory(this.patient.epicPatientId) ;

        this.loadingSurgicalHistory = false ;

        // Trigger the points calculation 
        this.$refs.calcRows.onChoiceChange() ;
    },
    mounted () {
        console.log("In mounted method of the wells criteria page") ;
    },
    watch : {
        totalPoints : function(newPoints) {
            
            this.wellsRisk = "" ;
            this.riskCategory = "" ;

            if (newPoints <= 1) {
                this.wellsRisk = "1.3%" ;
                this.riskCategory = "Low" ;
            } else if (newPoints > 1 && newPoints <= 6) {
                this.wellsRisk = "16.2%" ;
                this.riskCategory = "Moderate" ;
            } else if (newPoints > 6) {
                this.wellsRisk = "37.5%" ;
                this.riskCategory = "High" ;
            }
            this.resultRows[0].value = newPoints + " " + (newPoints > 1?"points":"point") ;
            this.resultRows[1].value = this.riskCategory ;
            this.resultRows[2].value = this.wellsRisk ;
        }
    },
    computed : {
        result() {
            var result = "Wells' Criteria for Pulmonary Embolism for " + this.patient.fullName + " (MRN: " + this.patient.mrn + ") \n\n";
            result += "Date: " + this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") + "\n" ; 
            this.rows.forEach(row => {
                result = result + row.text + ": " + row.value + "\n" ;
            }) ;
            result += "Result:" + "\n" ;
            result += "Total Score: " + this.totalPoints + "\n" ;
            result += "Risk Level: " + this.riskCategory + "\n" ;
            result += "Calculated risk of PE: " + this.wellsRisk + "\n" ;

            return result ;
        }
    },
    methods : {

    },
    head() {
        return {
            title: "Wells' Criteria for PE"
        };
    }
}
</script>

<style scoped>
    .used_in_calc {
        color: blue;
        font-style: italic;
        font-weight: bold;
    }
    .b-table-empty-row {
        background-color: white;
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
</style>