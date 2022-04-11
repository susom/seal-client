<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="areds_blue_app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    AREDS Simplified Severity Scale Calculator is a risk prediction calculator app developed by SEAL. 
                <p>
                <p>
                    The app uses a simplified methodology to calculate a risk score and the corresponding 5-year risk of progression to 
                    advanced age-related macular degeneration (AMD).
                </p>
            </b-col>
        </b-row>
        <b-row class="smallfont">
            <b-col sm="11" md="11" lg="6">
                <b-card
                    class="shadow-lg rounded-lg ml-3 mt-2 mb-2"                    
                    title="AREDS Calculator"                    
                >                    
                    <b-card-text>
                        <b-row class="mt-3">
                            <b-col cols="3">                                
                            </b-col>
                            <b-col style="border-right:1px solid green" class="text-center">                                
                                <b>Right Eye</b>
                            </b-col>
                            <b-col class="text-center">
                                <b>Left Eye</b>
                            </b-col>
                        </b-row>
                        <b-row class="mt-3">
                            <b-col cols="3">
                                <b>Presence of GA/CNV</b>
                            </b-col>
                            <b-col style="border-right:1px solid green" class="text-center">
                                <b-button-group size="sm" id="calcBtns">
                                    <b-button pill pressed :variant="getRVariant(0, 0)" @click="selectRButton(0, 0)"  class="mr-3 smallfont" size="sm" style="width: 80px">No (0)</b-button>
                                    <b-button pill pressed :variant="getRVariant(0, 1)" @click="selectRButton(0, 1)" class="mr-3 smallfont" size="sm" style="width: 80px">Yes (2)</b-button>
                                </b-button-group>    
                            </b-col>
                            <b-col class="text-center">
                                <b-button-group size="sm" id="calcBtns">
                                <b-button pill pressed :variant="getLVariant(0, 0)" @click="selectLButton(0, 0)" class="mr-3 smallfont" size="sm" style="width: 80px">No (0)</b-button>
                                <b-button pill pressed :variant="getLVariant(0, 1)" @click="selectLButton(0, 1)" class="mr-3 smallfont" size="sm" style="width: 80px">Yes (2)</b-button>
                                </b-button-group>
                            </b-col>
                        </b-row>

                        <b-row class="mt-3">
                            <b-col cols="3">
                                <b>Large Drusen</b>
                            </b-col>
                            <b-col style="border-right:1px solid green" class="text-center">   
                                <b-button-group size="sm" id="calcBtns">                             
                                <b-button pill pressed :variant="getRVariant(1, 0)" @click="selectRButton(1, 0)" class="mr-3 smallfont" size="sm" style="width: 80px">No (0)</b-button>
                                <b-button pill pressed :variant="getRVariant(1, 1)" @click="selectRButton(1, 1)"  class="mr-3 smallfont" size="sm" style="width: 80px">Yes (1)</b-button>
                                </b-button-group>
                            </b-col>
                            <b-col class="text-center">                    
                                <b-button-group size="sm" id="calcBtns">           
                                <b-button pill pressed :variant="getLVariant(1, 0)" @click="selectLButton(1, 0)" class="mr-3 smallfont" size="sm" style="width: 80px">No (0)</b-button>
                                <b-button pill pressed :variant="getLVariant(1, 1)" @click="selectLButton(1, 1)" class="mr-3 smallfont" size="sm" style="width: 80px">Yes (1)</b-button>
                                </b-button-group>
                            </b-col>
                        </b-row>

                        <b-row class="mt-3">
                            <b-col cols="3">
                                <b>Pigment</b>
                            </b-col>
                            <b-col style="border-right:1px solid green" class="text-center">        
                                <b-button-group size="sm" id="calcBtns">                                              
                                <b-button pill pressed :variant="getRVariant(2, 0)" @click="selectRButton(2, 0)"  class="mr-3 smallfont" size="sm" style="width: 80px">No (0)</b-button>
                                <b-button pill pressed :variant="getRVariant(2, 1)" @click="selectRButton(2, 1)"  class="mr-3 smallfont" size="sm" style="width: 80px">Yes (1)</b-button>
                                </b-button-group>
                            </b-col>
                            <b-col class="text-center">
                                <b-button-group size="sm" id="calcBtns">
                                <b-button pill pressed :variant="getLVariant(2, 0)" @click="selectLButton(2, 0)"  class="mr-3 smallfont" size="sm" style="width: 80px">No (0)</b-button>
                                <b-button pill pressed :variant="getLVariant(2, 1)" @click="selectLButton(2, 1)" class="mr-3 smallfont" size="sm" style="width: 80px">Yes (1)</b-button>
                                </b-button-group>
                            </b-col>
                        </b-row>

                        <b-row class="mt-1">
                            <b-col cols="3"></b-col>
                            <b-col class="error mr-3 ml-3">
                                <span v-if="rightRows[0].value == 2">
                                You have selected YES for Presence of GA/CNV in the Right Eye. The maximum score for each eye, so no additional factors can be selected.
                                </span>
                            </b-col>
                            <b-col class="error mr-3 ml-3">
                                <span v-if="leftRows[0].value == 2">
                                You have selected YES for Presence of GA/CNV in the Left Eye. The maximum score for each eye, so no additional factors can be selected.
                                </span>
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
                <b-card
                    class="shadow-lg rounded-lg ml-3 mr-2"
                    title="Results"                    
                >                    
                    <b-card-text>
                        <b-row>
                            <b-col class="text-center mt-2">
                                                                
                                <p style="font-size: 1.3em" v-if="rightRows[0].value == 2 || leftRows[0].value == 2">Your risk score is <b>{{totalPoints==-1?"":totalPoints}}</b> with advanced AMD in one or both eyes.</p>
                                <p style="font-size: 1.3em" v-else>The AREDS Simplified Severity Score for this patient is <b>{{totalPoints==-1?"":totalPoints}}</b>. </p>

                                <p style="font-size: 1.3em">This score indicates that there is a <b>{{aredsPercent}}%</b> likelihood of developing advanced AMD over the next <b>five</b> years.</p>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col class="text-right" cols="6">
                                <b-button pill pressed variant="primary" class="mr-3 smallfont" size="sm" style="width:200px;" @click="copyCalcPatient">Copy Results for Patient</b-button>
                            </b-col>
                            <b-col class="text-left" cols="6">
                                <b-button pill pressed variant="primary" class="mr-3 smallfont" size="sm" style="width:200px;" @click="copyCalcEHR">Copy Results for EHR</b-button>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col class="text-right" cols="6">
                                <span class="pl-3" style="font-size:small">{{copyPatientBtnInfo}}</span>
                            </b-col>
                            <b-col class="text-left" cols="6">
                                <span class="pl-3" style="font-size:small">{{copyEhrBtnInfo}}</span>
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>                
            </b-col>
            <b-col  sm="11" md="11" lg="6"  >
                <b-card
                    class="shadow-lg rounded-lg ml-3 mt-2 mr-3"
                    title="Approximate 5-Year Rates of Progression to Advanced AMD"                    
                >                    
                    <b-card-text>
                        <b-row class="mt-4">
                            <b-col>
                                <highchart                             
                                    :options="chartOptions"                                    
                                    />
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>            
        </b-row>  

        <b-modal id="areds-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
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

