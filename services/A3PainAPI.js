/* eslint-disable */

import SealAPI from "./SealAPIService";

export default class A3PainAPI {

    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 7 ;            
        this.seal = new SealAPI($axios) ;
    }

    patient() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/patient?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    encounters(start_date, end_date) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/enc?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                    "&start_date=" + start_date + "&end_date=" + end_date 
        }).then((response) => {            
            return response.data.data ;
        })        
    }
    
    medstats(start_date, end_date) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/med?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                 "&start_date=" + start_date + "&end_date=" + end_date 
        }).then((response) => {            
            return response.data ;
        })        
    }

    pain(start_date, end_date, epic_patient_id) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/pain?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                "&start_date=" + start_date + "&end_date=" + end_date + "&epicPatientId=" + epic_patient_id
        }).then((response) => {            
            return response.data ;
        })        
    }

    mmedata() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/mmedata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    heartRate() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/wellscalc/api/v1/heartrate?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        })          
    }

    mardata(wsjson) {
        var wscalls = [] ;

        Object.keys(wsjson).forEach(csn => {
            console.log("getting mar data for " + csn + " json :" + JSON.stringify(wsjson[csn])) ;
            
            if (wsjson[csn].OrderIDs.length > 0) {  // skip if there are no orders
                wscalls.push(this.axios
                    .post("/fhir-app/a3pain/api/v1/mardata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID, wsjson[csn])) ;
            }
        }) ;
        
        return Promise.all(wscalls) ;
        //return this.axios.all(wscalls) ;
    }

    painwsdata(csnids, epic_patient_id) {
        var wscalls = [] ;

        csnids.forEach(csn => {
            var wsjson = {
                "PatientID": epic_patient_id,
                "PatientIDType":"EXTERNAL",
                "ContactID": csn,
                "ContactIDType":"CSN",
                "LookbackHours":"72",
                "UserID":"",
                "UserIDType":"",
                "FlowsheetRowIDs":[{"ID":"30404607","Type":"EXTERNAL"}]
            } ;
            console.log("getting mar data for " + csn + " json :" + JSON.stringify(wsjson)) ;

            wscalls.push(this.axios
                .post("/fhir-app/a3pain/api/v1/painwsdata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID, wsjson)) ;
            
        }) ;
        
        return Promise.all(wscalls) ;
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
/* eslint-enable */
