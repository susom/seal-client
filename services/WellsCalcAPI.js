import SealAPI from "./SealAPIService";

export default class WellsCalcAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 6 ;            
        this.seal = new SealAPI($axios) ;
    }

    patient() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/wellscalc/api/v1/patient?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    conditions() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/wellscalc/api/v1/conditions?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
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

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