export default {
  components: { CalcRow },
    data () {
        return {            
            loadingConditions: true,
            totalPoints: -1,
            aredsPercent: 0,
            rightRows : [                
                { text: "Presence of GA/CNV", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 2} ] },
                { text: "Large Drusen", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
                { text: "Pigment", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
            ],
            leftRows : [                
                { text: "", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 2} ] },
                { text: "", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
                { text: "", value: -1, buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] },
            ],            
            copyEhrBtnInfo: "",
            copyPatientBtnInfo: "",
            patient: {
                seal_conditions: {
                    user_conditions: [],
                    epic_conditions: []
                }
            }            
        }
    },
    async fetch() {
        console.log("In fetch method of the stroke calc page env " + process.env.BASE_URL) ;
        this.$store.commit('setAppId', this.$services.aredscalc.APP_ID) ;
        this.$store.commit('setPageTitle', "AREDS Simplified Severity Scale Calculator") ;
        this.$store.commit('setCurrentApp', { help : "areds-help-modal" }) ;
        this.$services.aredscalc.dblog("AredsCalcHome", "In AREDS Calc Home Page") ;
        this.patient = await this.$services.seal.patient(this.$services.aredscalc.APP_ID) ;
    },    
    mounted () {
        console.log("In mounted method of the areds calc page") ;
    },
    watch : {
        totalPoints : function(newPoints) {
            var percent = 0 ;
            if (this.rightRows[0].value == 0 && this.leftRows[0].value == 0) {
                if (newPoints == 0)
                    percent = 0.4 ;
                else if (newPoints == 1)
                    percent = 3.1 ;
                else if (newPoints == 2)
                    percent = 11.8 ;
                else if (newPoints == 3)
                    percent = 25.9 ;
                else if (newPoints == 4)
                    percent = 47.3 ;
            } else {
                if (newPoints == 2)
                    percent = 14.8 ;
                else if (newPoints == 3)
                    percent = 35.4 ;
                else if (newPoints == 4)
                    percent = 53.1 ;
            }
            this.aredsPercent = percent ;
        }
    },
    methods : {
        getRVariant : function(rowIdx, btnIdx) {
            
            if (this.rightRows[0].value == 2 && rowIdx > 0) return "warning" ; 
            
            if (this.rightRows[rowIdx].buttons[btnIdx].points == this.rightRows[rowIdx].value)
                return "primary" ;
            else
                return "secondary" ;
        },
        getLVariant(rowIdx, btnIdx) {            
            
            if (this.leftRows[0].value == 2 && rowIdx > 0) return "warning" ;

            if (this.leftRows[rowIdx].buttons[btnIdx].points == this.leftRows[rowIdx].value)
                return "primary" ;
            else
                return "secondary" ;
        },
        selectRButton(rowIdx, btnIdx) {            
            this.rightRows[rowIdx].value = this.rightRows[rowIdx].buttons[btnIdx].points ;
            if (rowIdx == 0 && btnIdx == 1) {
                this.rightRows[1].value = -1 ;
                this.rightRows[2].value = -1 ;
            }
            this.totalPoints = 0 ;
            for (var i=0;i< 3; i++) {
                if (this.rightRows[i].value > -1)
                    this.totalPoints += this.rightRows[i].value ;
                if (this.leftRows[i].value > -1)
                    this.totalPoints += this.leftRows[i].value ;
            }
            if (this.totalPoints > 4) this.totalPoints = 4 ;
            console.log("Total Points: " + this.totalPoints) ;
        },
        selectLButton(rowIdx, btnIdx) {
            this.leftRows[rowIdx].value = this.leftRows[rowIdx].buttons[btnIdx].points ;
            if (rowIdx == 0 && btnIdx == 1) {
                this.leftRows[1].value = -1 ;
                this.leftRows[2].value = -1 ;
            }            
            this.totalPoints = 0 ;
            for (var i=0;i< 3; i++) {
                if (this.rightRows[i].value > -1)
                    this.totalPoints += this.rightRows[i].value ;
                if (this.leftRows[i].value > -1)
                    this.totalPoints += this.leftRows[i].value ;
            }
            if (this.totalPoints > 4) this.totalPoints = 4 ;
            console.log("Total Points: " + this.totalPoints) ;
        },
        handleDefaultOnValue(val) {
            return (val == -1 ? 0 : val) ;
        },
        copyCalcEHR () {
            var result = "AREDS Simplified Severity Score Calculation \n\n" ;
            result += this.patient.fullName + " (MRN: " + this.patient.mrn + ") \n";
            result += "Date: " + this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") + "\n\n" ; 

            result += "Right Eye Factors:\n" ;
            result += "GA/CNV: " + this.handleDefaultOnValue(this.rightRows[0].value) + "\n";
            result += "Large Drusen: " + this.handleDefaultOnValue(this.rightRows[1].value) + "\n";
            result += "Pigment Changes: " + this.handleDefaultOnValue(this.rightRows[2].value) + "\n\n";

            result += "Left Eye Factors:\n" ;
            result += "GA/CNV: " + this.handleDefaultOnValue(this.leftRows[0].value) + "\n";
            result += "Large Drusen: " + this.handleDefaultOnValue(this.leftRows[1].value) + "\n";
            result += "Pigment Changes: " + this.handleDefaultOnValue(this.leftRows[2].value) + "\n\n";

            result += "RESULTS: \n" ;
            result += "Total Score: " + this.handleDefaultOnValue(this.totalPoints) + "\n";
            result += "5-Year Risk of Advanced AMD: " + this.aredsPercent + "%\n" ;

            console.log(result) ;

            if (window.clipboardData) {
                window.clipboardData.setData('Text', result);
                this.copyEhrBtnInfo = "Results copied to clipboard." ;
                setTimeout(function() { this.copyEhrBtnInfo = "" ; }, 2000) ;
            } else {
                this.copyEhrBtnInfo = "windows.clipboarddata doesn't exist" ;
                setTimeout(function() { this.copyEhrBtnInfo = "" ; }, 2000) ;
            }
        },
        copyCalcPatient () {
            
            var result = "AREDS Simplified Severity Score Calculation \n\n" ;
            result += this.patient.fullName + " (MRN: " + this.patient.mrn + ") \n";
            result += "Date: " + this.$moment(new Date()).format("MM/DD/YYYY hh:mm:ss A") + "\n\n" ; 

            if (this.rightRows[0].value <= 0 && this.leftRows[0].value <= 0) {
                result += "Based on today’s eye examination, you currently have a Simplified Severity Score of " + this.handleDefaultOnValue(this.totalPoints) ;
                result += " based on your current stage of age-related macular degeneration (AMD). \n\n" ;
                result += "This score indicates that you have a " + this.aredsPercent + " % likelihood of developing advanced AMD over the next five years." ;
            } else if (this.rightRows[0].value + this.leftRows[0].value == 2) {
                result += "Based on today’s eye examination, you currently have a Simplified Severity Score of " + this.handleDefaultOnValue(this.totalPoints) ;
                result += " based on your current stage of age-related macular degeneration (AMD). \n\n" ;
                result += "This score indicates that you have a " + this.aredsPercent + "% likelihood of developing advanced AMD in your other eye over the next five years." ;
            } else if (this.rightRows[0].value == 2 && this.leftRows[0].value == 2) {
                result += "You currently have advanced AMD in both eyes." ;
            }

            console.log(result) ;

            if (window.clipboardData) {
                window.clipboardData.setData('Text', result);
                this.copyPatientBtnInfo = "Results copied to clipboard." ;
                setTimeout(function() { this.copyPatientBtnInfo = "" ; }, 2000) ;
            } else {
                this.copyPatientBtnInfo = "windows.clipboarddata doesn't exist" ;
                setTimeout(function() { this.copyPatientBtnInfo = "" ; }, 2000) ;
            }
        }
    },
    computed : {
        chartOptions() {
            var plotLineValue = 0 ;
            if (this.totalPoints == 0)
                plotLineValue = .5 ;
            else if (this.totalPoints == 1)
                plotLineValue = 3 ;
            else if (this.totalPoints == 2)
                plotLineValue = 12 ;
            else if (this.totalPoints == 3)
                plotLineValue = 25 ;
            else if (this.totalPoints == 4)
                plotLineValue = 50 ;

            return {
                chart: {
                    type: 'column',
                },            
                title: {
                    text: ''
                },
                legend : {
                    enabled: false
                },
                xAxis: {
                    min: 0,
                    title: {
                        text: "No. of Risk Factors"
                    },
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Event Rate, %'
                    },
                    plotLines: [{ 
                        label: {text: this.aredsPercent + " %"},                       
                        value: this.aredsPercent,
                        color: 'red',
                        dashStyle: 'solid',
                        width: 1,
                        zIndex: 100
                    }]                    
                },
                tooltip: {
                    enabled: false,
                    headerFormat: '<spa n style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
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
                            format: '{y} %'
                        }
                    }
                },
                series: [{
                    name: '' ,
                    data: [ 
                        {x: 0, y:.5, color: (this.totalPoints == 0?"red":"")}, 
                        {x:1, y:3, color: (this.totalPoints == 1?"red":"")},
                        {x:2, y:12, color: (this.totalPoints == 2?"red":"")}, 
                        {x:3, y:25,  color: (this.totalPoints == 3?"red":"")}, 
                        {x:4, y:50, color: (this.totalPoints == 4?"red":"")}, 
                        ]
                }]
            } ;
        }
    },    
    head() {
        return {
            title: "AREDS Simplified Severity Scale Calculator"
        };
    }
}

/* eslint-enable */
</script>

<style scoped>
    .error {
        font-size: 0.7em ;
        color: red ;
    }
</style>

