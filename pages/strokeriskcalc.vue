<template>
    <v-container fluid>
        <v-row>
            <v-col cols="10">
                <p class="mt-2">
                    The SEAL CHA₂DS₂-VASc Score App uses data from the patient medical record at Stanford Health Care to calculate the
                    estimated annual risk of stroke and thromboembolism for patients with non-valvular atrial fibrillation.
                    Suggested relevant items in the medical history that map to a CHA₂DS₂-VASc risk category are highlighted in blue.
                </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-card
                    elevation="3"
                    outlined
                >
                    <v-card-title class="">CHA₂DS₂-VSac Score Calculator</v-card-title>
                    <v-card-text>
                        
                        <calc-row :rows="rows" v-model="totalPoints" ref="calcRows"/>

                        <div v-if="totalPoints == -1">
                            <h2>RESULT:</h2>
                            Please fill out required fields.
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
                            <v-btn @click="copyCalc" color="primary">Copy Result</v-btn>
                            <span class="pl-3" style="font-size:small">{{copyBtnInfo}}</span>
                        </div>                                            
                    </v-card-text>
                </v-card>                
            </v-col>
            <v-col cols="5">
                <v-card
                    elevation="3"
                    outlined
                >
                    <v-card-title>Medical History</v-card-title>
                    <v-card-text>
                        <v-data-table
                            :headers="medHistHeaders"
                            :items="medHistList"
                            disable-pagination
                            item-key="name"
                            class="elevation-1"
                            :search="search"                            
                            >
                            <template v-slot:top>
                                <v-row>
                                    <v-col offset-md="6">                                
                                        <v-text-field
                                            v-model="search"
                                            label="Search"
                                            class="mx-4"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </template>
                            <template v-slot:item.condition="{ item }">
                                <span :class="{ 'used_in_calc': item.risk_category}">{{item.condition}}</span>
                            </template>                                                        
                        </v-data-table>  
                        <div class="pt-2">Items highlighted above in <span style="color:blue">blue</span> are suggested CHA₂DS₂-VASc risk score diagnoses with corresponding categories. These should be reviewed and verified by the clinical team.</div>
                    </v-card-text>
                </v-card>                   
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import CalcRow from '~/components/CalcRow.vue';

var APP_ID = 5 ;
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
                { text: "Condition", value: "condition" },
                { text: "Date", value: "asserted_date_str" },
                { text: "CHA₂DS₂-VASc Risk Category", value: "risk_category" }
            ],
            medHistList: [],
            search: "",
            copyBtnInfo: "",
            patient: {},
            resultRows: [
                {text: "Total Score", value: ""},
                {text: "Annual Risk of Ischemic Stroke<sup>1</sup>", value: ""},
                {text: "Annual Risk of Stroke or Systemic Thromboembolism<sup>1</sup>", value: ""},
                {text: "Risk Category", value: ""}
            ]
        }
    },
    async fetch() {
        console.log("In fetch method of the stroke calc page") ;
        var conditions = await this.$services.srcalc.conditions() ;
        var _self = this ;
        
        try {
            this.medHistList = conditions.map(condition => {
                var medHist = {} ;
                medHist.condition = condition.condition ;
                medHist.asserted_date_str = condition.asserted_date ;
                medHist.asserted_date_long = condition.asserted_date_long ;
                var grpName = "" ;

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
                    medHist.risk_category = "Vascular disease History" ;    
                    _self.$refs.calcRows.selectButton("Vascular disease history (prior MI, peripheral artery disease, or aortic plaque)", "Yes") ;
                }

                return medHist ;
            }) ;
        } catch (err) {
            console.log("Error in procesing cond list :" + err) ;
            alert(err) ;
        }
        try {
            this.patient = await this.$services.srcalc.patient() ;
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
        } catch (err) {
            console.log("error in javascript :" + err) ;
        }

        // Trigger the points calculation 
        this.$refs.calcRows.onChoiceChange() ;

        console.log("Total Points :" + this.totalPoints) ;
    },    
    mounted () {
        console.log("In mounted method of the stroke calc page") ;
        this.$store.commit('setAppId', this.$services.srcalc.APP_ID) ;
        this.$store.commit('setPageTitle', "CHA₂DS₂-VASc Score for Stroke and Thromboembolism Risk in Non-Valvular Atrial Fibrillation") ;        
        this.$services.srcalc.dblog("StrokeCalcHome", "In Stroke Calc Home Page") ;
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
    methods : {
        pointsChange() {

        },
        copyCalc () {
            var result = "CHA2DS2-VASc score for " + this.patient.fullName + " (MRN: " + this.patient.mrn + ") \n\n";
            result += "Date: " + this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") + "\n" ; 
            this.rows.forEach(row => {
                result = result + row.text + ": " + row.value + "\n" ;
            }) ;
            result += "Result:" + "\n" ;
            result += "Total Score: " + this.totalPoints + "\n" ;
            //result += "Annual Risk of Ischemic Stroke: " + this.strokeRisk + "\n" ;
            //result += "Annual Risk of Stroke or Systemic Thromboembolism1: " + this.tiaRisk + "\n" ;
            //result += "Risk Category: " + this.riskCategory + "\n" ;

            console.log(result) ;

            if (window.clipboardData) {
                window.clipboardData.setData('Text', result);
                this.copyBtnInfo = "Result copied to clipboard." ;
                setTimeout(function() { this.copyBtnInfo = "" ; }, 2000) ;
            } else {
                this.copyBtnInfo = "windows.clipboarddata doesn't exist" ;
                setTimeout(function() { this.copyBtnInfo = "" ; }, 2000) ;
            }
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
</script>

<style scoped>
    .used_in_calc {
        color: blue;
        font-style: italic;
        font-weight: bold;
    }
    table {
        margin-top:10px;
        padding:5px;
        border-collapse: collapse;
        width: 95% ;
    }
    th, td {        
        padding:5px;        
        border: 1px solid black;        
    }
</style>