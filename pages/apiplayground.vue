<template>
    <!-- eslint-disable -->
    <b-container fluid>
        <b-row>
            <b-col cols="10">
                <p class="mt-2">
                    Explore & Test APIs
                </p>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="12" class="ml-2 pr-4">
                <b-card title="Patient" class="shadow-lg rounded-lg">
                    <b-card-text>
                        <b-row>
                            <b-col cols="5">
                                FHIR ID: <span class="ml-3 text-bold">{{$store.state.patientId}}</span>
                            </b-col>
                            <b-col cols="5">
                                Epic ID: <span class="ml-3 text-bold">{{patient.epicPatientId}}</span>
                            </b-col>                            
                        </b-row>
                        <b-row class="mt-3">
                            <b-col cols="10">                  
                                <span class="font-weight-bold mr-3">Endpoint for</span>
                                <b-form-select 
                                    v-model="exampleApi"
                                    :options="exampleOptions" 
                                    style="width:60%"
                                    @change="exampleApiChanged"                                 
                                    size="sm"/>                                
                            </b-col>
                        </b-row>
                        <b-row v-if="exampleApi != ''" class="mt-2">
                            <b-col>
                                <span v-html="exampleInfo" />
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>        
        <b-row class="mt-3">
            <b-col cols="12" class="ml-2 pr-4">
                <b-card title="API" class="shadow-lg rounded-lg">
                    <b-card-text>
                        <b-row>
                            <b-col cols="8">
                                <b-form-input
                                    id="filter-input"                            
                                    type="text"
                                    v-model="endpoint_url"                            
                                    placeholder="Endpoint URL"
                                    class="mb-2"
                                    size="sm"
                                ></b-form-input>                                
                            </b-col>
                            <b-col cols="2">
                                <b-form-select 
                                    v-model="url_type"
                                    :options="[{text: 'FHIR Endpoint', value: 'FHIR'}, {text: 'FHIR R4 Endpoint', value: 'FHIRR4'}, {text: 'Webservice Endpoint', value: 'WS'}]" 
                                    size="sm"/>
                            </b-col>
                            <b-col>
                                <b-btn size="sm" variant="primary" @click="fetchData">Fetch Data</b-btn>
                                <b-btn size="sm" variant="primary" @click="sendAGLData">Send AGL Messagae</b-btn>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col cols="10">
                                <b-textarea rows="4" size="sm" 
                                    v-model="post_data"
                                    placeholder="POST data to be submitted for the above Endpoint">                                    
                                </b-textarea> 
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>                
            </b-col>
        </b-row>
        <b-row class="mt-3">
            <b-col cols="12" class="ml-2 pr-4">
                <b-card title="Result"  class="shadow-lg rounded-lg">
                    <b-card-text>
                        <b-row>
                            <b-col cols="12">
                                <b-form-textarea max-rows="20" plaintext size="sm" v-model="result" id="result"/>                                
                            </b-col>
                        </b-row>
                    </b-card-text>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>

    var epicToken = "" ;
    
    function oLog(text) {
        document.getElementById("result").value = document.getElementById("result").value + "\n" + text  ;
    }

    function Listener(event) {
      oLog("********* In Listener method...") ;
      oLog(event) ;
        for (var type in event.data) {
            oLog("Inside loop type :" + type) ;            
            var payload = event.data[type];
            oLog("Payload ") ;
            oLog(JSON.stringify(payload)) ;
            // NDC 35356-0839
            switch (type) {
                case "token":
                    // this is the token passed down by Epic
                    // which every post message needs to include
                    epicToken = payload;
                    break;
                case "error":
                    // payload is an error string
                    break;
                case "actions":
                    // payload is a list of features (or actions)
                    for (var feature in payload) {
                        // feature is a string representing a single feature
                    }
                    break;
                case "state":
                    // payload is some state which you have saved
                    // before AGL hibernated
                    break;
                case "actionExecuted":
                    // payload is a boolean set to "true" if the action
                    // completed, "false" otherwise
                    break;
                case "errorCodes":
                    // payload is an array of all errors which might have been // encountered
                    break;
                case "historyPackage":
                    // payload is an object that contains the history state you saved 
                    // as well as a Boolean indicating whether Hyperspace came out of hibernation
                    break;
                case "history":
                    // payload is a string that corresponds to the history button the user clicked
                    break;
                default:
                    // if new properties get implemented which are not
                    // handled above, you end up here
                    break;
            }
        }
    }

/* eslint-disable */

