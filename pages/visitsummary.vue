<template>
    <!-- eslint-disable -->
    <b-container fluid  class="nopadding">
        <b-row class="my-2" no-gutters>
            <b-col sm="2" xl="1" class="text-center">
                <b-img src="oph-synopsis-app.png" style="height:100px"></b-img>
            </b-col>
            <b-col sm="9" xl="10" class="text-left">
                <p class="pt-2">
                    Ophthalmology Visit Summary is an app developed by SEAL, designed to summarize key elements of a patient’s ophthalmologic history
                </p>
                <!--    
                <p>
                    The app uses a simplified methodology to calculate a risk score and the corresponding 5-year risk of progression to 
                    advanced age-related macular degeneration (AMD).
                </p>
                -->
            </b-col>
        </b-row>

        <b-row>
            <b-col cols="11" class="ml-2 pr-4">
                <b-card title="Visit Summary"  class="shadow-lg rounded-lg">
                    <b-card-text>
                        <b-row>
                            <b-col cols="12">
                                <b-form-textarea max-rows="50" plaintext size="sm" v-model="visitSummary" id="visitSummary"/>
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>                
            </b-col>
        </b-row>
        
        <b-row>
            <b-col cols="11" class="mt-3 ml-2 pr-4">
                <b-btn @click="printSummary()" variant="primary" size="sm" class="mb-2">Print Summary</b-btn>
                <iframe id="printFrame" name="printFrame" style="display:none;"/>
            </b-col>
        </b-row>

        <b-row class="mt-3 ml-2" v-if="$store.getters.sealTeam">
            <b-col cols="11">
                <b-link @click="showDebug = !showDebug" style="font-size:small">Logs Link</b-link>
                <b-card v-show="showDebug">                    
                    <b-card-title>Debug Info</b-card-title>
                    <b-card-text>
                        <b-textarea v-model="logMesg" rows="10" auto-grow />
                    </b-card-text>
                </b-card>
            </b-col>                        
        </b-row>

        <b-modal id="visitsummary-help-modal" size="xl" centered hide-footer title="App Instructions and Helpful Tips" 
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
</template>

<script>

