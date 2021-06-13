<template>
    <v-container fluid>
        <v-row>
            <v-col cols="10">
                <p class="mt-2">
                    The SEAL PE-Well’s App uses data from the patient medical record at Stanford Health Care to estimate the pretest probability of 
                    pulmonary embolism using the Well’s criteria for pulmonary embolism.  Suggested relevant items in the medical and surgical history 
                    that map to a Well’s score category are highlighted in blue.
                </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-card
                    elevation="3"
                    outlined
                >
                    <v-card-title>Wells' Criteria for PE Calculator</v-card-title>
                    <v-card-text>
                        
                        <calc-row :rows="rows" v-model="totalPoints" ref="calcRows"/>

                        <div id="noPointsDiv"  v-if="totalPoints == -1">
                            <h2>RESULT:</h2>
                            Please fill out required fields.
                        </div>
                        <div id="pointsDiv"  v-if="totalPoints > -1">                                                                                    
                            <h2>RESULT:</h2>

                            <calc-result-display :rows="resultRows" />

                            <p style="padding-top:10px">
                                {{riskCategory}} pre-test probability for PE ({{wellsRisk}} chance of PE among patients in this risk group from an Emergency Department cohort)
                            </p>
                            <p style="padding-top:10px">
                                References:
                                <ol>
                                    <li>
                                        Wells PS, et al. Ann Intern Med. 2001 Jul 17;135(2):98-107.
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
                <v-sheet elevation="3" outlined>
                    <v-tabs v-model="chosenTab" fixed-tabs>
                        <v-tab>Medical History</v-tab>
                        <v-tab>Surgical History</v-tab>
                        <v-tab>Heart Rate</v-tab>                        
                    </v-tabs>
                    <v-tabs-items v-model="chosenTab">
                        <v-tab-item>
                            <v-card
                                elevation="3"
                                outlined
                            >                                
                                <v-card-text>
                                    <v-data-table
                                        :headers="medHistHeaders"
                                        :items="medHistList"
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
                                                        dense
                                                    ></v-text-field>
                                                </v-col>
                                            </v-row>
                                        </template>
                                        <template v-slot:item.condition="{ item }">
                                            <span :class="{ 'used_in_calc': item.risk_category}">{{item.condition}}</span>
                                        </template>                            
                                    </v-data-table>
                                    <div class="pt-2">
                                        Items highlighted above in <span style="color:blue">blue</span> are suggested Wells' Criteria score diagnoses with corresponding categories. These should be reviewed and verified by the clinical team.
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card
                                elevation="3"
                                outlined                            
                            >
                                <v-card-text class="justify-center">
                                    <img src="images/coming_soon.jpg">
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card
                                elevation="3"
                                outlined                            
                            >
                                <!--<v-card-title>Heart Rate</v-card-title>-->
                                <v-card-text>
                                    <v-simple-table>
                                        <template v-slot:default>
                                        <thead>
                                            <tr>
                                                <th class="text-left">Date</th>
                                                <th class="text-left">Heart Rate (/min)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for="hrate in heartRateList"
                                                :key="hrate.date_long"
                                            >
                                                <td>{{ hrate.date_str }}</td>
                                                <td>{{ hrate.rate }}</td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="2" class="text-right">
                                                    Mean Heart Rate : {{meanRate}} /min
                                                </td>
                                            </tr>
                                        </tfoot>
                                        </template>
                                    </v-simple-table>
                                </v-card-text>
                            </v-card>                        
                        </v-tab-item>
                    </v-tabs-items>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import CalcResultDisplay from '~/components/CalcResultDisplay.vue';
import CalcRow from '~/components/CalcRow.vue';

var APP_ID = 6 ;
var dvtList = ["I26", "I81", "I82 ", "Z86.718", "Z86.711"]
var dvtRegEx = new RegExp('^(I26\.|I81\.|I82\.|Z86\.718|Z86\.711)', 'i');

export default {
  components: { CalcRow, CalcResultDisplay },
    data () {
        return {
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
                { text: "Condition", value: "condition" },
                { text: "Date", value: "asserted_date_str" },
                { text: "Wells' Criteria Risk Category", value: "risk_category" }
            ],
            chosenTab: 0,
            medHistList: [],
            heartRateList: [],
            meanRate: 0,
            search: "",
            copyBtnInfo: "",
            patient: {},
            resultRows : [
                { text: "Total Score", value: "" },
                { text: "Risk Level", value: "" },
                { text: "Calculated risk of PE", value: "" }
            ]            
        }
    },
    async fetch() {
        console.log("In fetch method of the stroke calc page") ;
        
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

        this.heartRateList = this.$services.wellscalc.heartRate() ;

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

        this.patient = await this.$services.wellscalc.patient() ;

        // Trigger the points calculation 
        this.$refs.calcRows.onChoiceChange() ;
    },
    mounted () {
        console.log("In mounted method of the a3 pain tab page") ;
        this.$store.commit('setAppId', this.$services.a3pain.APP_ID) ;
        this.$services.wellscalc.dblog("A3PainHome", "In A3 Pain Tab Home Page") ;
        this.$store.commit('setPageTitle', "Wells' Criteria for Pulmonary Embolism") ;
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
    methods : {
        copyCalc() {

            var result = "Wells' Criteria for Pulmonary Embolism for " + this.patient.fullName + " (MRN: " + this.patient.mrn + ") \n\n";
            this.rows.forEach(row => {
                result = result + row.text + ": " + row.value + "\n" ;
            }) ;
            result += "Result:" + "\n" ;
            result += "Total Score: " + this.totalPoints + "\n" ;
            result += "Risk Level: " + this.riskCategory + "\n" ;
            result += "Calculated risk of PE: " + this.wellsRisk + "\n" ;

            console.log(result) ;

            if (window.clipboardData) {
                window.clipboardData.setData('Text', result);
                this.copyBtnInfo = "Result copied to clipboard." ;
                setTimeout(function() { this.copyBtnInfo = "" ; }, 2000) ;
            } else {
                this.copyBtnInfo = "windows.clipboarddata doesn't exist" ;
                setTimeout(function() { this.copyBtnInfo = "" ; }, 2000) ;
            }

        }
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
</style>