export default {
    data () {
        return {
            patient: {},
            exampleApi: '',
            exampleInfo: '',
            endpoint_url: '/',
            url_type: 'FHIR',
            post_data: '',
            result: '',
            exampleOptions: [{text: '', value: ''}, 
                {text: 'Patient - FHIR', value: 'Patient'}, 
                {text: 'MedicationStatement - FHIR', value: 'MedicationStatement'}, 
                {text: 'Observation - FHIR', value: 'Observation'}, 
                {text: 'Encounter - FHIR', value: 'Encounter'}, 
                {text: 'MedicationRequest - FHIR', value: 'MedicationRequest'}, 
                {text: 'Condition - FHIR', value: 'Condition'}, 
                {text: 'GetSurgicalHistory - WebService', value: 'GetSurgicalHistory'}, 
                {text: 'GetMedicationAdministrationHistory - WebService', value: 'GetMedicationAdministrationHistory'} 
                ]
        }
    },
    async fetch() {

        console.log("In mounted method of the api playground page") ;        
        this.$store.commit('setAppId', 1) ;
        this.$services.a3pain.dblog("APIHome", "In API Playground Home Page") ;
        this.$store.commit('setPageTitle', "SEAL Explore APIs") ;

        this.patient = await this.$services.a3pain.patient() ;
    },
    mounted() {
        try {
            this.result += "\nIn mounted method... adding windows listener" ;
            window.addEventListener("message", Listener, false);
            this.result += "\nIn mounted method... sending post messaagae" ;
            // Request the initial handshake
            window.parent.postMessage({
                "action": "Epic.Clinical.Informatics.Web.InitiateHandshake"
            }, "*");    
        } catch (err) {
            this.result += "\nError in mounnt method :" + err ;
        }
    },
    computed : {

    },
    methods : {
        fetchData() {

            var config = {} ;
            
            config.curl = this.endpoint_url ;
            config.urlType = this.url_type ;
            config.postData = this.post_data ;
            config.epicPatientId = this.patient.epicPatientId ;

            this.$axios.post("/fhir-app/play/api/v1/fetchdata?aid=1&pid=" + this.$store.state.patientId, config)
                .then(response => {
                    this.result = response.data ;
                })
                .catch (error => {
                    this.result = error ;
                }) ;
        },
        sendAGLData() {
            console.log("epicToken :" + window.epicToken) ;
            if (!window.epicToken)  window.epicToken = "wrongone" ;
            this.post_data = this.post_data.replace('<epicToken>', window.epicToken) ;
            console.log("Sending JSON Data :" + this.post_data) ;
            var mesg = JSON.parse(this.post_data) ;
            window.parent.postMessage(mesg, "*");
        },
        exampleApiChanged() {
            if (this.exampleApi == 'MedicationStatement') {
                this.exampleInfo = '/MedicationStatement?patient=&lt;pid&gt;&status=active,completed,stopped,on-hold' ;
            } else if (this.exampleApi == 'Observation') {
                this.exampleInfo = '/Observation?patient=&lt;pid&gt;&category=laboratory&date=geYYYY-MM-DD&date=leYYYY-MM-DD' + 
                                   '<br>/Observation?patient=&lt;pid&gt;&category=vital-signs&date=geYYYY-MM-DD&date=leYYYY-MM-DD' + 
                                   '<br>/Observation?patient=&lt;pid&gt;&code=&lt;loinc&gt;&date=geYYYY-MM-DD&date=leYYYY-MM-DD' ;
            } else if (this.exampleApi == 'Patient') {
                this.exampleInfo = '/Patient?_id=&lt;pid&gt;' ;
            } else if (this.exampleApi == 'Encounter') {
                this.exampleInfo = '/Encounter??patient=&lt;pid&gt;' ;                                
            } else if (this.exampleApi == 'Condition') {
                this.exampleInfo = '/Condition??patient=&lt;pid&gt;' ;                                
            } else if (this.exampleApi == 'MedicationRequest') {
                this.exampleInfo = '/MedicationRequest?_id=&lt;ids&gt;' ;                
            } else if (this.exampleApi == 'GetMedicationAdministrationHistory') {
                this.exampleInfo = '/api/epic/2014/Clinical/Patient/GETMEDICATIONADMINISTRATIONHISTORY/MedicationAdministration' ;
            } else if (this.exampleApi == 'GetSurgicalHistory') {
                this.exampleInfo = '/api/epic/2010/Clinical/Patient/GETSURGICALHISTORY/SurgicalHistory?PatientId=&lt;epid&gt;&PatientIdType=External' ;
            } else 
            {
                this.exampleInfo = '' ;
            }
        }
    }
}
</script>

<style scoped>

</style>