export default {    
    data () {
        return {
            patient: {},                 
            ophConditions: [],     
            showDebug: false,
            visitSummary: "",
            logText: ""
        }
    },
    async fetch() {

        this.$store.commit('setAppId', this.$services.synopsis.APP_ID) ;
        this.$services.visitsummary.dblog("VisitSummaryHome", "In Ophthamology Visit Summary Home Page") ;
        this.$store.commit('setPageTitle', "Ophthamology Visit Summary") ;  
        
        this.patient = await this.$services.seal.patient(this.$services.visitsummary.APP_ID) ;        
        var nextVisitInfo = await this.$services.visitsummary.nextvisit() ;        
        this.log("Next Visit Summary :" + JSON.stringify(nextVisitInfo)) ;

        this.ophConditions = await this.$services.visitsummary.ophconditions() ;
        this.log("Oph Conditions :" + JSON.stringify(this.ophConditions))

        var physicians = await this.$services.visitsummary.physicians() ;
        //sort by desc - so most recent visited physician comes on top
        physicians.sort( (a,b) => b.max_visit_date_long - a.max_visit_date_long) ;
        this.log("Oph Physicians :" + JSON.stringify(physicians))

        var _self = this ;
        var visitSummary = "" ;
        try {
            visitSummary = (this.patient.firstName + ", " + this.patient.lastName).padEnd(50) + " MRN: " + this.patient.mrn + "\n" ;
            if (!nextVisitInfo.visit_type) nextVisitInfo.visit_type = "" ;
            visitSummary += nextVisitInfo.visit_type.padEnd(50) ;
            if (nextVisitInfo.visit_date_long) visitSummary += "  Date: " + this.$moment(nextVisitInfo.visit_date_long).format("MM/DD/YYYY") + "\n";
            visitSummary += "\n------------------------------------\n" ;
            visitSummary += "Ophtho Problems:\n" ;
            this.ophConditions.forEach(cond => {
                visitSummary += cond.condition + "\n" ;            
            })
        } catch (err) {
            this.log("Error in Ophtho Problems: " + err) ;
        }
        try {
            var today = this.$moment().format("YYYY-MM-DD") ;
            var startdate = this.$moment().add(-15, 'years').format("YYYY-MM-DD") ;
            var evisits = await this.$services.synopsis.eyevisits(startdate, today) ;
            // sort in desc order
            evisits.sort((a, b) => b.enc_start_time_long - a.enc_start_time_long) ;
            this.log("Sorted Encounters: " + JSON.stringify(evisits)) ;            
            for (var i=0;i<evisits.length;i++) {
                var data = await this.$services.synopsis.smartdatavalue(evisits[i].fhir_id) ;
                this.log("Response Data for : " + evisits[i].fhir_id + " : " + JSON.stringify(data)) ; 
                if (data.dt) {
                    visitSummary += "\n------------------------------------\n" ;
                    visitSummary += "Ophthalmology vision exam:\n" ;
                    visitSummary += this.$moment(evisits[i].enc_start_time_long).format("MM/DD/YYYY") + "\n" ;
                    // data exists and hence break ;
                    if (data.RVA || data.LVA) 
                        visitSummary += "Visual acuity: R: " + (data.Rvalue?data.Rvalue:"") + " L:" + (data.Lvalue?data.Lvalue:"") + "\n";
                    if (data.RIOP || data.LIOP) 
                        visitSummary += "Pressure: R: " + (data.RIOPValue?data.RIOPValue:"") + " L:" + (data.LIOPValue?data.LIOPValue:"") + "\n";
                    if (data.RTON || data.LTON) 
                        visitSummary += "Tonometry: R: " + (data.RTONValue?data.RTONValue:"") + " L:" + (data.LTONValue?data.LTONValue:"") + "\n";
                    if (data.RDIL || data.LDIL) 
                        visitSummary += "Dilation: R: " + (data.RDILValue?data.RDILValue:"") + " L:" + (data.LDILValue?data.LDILValue:"") + "\n"; 
                    break ;
                }                                  
            }
        } catch (err) {
            this.log("Error in vision exam results: " + err) ;
        }

        if (physicians.length > 0) {
            visitSummary += "\n------------------------------------\n" ;

            visitSummary += "Physician".padEnd(50) + "Most recent visit".padEnd(20) + "Total Number of Visits" + "\n";
            physicians.forEach(phy => {
                visitSummary += phy.physicianName.padEnd(50) + this.$moment(phy.max_visit_date_long).format("MM/DD/YYYY").padEnd(20) + "\t\t" + phy.number_of_visits + "\n" ;
            }) ;
        }

        try {
            var ophTests = await this.$services.synopsis.ophtests(this.patient.epicPatientId, startdate, today) ;
            var summaryTests = [] ;
            ophTests.forEach(oTest => {
                var sIdx = summaryTests.findIndex(x => x.proc_name == oTest.proc_name) ;
                if (sIdx >= 0) {
                    summaryTests[sIdx].count++ ;
                    var dt_long = _self.$moment(oTest.dtstart, "MM/DD/YYYY").valueOf() ;
                    if (summaryTests[sIdx].most_recent_date_long < dt_long)
                        summaryTests[sIdx].most_recent_date_long = dt_long ;
                } else {
                    summaryTests.push({
                        proc_name: oTest.proc_name,
                        count: 1,
                        most_recent_date_long: _self.$moment(oTest.dtstart, "MM/DD/YYYY").valueOf()
                    })
                }
            }) ;
            summaryTests.sort( (a,b) => b.most_recent_date_long - a.most_recent_date_long) ;
            if (summaryTests.length > 0) {
                visitSummary += "\n------------------------------------\n" ;

                visitSummary += "Test".padEnd(50) + "Most recent".padEnd(20) + "Total number of tests" + "\n";
                summaryTests.forEach(test => {
                    visitSummary += test.proc_name.padEnd(50) + this.$moment(test.most_recent_date_long).format("MM/DD/YYYY").padEnd(20) + "\t\t" + test.count + "\n" ;
                }) ;
            }
        } catch (err) {
            this.log("Error in Exam/Tests loop : " + err) ;
        }
        this.visitSummary = visitSummary ;        
    },
    mounted() {
        this.visitSummary = "Fetching data..." ; 
    },  
    computed : {

    },
    methods : {
        log(mesg) {
            console.log(mesg) ;
            this.logMesg += "\n" + this.$moment().format("LTS") + ": " + mesg ;
        },
        printSummary() {
            var printContents = document.getElementById('visitSummary').value ;
            printContents = "Visit Summary\n\n" + printContents.replaceAll("\n", "<br>") ;
            var printFrame = document.getElementById("printFrame") ;
            var contentWindow = printFrame.contentWindow ;
            contentWindow.document.body.innerHTML = printContents ;
            var result = contentWindow.document.execCommand('print', false, null);
            if(!result)  contentWindow.print();
        }
    }
}
</script>

<style scoped>
    .chart-title {
        color: rgb(54,38, 115) ;
        font-size: 1.1em ;
    }
</style>
